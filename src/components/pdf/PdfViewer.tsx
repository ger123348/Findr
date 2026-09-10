'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Spinner } from '@/components/ui/Spinner';
import { KeywordItem } from '@/types';

// Use local worker for reliability
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
  keywords: KeywordItem[];
}

export interface PdfViewerHandle {
  scrollToPage: (pageNum: number) => void;
}

// Vivid colors for highlights
const VIVID_MAP: Record<string, string> = {
  '#FFD6D6': 'rgba(255, 120, 120, 0.45)',
  '#D6EAFF': 'rgba(100, 170, 255, 0.45)',
  '#D6FFE4': 'rgba(100, 220, 140, 0.45)',
  '#FFF3D6': 'rgba(255, 220, 60, 0.5)',
  '#F0D6FF': 'rgba(190, 120, 255, 0.45)',
  '#FFE6D6': 'rgba(255, 160, 100, 0.45)',
  '#D6FDFF': 'rgba(100, 220, 235, 0.45)',
  '#FFD6F5': 'rgba(255, 120, 210, 0.45)',
  '#E8FFD6': 'rgba(170, 235, 100, 0.45)',
  '#D6D6FF': 'rgba(140, 140, 255, 0.45)',
};

function getHighlightColor(keyword: KeywordItem): string {
  return VIVID_MAP[keyword.color] || 'rgba(255, 255, 0, 0.5)';
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(function PdfViewer({ pdfUrl, keywords }, ref) {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState(1.3);
  const [currentPage, setCurrentPage] = useState(1);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  const scrollToPage = (pageNum: number) => {
    const el = pageRefs.current.get(pageNum);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentPage(pageNum);
  };

  useImperativeHandle(ref, () => ({ scrollToPage }));

  // Custom text renderer to inject <mark> natively in react-pdf
  const textRenderer = useCallback(
    (textItem: { str: string; itemIndex: number }) => {
      const text = textItem.str;
      if (!text || keywords.length === 0) return text;

      // Create a combined regex for all keywords
      const patterns = keywords.map(k => escapeRegex(k.text)).join('|');
      const regex = new RegExp(`(${patterns})`, 'gi');

      const parts = text.split(regex);

      // Map segments back to React elements
      return parts.map((part, index) => {
        // Find if this part matches any keyword
        const matchedKw = keywords.find(k => k.text.toLowerCase() === part.toLowerCase());
        
        if (matchedKw) {
          const color = getHighlightColor(matchedKw);
          return (
            <mark
              key={index}
              style={{
                backgroundColor: color,
                color: 'transparent',
                borderRadius: '2px',
                padding: '0 1px'
              }}
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    },
    [keywords]
  );

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white/60 dark:bg-white/5 backdrop-blur-md border-b border-gray-200/30 dark:border-white/5 rounded-t-2xl sm:rounded-t-3xl sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
          <Layers size={15} className="text-gray-400 dark:text-gray-500" />
          <span className="tabular-nums">
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : '...'}
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button onClick={() => scrollToPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1 || totalPages === 0} className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages || totalPages === 0} className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
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

      {/* Pages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center">
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
              <span>Gagal memuat PDF</span>
            </div>
          }
        >
          {Array.from(new Array(totalPages), (el, index) => (
            <div
              key={`page_${index + 1}`}
              ref={(elem) => { if (elem) pageRefs.current.set(index + 1, elem); }}
              onMouseEnter={() => setCurrentPage(index + 1)}
              className="mb-4 shadow-lg bg-white relative"
            >
              <Page
                pageNumber={index + 1}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={true}
                // @ts-expect-error - react-pdf allows returning React nodes at runtime despite the string type definition
                customTextRenderer={textRenderer}
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full z-50 pointer-events-none">
                {index + 1}
              </div>
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
});
