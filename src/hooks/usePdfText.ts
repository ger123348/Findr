'use client';

import { useState, useEffect } from 'react';
import { PdfPage } from '@/types';

interface UsePdfTextResult {
  pages: PdfPage[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
}

/**
 * Hook that loads a PDF from a URL using PDF.js and extracts
 * the full text content from every page.
 * 
 * Pages use 1-based indexing (pageIndex = 1, 2, 3, ...)
 * to match PDF.js and react-pdf conventions.
 */
export function usePdfText(pdfUrl: string | null): UsePdfTextResult {
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;

    async function extractText() {
      setIsLoading(true);
      setError(null);
      setPages([]);

      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl!,
          withCredentials: false,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setTotalPages(pdf.numPages);
        const extractedPages: PdfPage[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const text = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');

          // Use 1-based page indexing to match PDF.js / react-pdf
          extractedPages.push({ pageIndex: i, text });
        }

        if (!cancelled) {
          setPages(extractedPages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    extractText();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return { pages, isLoading, error, totalPages };
}
