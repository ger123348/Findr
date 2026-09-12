'use client';

import { motion } from 'framer-motion';
import { Trash2, Home } from 'lucide-react';
import Link from 'next/link';
import { KeywordInput } from './KeywordInput';
import { KeywordSummary } from './KeywordSummary';
import { useDocumentStore } from '@/store/documentStore';
import { KeywordResult } from '@/types';

interface SearchPanelProps {
  results: KeywordResult[];
  isTextLoading: boolean;
  onNavigateToPage?: (pageNum: number, keywordId?: string, matchIndex?: number) => void;
}

export function SearchPanel({ results, isTextLoading, onNavigateToPage }: SearchPanelProps) {
  const { keywords, clearKeywords } = useDocumentStore();

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3 md:h-full md:min-h-0"
    >
      {/* Search input section — fixed, never scrolls */}
      <div className="glass-card rounded-[1.5rem] p-4 sm:p-5 space-y-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Kata Kunci
          </h2>
          {keywords.length > 0 && (
            <button
              onClick={clearKeywords}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
              aria-label="Hapus semua kata kunci"
            >
              <Trash2 size={13} strokeWidth={2.5} />
              Hapus semua
            </button>
          )}
        </div>
        <KeywordInput />
      </div>

      {/* Summary / results section — takes remaining space, scrollable internally */}
      {keywords.length > 0 && (
        <div className="md:flex-1 md:min-h-0 md:overflow-hidden h-auto">
          <KeywordSummary results={results} isLoading={isTextLoading} onNavigateToPage={onNavigateToPage} />
        </div>
      )}

      {/* Footer: Back to home — always at bottom */}
      <div className="shrink-0 flex justify-center">
        <Link href="/" passHref legacyBehavior>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-2.5 px-5 rounded-full glass-card glass-card-hover"
          >
            <Home size={14} />
            Unggah dokumen baru
          </motion.a>
        </Link>
      </div>
    </motion.aside>
  );
}
