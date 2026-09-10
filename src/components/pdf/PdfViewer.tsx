'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { PdfSkeletonLoader } from '@/components/ui/SkeletonLoader';
import { KeywordItem } from '@/types';
import { highlightTextLayer, resetHighlights } from '@/lib/pdfHighlighter';

interface PdfViewerProps {
  pdfUrl: string;
  keywords: KeywordItem[];
}

interface PageRenderState {
  isRendering: boolean;
  hasError: boolean;
}

// We render each page inside its own canvas+textLayer container
function PdfPage({
  pdf,
  pageNumber,
  scale,
  keywords,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any;
  pageNumber: number;
  scale: number;
  keywords: KeywordItem[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PageRenderState>({ isRendering: true, hasError: false });
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const renderPage = useCallback(async () => {
    if (!canvasRef.current || !textLayerRef.current) return;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    setState({ isRendering: true, hasError: false });

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({
        canvasContext: context,
        viewport,
      });

      renderTaskRef.current = renderTask;
      await renderTask.promise;

      // Render text layer for highlights
      const textContent = await page.getTextContent();
      const textLayerDiv = textLayerRef.current;

      if (textLayerDiv) {
        textLayerDiv.innerHTML = '';
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;

        // pdfjs-dist v5: use the TextLayer class (renderTextLayer was removed)
        const { TextLayer } = await import('pdfjs-dist');
        const textLayer = new TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport,
        });

        await textLayer.render();

        // Apply highlights after text layer renders
        highlightTextLayer(textLayerDiv, keywords);
      }

      setState({ isRendering: false, hasError: false });
    } catch (err: unknown) {
      // Cancelled renders are not errors
      if (err instanceof Error && err.name === 'RenderingCancelledException') return;
      console.error(`Failed to render page ${pageNumber}:`, err);
      setState({ isRendering: false, hasError: true });
    }
  }, [pdf, pageNumber, scale, keywords]);

  useEffect(() => {
    renderPage();
    return () => {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    };
  }, [renderPage]);

  // Re-apply highlights when keywords change without re-rendering canvas
  useEffect(() => {
    if (textLayerRef.current && !state.isRendering) {
      resetHighlights(textLayerRef.current);
      highlightTextLayer(textLayerRef.current, keywords);
    }
  }, [keywords, state.isRendering]);

  return (
    <div className="relative shadow-lg rounded-xl sm:rounded-2xl overflow-hidden bg-white">
      {/* Page number badge */}
      <div className="absolute top-3 left-3 z-20 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm tabular-nums">
        {pageNumber}
      </div>

      {/* Loading overlay */}
      {state.isRendering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Spinner size={28} className="text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {state.hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-50 text-red-400 gap-2">
          <span className="text-2xl">⚠️</span>
          <span className="text-sm font-medium">Halaman gagal dimuat</span>
        </div>
      )}

      {/* Canvas for visual render */}
      <canvas ref={canvasRef} className="block w-full h-auto" />

      {/* Text layer for highlight injection — positioned absolutely over canvas */}
      <div
        ref={textLayerRef}
        className="textLayer absolute top-0 left-0 select-text"
        style={{ pointerEvents: 'none', userSelect: 'text' }}
      />
    </div>
  );
}

export function PdfViewer({ pdfUrl, keywords }: PdfViewerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdf, setPdf] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl, withCredentials: false });
        const pdfDoc = await loadingTask.promise;

        if (!cancelled) {
          setPdf(pdfDoc);
          setTotalPages(pdfDoc.numPages);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Gagal memuat PDF.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  const scrollToPage = (pageNum: number) => {
    const el = pageRefs.current.get(pageNum);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentPage(pageNum);
  };

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center text-red-500 dark:text-red-400 flex-col gap-3">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm font-medium">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white/60 dark:bg-white/5 backdrop-blur-md border-b border-gray-200/30 dark:border-white/5 rounded-t-2xl sm:rounded-t-3xl sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
          <Layers size={15} className="text-gray-400 dark:text-gray-500" />
          <span className="tabular-nums">
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : '...'}
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Page navigation */}
          <button
            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
          </button>

          <div className="w-px h-5 bg-gray-200/50 dark:bg-white/10 mx-1 hidden sm:block" />

          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:flex"
            aria-label="Perkecil"
          >
            <ZoomOut size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-12 text-center tabular-nums hidden sm:block">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:flex"
            aria-label="Perbesar"
          >
            <ZoomIn size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Pages scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-gray-100/50 dark:bg-black/20 p-3 sm:p-4 space-y-4 rounded-b-2xl sm:rounded-b-3xl"
      >
        {isLoading ? (
          <PdfSkeletonLoader pages={3} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                ref={(el) => {
                  if (el) pageRefs.current.set(pageNum, el);
                }}
                onMouseEnter={() => setCurrentPage(pageNum)}
              >
                <PdfPage
                  pdf={pdf}
                  pageNumber={pageNum}
                  scale={scale}
                  keywords={keywords}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
