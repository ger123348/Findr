'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { KeywordItem } from '@/types';

export function KeywordInput() {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addKeyword = useDocumentStore((s) => s.addKeyword);
  const removeKeyword = useDocumentStore((s) => s.removeKeyword);
  const keywords = useDocumentStore((s) => s.keywords);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed) {
        addKeyword(trimmed);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword on Backspace when input is empty
      removeKeyword(keywords[keywords.length - 1].id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Spotlight-style input container */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(59,130,246,0.2), 0 8px 30px rgba(0,0,0,0.08)'
            : '0 4px 20px rgba(0,0,0,0.03)',
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 bg-white/50 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/80 cursor-text transition-colors hover:bg-white/70"
        onClick={() => inputRef.current?.focus()}
      >
        <Search
          size={16}
          className={`shrink-0 transition-colors ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ketik kata kunci, tekan Enter..."
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none min-w-0"
          aria-label="Masukkan kata kunci pencarian"
          id="keyword-search-input"
        />
        {inputValue && (
          <button
            onClick={() => setInputValue('')}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Hapus input"
          >
            <X size={14} />
          </button>
        )}
      </motion.div>

      {/* Helper text */}
      <p className="text-xs text-gray-400 px-1">
        Tekan <kbd className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">Enter</kbd> untuk tambah tag ·{' '}
        <kbd className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">⌫</kbd> untuk hapus terakhir
      </p>

      {/* Keyword tag badges */}
      <AnimatePresence>
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 pt-1"
          >
            {keywords.map((kw) => (
              <KeywordBadge key={kw.id} keyword={kw} onRemove={removeKeyword} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeywordBadge({
  keyword,
  onRemove,
}: {
  keyword: KeywordItem;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex items-center gap-1.5 rounded-full pl-3 pr-2 py-1 text-xs font-semibold"
      style={{ backgroundColor: keyword.color, color: keyword.textColor }}
    >
      <span>{keyword.text}</span>
      <button
        onClick={() => onRemove(keyword.id)}
        className="flex items-center justify-center w-4 h-4 rounded-full transition-opacity hover:opacity-70"
        style={{ color: keyword.textColor }}
        aria-label={`Hapus kata kunci "${keyword.text}"`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}
