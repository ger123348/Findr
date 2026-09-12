'use client';

import { useMemo } from 'react';
import { KeywordItem, KeywordResult, PdfPage } from '@/types';
import { extractMatchesContext } from '@/lib/pdfHighlighter';

/**
 * Computes total occurrence counts and extracts context snippets for each keyword across all PDF pages.
 * Returns a list of KeywordResult objects.
 */
export function useKeywordSearch(
  pages: PdfPage[],
  keywords: KeywordItem[]
): KeywordResult[] {
  return useMemo(() => {
    if (!pages.length || !keywords.length) return [];

    return keywords.map((kw) => {
      const matches = pages.map((page) => {
        const { count, snippets } = extractMatchesContext(page.text, kw.text);
        return {
          pageIndex: page.pageIndex,
          count,
          snippets,
        };
      });

      const totalCount = matches.reduce((sum, m) => sum + m.count, 0);

      return {
        keyword: kw,
        totalCount,
        matches: matches.filter((m) => m.count > 0),
      };
    });
  }, [pages, keywords]);
}
