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
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Rekap Pencarian
          </span>
        </div>
        {totalOccurrences > 0 && (
          <span className="text-xs font-medium text-gray-400">
            {totalOccurrences} total
          </span>
        )}
      </div>

      {/* Results list */}
      <div className="divide-y divide-gray-50">
        <AnimatePresence>
          {results.map((result, i) => (
            <motion.div
              key={result.keyword.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Color indicator dot */}
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white"
                style={{ backgroundColor: result.keyword.textColor }}
              />

              {/* Keyword text */}
              <div
                className="flex-1 rounded-full px-2.5 py-0.5 text-xs font-semibold truncate max-w-[140px]"
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
                  <span className="h-4 w-8 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <motion.span
                    key={result.totalCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className={`text-sm font-bold tabular-nums ${
                      result.totalCount > 0 ? 'text-gray-800' : 'text-gray-300'
                    }`}
                  >
                    {result.totalCount}
                  </motion.span>
                )}
                <Hash size={10} className="text-gray-300" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state per keyword */}
        {!isLoading && results.every((r) => r.totalCount === 0) && results.length > 0 && (
          <div className="px-4 py-3 text-center text-xs text-gray-400">
            Tidak ada kecocokan ditemukan
          </div>
        )}
      </div>
    </motion.div>
  );
}
