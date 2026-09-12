'use client';

import { motion } from 'framer-motion';
import { DropZone } from '@/components/upload/DropZone';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemeStore } from '@/store/themeStore';

export function HomeContent() {
  const theme = useThemeStore((s) => s.theme);
  const logoSrc = theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[#F5F5F7] dark:bg-[#0A0A0F] transition-colors duration-1000 ease-in-out">
      {/* Header / Nav */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <img
              src={logoSrc}
              alt="Findr Logo"
              className="h-8 w-8 object-contain rounded-full"
              style={{
                filter: theme === 'dark'
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 20px rgba(255,255,255,0.25))'
                  : 'drop-shadow(0 0 8px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(0,0,0,0.15))',
              }}
            />
            <span className="font-bold text-gray-900 dark:text-white tracking-tight text-lg">Findr</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.05] mb-4 sm:mb-5 max-w-3xl"
        >
          Temukan setiap kata{' '}
          <span className="text-blue-600 dark:text-blue-500">
            sekaligus.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-md mb-8 sm:mb-10 leading-relaxed"
        >
          Upload PDF, tambahkan kata kunci, dan lihat semua kecocokan ter-highlight otomatis
          dengan warna berbeda per kata.
        </motion.p>

        {/* DropZone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex justify-center"
        >
          <DropZone />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
        Findr · Dokumen Anda aman diproses secara lokal
      </footer>
    </main>
  );
}
