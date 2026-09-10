'use client';

import { useMemo } from 'react';
import { KeywordItem, KeywordResult, PdfPage } from '@/types';
import { countOccurrences } from '@/lib/pdfHighlighter';

/**
 * Computes total occurrence counts for each keyword across all PDF pages.
 * Returns a sorted list of KeywordResult objects.
 */
export function useKeywordSearch(
  pages: PdfPage[],
  keywords: KeywordItem[]
): KeywordResult[] {
  return useMemo(() => {
    if (!pages.length || !keywords.length) return [];

    return keywords.map((kw) => {
      const matches = pages.map((page) => ({
        pageIndex: page.pageIndex,
        count: countOccurrences(page.text, kw.text),
      }));

      const totalCount = matches.reduce((sum, m) => sum + m.count, 0);

      return {
        keyword: kw,
        totalCount,
        matches: matches.filter((m) => m.count > 0),
      };
    });
  }, [pages, keywords]);
}
