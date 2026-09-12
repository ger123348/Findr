'use client';

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Mark from 'mark.js';
import { Spinner } from '@/components/ui/Spinner';
import { KeywordItem } from '@/types';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
  keywords: KeywordItem[];
}

export interface PdfViewerHandle {
  scrollToPage: (pageNum: number, keywordId?: string, matchIndex?: number) => void;
}

// ─── Vivid highlight colors ──────────────────────────────────
const VIVID_MAP: Record<string, string> = {
  '#FFD6D6': 'rgba(255, 100, 100, 0.5)',
  '#D6EAFF': 'rgba(80, 160, 255, 0.5)',
  '#D6FFE4': 'rgba(80, 210, 130, 0.5)',
  '#FFF3D6': 'rgba(255, 210, 50, 0.55)',
  '#F0D6FF': 'rgba(180, 100, 255, 0.5)',
  '#FFE6D6': 'rgba(255, 150, 80, 0.5)',
  '#D6FDFF': 'rgba(80, 220, 230, 0.5)',
  '#FFD6F5': 'rgba(255, 100, 200, 0.5)',
  '#E8FFD6': 'rgba(160, 230, 80, 0.5)',
  '#D6D6FF': 'rgba(120, 120, 255, 0.5)',
};

function getHighlightColor(kw: KeywordItem): string {
  return VIVID_MAP[kw.color] || 'rgba(255, 255, 0, 0.5)';
}

// ─── Single PDF Page with mark.js highlighting ───────────────
function PdfPageWithHighlight({
  pageNumber,
  scale,
  keywords,
}: {
  pageNumber: number;
  scale: number;
  keywords: KeywordItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textLayerReady, setTextLayerReady] = useState(0); // counter increments each render

  // When text layer finishes rendering, bump the counter
  const handleTextLayerSuccess = useCallback(() => {
    setTextLayerReady((v) => v + 1);
  }, []);

  // Reset when scale changes (react-pdf will re-render the page)
  useEffect(() => {
    setTextLayerReady(0);
  }, [scale]);

  // Run mark.js whenever text layer is ready OR keywords change
  useEffect(() => {
    if (textLayerReady === 0 || !containerRef.current) return;

    // Find the react-pdf text layer div
    const textLayerDiv = containerRef.current.querySelector(
      '.react-pdf__Page__textContent'
    ) as HTMLElement | null;

    if (!textLayerDiv) return;

    const markInstance = new Mark(textLayerDiv);

    // First clear old highlights
    markInstance.unmark({
      done: () => {
        // Then apply all keywords
        keywords.forEach((kw) => {
          const color = getHighlightColor(kw);
          markInstance.mark(kw.text, {
            acrossElements: true,
            separateWordSearch: false,
            className: 'findr-hl',
            each: (elem: Element) => {
              const el = elem as HTMLElement;
              el.style.setProperty('background-color', color, 'important');
              el.style.setProperty('color', 'transparent', 'important');
              el.style.setProperty('border-radius', '3px', 'important');
              el.style.setProperty('padding', '2px 0', 'important');
              el.style.setProperty('mix-blend-mode', 'multiply', 'important');
              el.dataset.keywordId = kw.id;
            },
          });
        });
      },
    });
  }, [textLayerReady, keywords]);

  return (
    <div ref={containerRef} className="relative mb-4 shadow-lg bg-white rounded-lg overflow-hidden">
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderAnnotationLayer={false}
        renderTextLayer={true}
        onRenderTextLayerSuccess={handleTextLayerSuccess}
      />
      <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-50 pointer-events-none tabular-nums">
        {pageNumber}
      </div>
    </div>
  );
}

// ─── PDF Viewer Container ────────────────────────────────────
export const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(
  function PdfViewer({ pdfUrl, keywords }, ref) {
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.3);
    const [currentPage, setCurrentPage] = useState(1);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) setScale(0.65);
        else if (window.innerWidth < 1024) setScale(1.0);
      }
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
      setTotalPages(numPages);
    };

    const scrollToPage = useCallback((pageNum: number, keywordId?: string, matchIndex?: number) => {
      const el = pageRefs.current.get(pageNum);
      if (el) {
        if (keywordId && matchIndex !== undefined) {
          // Attempt to find the specific mark on this page
          const marks = Array.from(el.querySelectorAll(`mark[data-keyword-id="${keywordId}"]`));
          const targetMark = marks[matchIndex];
          
          if (targetMark) {
            targetMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary glow effect so the user sees exactly which word it is
            (targetMark as HTMLElement).style.setProperty('box-shadow', '0 0 0 3px rgba(0, 122, 255, 0.8), 0 0 15px rgba(0, 122, 255, 0.5)', 'important');
            setTimeout(() => {
              (targetMark as HTMLElement).style.removeProperty('box-shadow');
            }, 1500);
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setCurrentPage(pageNum);
    }, []);

    useImperativeHandle(ref, () => ({ scrollToPage }), [scrollToPage]);

    const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
    const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

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
            <button
              onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="w-px h-5 bg-gray-200/50 dark:bg-white/10 mx-1 hidden sm:block" />
            <button onClick={handleZoomOut} className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:flex">
              <ZoomOut size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-12 text-center tabular-nums hidden sm:block">
              {Math.round(scale * 100)}%
            </span>
            <button onClick={handleZoomIn} className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:flex">
              <ZoomIn size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Pages */}
        <div className="flex-1 overflow-y-auto bg-gray-100/50 dark:bg-black/20 p-3 sm:p-4 flex flex-col items-center rounded-b-2xl sm:rounded-b-3xl">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-10">
                <Spinner size={32} className="text-gray-400" />
              </div>
            }
            error={
              <div className="flex flex-col items-center text-red-500 gap-2 p-10">
                <span className="text-3xl">⚠️</span>
                <span className="text-sm font-medium">Gagal memuat PDF</span>
              </div>
            }
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={`page_${pageNum}`}
                ref={(el) => { if (el) pageRefs.current.set(pageNum, el); }}
                onMouseEnter={() => setCurrentPage(pageNum)}
              >
                <PdfPageWithHighlight
                  pageNumber={pageNum}
                  scale={scale}
                  keywords={keywords}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    );
  }
);
