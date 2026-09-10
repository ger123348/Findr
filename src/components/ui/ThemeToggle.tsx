'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className="relative h-9 w-9 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-center transition-colors hover:bg-white/70 dark:hover:bg-white/20"
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
      >
        {theme === 'dark' ? (
          <Sun size={16} className="text-amber-400" />
        ) : (
          <Moon size={16} className="text-slate-600" />
        )}
      </motion.div>
    </motion.button>
  );
}
