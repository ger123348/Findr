'use client';

import { motion } from 'framer-motion';
import { FileText, Trash2, Home } from 'lucide-react';
import Link from 'next/link';
import { KeywordInput } from './KeywordInput';
import { KeywordSummary } from './KeywordSummary';
import { useDocumentStore } from '@/store/documentStore';
import { KeywordResult } from '@/types';

interface SearchPanelProps {
  results: KeywordResult[];
  isTextLoading: boolean;
}

export function SearchPanel({ results, isTextLoading }: SearchPanelProps) {
  const { documentName, keywords, clearKeywords } = useDocumentStore();

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex flex-col gap-4 h-full overflow-y-auto"
    >
      {/* Document info card */}
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/80 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/80 rounded-xl shrink-0 shadow-sm">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
              Dokumen Aktif
            </p>
            <p
              className="text-sm font-semibold text-gray-800 truncate"
              title={documentName || 'Dokumen'}
            >
              {documentName || 'Dokumen'}
            </p>
          </div>
        </div>
      </div>

      {/* Search input section */}
      <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-4 space-y-4 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Kata Kunci
          </h2>
          {keywords.length > 0 && (
            <button
              onClick={clearKeywords}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
              aria-label="Hapus semua kata kunci"
            >
              <Trash2 size={12} />
              Hapus semua
            </button>
          )}
        </div>
        <KeywordInput />
      </div>

      {/* Summary / results section */}
      {keywords.length > 0 && (
        <KeywordSummary results={results} isLoading={isTextLoading} />
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: Back to home */}
      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
      >
        <Home size={13} />
        Unggah dokumen baru
      </Link>
    </motion.aside>
  );
}
