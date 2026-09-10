'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, TrendingUp, ChevronDown, FileText } from 'lucide-react';
import { KeywordResult } from '@/types';

interface KeywordSummaryProps {
  results: KeywordResult[];
  isLoading: boolean;
  onNavigateToPage?: (pageNum: number) => void;
}

export function KeywordSummary({ results, isLoading, onNavigateToPage }: KeywordSummaryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          {results.map((result, i) => {
            const isExpanded = expandedId === result.keyword.id;
            const pagesWithMatches = result.matches.filter((m) => m.count > 0);

            return (
              <motion.div
                key={result.keyword.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* Main row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : result.keyword.id)}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/20 dark:hover:bg-white/3 transition-colors w-full text-left"
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

                  {/* Count badge + expand */}
                  <div className="flex items-center gap-1.5 shrink-0">
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

                    {pagesWithMatches.length > 0 && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
                      </motion.div>
                    )}
                  </div>
                </button>

                {/* Expanded: per-page breakdown */}
                <AnimatePresence>
                  {isExpanded && pagesWithMatches.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-3 pt-0.5 space-y-1">
                        {pagesWithMatches.map((match) => (
                          <button
                            key={match.pageIndex}
                            onClick={() => onNavigateToPage?.(match.pageIndex)}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs bg-gray-50/50 dark:bg-white/3 hover:bg-gray-100/80 dark:hover:bg-white/8 transition-colors group"
                          >
                            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                              <FileText size={12} />
                              Halaman {match.pageIndex}
                            </span>
                            <span
                              className="font-bold tabular-nums"
                              style={{ color: result.keyword.textColor }}
                            >
                              {match.count}×
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {!isLoading && results.every((r) => r.totalCount === 0) && results.length > 0 && (
          <div className="px-4 sm:px-5 py-4 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            Tidak ada kecocokan ditemukan
          </div>
        )}
      </div>
    </motion.div>
  );
}
