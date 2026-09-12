'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { playWhooshSound } from '@/lib/audio';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    playWhooshSound();
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative w-14 h-7 sm:w-16 sm:h-8 flex items-center rounded-full transition-colors duration-700 ease-in-out focus:outline-none shadow-inner border border-white/10 ${
        isDark ? 'bg-[#1C1C1E]' : 'bg-[#E5E5EA]'
      }`}
      style={{
        boxShadow: isDark 
          ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.05)' 
          : 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(255,255,255,0.5)',
      }}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`absolute flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-md ${
          isDark ? 'bg-[#2C2C2E] ml-auto right-1' : 'bg-white ml-1 left-0'
        }`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: isDark ? -90 : 90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: isDark ? 90 : -90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          {isDark ? (
            <Moon size={12} className="text-violet-400 fill-violet-400" />
          ) : (
            <Sun size={12} className="text-amber-500 fill-amber-500" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
}
