'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Hash, TrendingUp } from 'lucide-react';
import { KeywordResult } from '@/types';

interface KeywordSummaryProps {
  results: KeywordResult[];
  isLoading: boolean;
}

export function KeywordSummary({ results, isLoading }: KeywordSummaryProps) {
  if (results.length === 0 && !isLoading) return null;

  const totalOccurrences = results.reduce((sum, r) => sum + r.totalCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-[1.5rem] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-200/30 dark:border-white/5">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-gray-400 dark:text-gray-500" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
            Rekap
          </span>
        </div>
        {totalOccurrences > 0 && (
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
            {totalOccurrences} total
          </span>
        )}
      </div>

      {/* Results list */}
      <div className="divide-y divide-gray-100/50 dark:divide-white/5">
        <AnimatePresence>
          {results.map((result, i) => (
            <motion.div
              key={result.keyword.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/20 dark:hover:bg-white/3 transition-colors"
            >
              {/* Color indicator dot */}
              <div
                className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white/80 dark:ring-white/10 shadow-sm"
                style={{ backgroundColor: result.keyword.textColor }}
              />

              {/* Keyword text */}
              <div
                className="flex-1 rounded-full px-3 py-1 text-xs font-bold truncate max-w-[140px]"
                style={{
                  backgroundColor: result.keyword.color,
                  color: result.keyword.textColor,
                }}
                title={result.keyword.text}
              >
                {result.keyword.text}
              </div>

              {/* Count badge */}
              <div className="flex items-center gap-1 shrink-0">
                {isLoading ? (
                  <span className="h-5 w-10 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse" />
                ) : (
                  <motion.span
                    key={result.totalCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className={`text-sm font-black tabular-nums ${
                      result.totalCount > 0 ? 'text-gray-800 dark:text-white' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    {result.totalCount}
                  </motion.span>
                )}
                <Hash size={10} className="text-gray-300 dark:text-gray-600" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state per keyword */}
        {!isLoading && results.every((r) => r.totalCount === 0) && results.length > 0 && (
          <div className="px-4 sm:px-5 py-4 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            Tidak ada kecocokan ditemukan
          </div>
        )}
      </div>
    </motion.div>
  );
}
