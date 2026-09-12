'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, TrendingUp, ChevronDown, FileText } from 'lucide-react';
import { KeywordResult, SearchMatch } from '@/types';

interface KeywordSummaryProps {
  results: KeywordResult[];
  isLoading: boolean;
  onNavigateToPage?: (pageNum: number, keywordId?: string, matchIndex?: number) => void;
}

function PageMatchItem({ 
  match, 
  result, 
  isExpanded,
  onToggle,
  onNavigateToPage 
}: { 
  match: SearchMatch; 
  result: KeywordResult; 
  isExpanded: boolean;
  onToggle: () => void;
  onNavigateToPage?: (pageNum: number, keywordId?: string, matchIndex?: number) => void 
}) {
  return (
    <div className="space-y-1">
      {/* Page Header as a clickable dropdown toggle */}
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
          <FileText size={12} /> Halaman {match.pageIndex}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">{match.count} kata</span>
          <ChevronDown 
            size={14} 
            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>
      
      {/* Collapsible Snippets List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-1 pb-2 pl-2 pr-1 border-l-2 border-gray-100 dark:border-white/5 ml-3">
              {match.snippets?.map((snippet, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToPage?.(match.pageIndex, result.keyword.id, idx)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs leading-relaxed bg-gray-50/80 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100/50 dark:border-white/5 group"
                >
                  <span className="text-gray-500 dark:text-gray-400">{snippet.pre}</span>
                  <span 
                    className="font-bold mx-0.5 px-0.5 rounded-[3px] shadow-sm"
                    style={{ backgroundColor: result.keyword.color, color: result.keyword.textColor }}
                  >
                    {snippet.match}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{snippet.post}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function KeywordSummary({ results, isLoading, onNavigateToPage }: KeywordSummaryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedPageIndex, setExpandedPageIndex] = useState<number | null>(null);

  if (results.length === 0 && !isLoading) return null;

  const totalOccurrences = results.reduce((sum, r) => sum + r.totalCount, 0);

  return (
    <div className="glass-card rounded-[1.5rem] flex flex-col md:h-full md:overflow-hidden h-auto">
      {/* Header — fixed */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-200/30 dark:border-white/5 shrink-0">
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

      {/* Results list — scrollable on desktop, naturally grows on mobile */}
      <div className="md:flex-1 md:overflow-y-auto md:min-h-0 h-auto">
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
                    onClick={() => {
                      setExpandedId(isExpanded ? null : result.keyword.id);
                      setExpandedPageIndex(null);
                    }}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/20 dark:hover:bg-white/3 transition-colors w-full text-left"
                  >
                    <div
                      className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white/80 dark:ring-white/10 shadow-sm"
                      style={{ backgroundColor: result.keyword.textColor }}
                    />
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
                        <div className="px-4 sm:px-5 pb-4 pt-1 space-y-2">
                          {pagesWithMatches.map((match) => (
                            <PageMatchItem 
                              key={match.pageIndex}
                              match={match} 
                              result={result} 
                              isExpanded={expandedPageIndex === match.pageIndex}
                              onToggle={() => {
                                setExpandedPageIndex(
                                  expandedPageIndex === match.pageIndex ? null : match.pageIndex
                                );
                                onNavigateToPage?.(match.pageIndex);
                              }}
                              onNavigateToPage={onNavigateToPage} 
                            />
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
      </div>
    </div>
  );
}
