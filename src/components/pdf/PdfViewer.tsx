'use client';

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { KeywordItem } from '@/types';

interface PdfViewerProps {
  pdfUrl: string;
  keywords: KeywordItem[];
}

export interface PdfViewerHandle {
  scrollToPage: (pageNum: number) => void;
}

export const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(function PdfViewer({ pdfUrl, keywords }, ref) {
  const [currentPage, setCurrentPage] = useState(1);
  const embedRef = useRef<HTMLEmbedElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Navigate to a specific page by reloading embed with #page=N
  const scrollToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    // Use iframe approach for page navigation
    if (iframeRef.current) {
      iframeRef.current.src = `${pdfUrl}#page=${pageNum}`;
    }
  };

  useImperativeHandle(ref, () => ({
    scrollToPage,
  }));

  // Build the initial URL with toolbar options
  const viewerUrl = `${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&page=${currentPage}`;

  return (
    <div className="flex flex-col h-full">
      {/* Minimal toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white/60 dark:bg-white/5 backdrop-blur-md border-b border-gray-200/30 dark:border-white/5 rounded-t-2xl sm:rounded-t-3xl sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
          <Layers size={15} className="text-gray-400 dark:text-gray-500" />
          <span>PDF Viewer</span>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Gunakan <kbd className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md text-xs font-mono border border-gray-200/50 dark:border-white/10">Ctrl+F</kbd> untuk cari di PDF
        </div>
      </div>

      {/* Native PDF embed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 rounded-b-2xl sm:rounded-b-3xl overflow-hidden bg-gray-200 dark:bg-gray-900"
      >
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          className="w-full h-full border-0"
          title="PDF Document Viewer"
          style={{ minHeight: '100%' }}
        />
      </motion.div>
    </div>
  );
});
