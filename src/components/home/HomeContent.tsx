'use client';

import { motion } from 'framer-motion';
import { DropZone } from '@/components/upload/DropZone';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemeStore } from '@/store/themeStore';

export function HomeContent() {
  const theme = useThemeStore((s) => s.theme);
  const logoSrc = theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[#F5F5F7] dark:bg-[#0A0A0F] transition-colors duration-500">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb-float-1 absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-400/20 dark:from-blue-600/15 dark:to-indigo-800/10 blur-[120px]" />
        <div className="orb-float-2 absolute top-[15%] right-[-8%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-violet-300/25 to-purple-400/15 dark:from-violet-700/12 dark:to-purple-900/8 blur-[120px]" />
        <div className="orb-float-3 absolute bottom-[-15%] left-[15%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-cyan-200/20 to-blue-300/15 dark:from-cyan-800/10 dark:to-blue-900/8 blur-[140px]" />
      </div>

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
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-5 max-w-3xl"
        >
          Temukan setiap kata{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            sekaligus
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-md mb-10 sm:mb-14 leading-relaxed"
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
