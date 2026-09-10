'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';
const PdfViewer = dynamic(() => import('@/components/pdf/PdfViewer').then(mod => mod.PdfViewer), { ssr: false });
import { type PdfViewerHandle } from '@/components/pdf/PdfViewer';
import { SearchPanel } from '@/components/search/SearchPanel';
import { useDocumentStore } from '@/store/documentStore';
import { usePdfText } from '@/hooks/usePdfText';
import { useKeywordSearch } from '@/hooks/useKeywordSearch';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemeStore } from '@/store/themeStore';

export default function ViewerPage() {
  const router = useRouter();
  const { documentUrl, documentName, keywords } = useDocumentStore();
  const theme = useThemeStore((s) => s.theme);
  const logoSrc = theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
  const pdfViewerRef = useRef<PdfViewerHandle>(null);

  const handleNavigateToPage = useCallback((pageNum: number) => {
    pdfViewerRef.current?.scrollToPage(pageNum);
  }, []);

  // Redirect to home if no document is loaded
  useEffect(() => {
    if (!documentUrl) {
      router.replace('/');
    }
  }, [documentUrl, router]);

  // Extract text from PDF pages for keyword counting
  const { pages, isLoading: isTextLoading } = usePdfText(documentUrl);

  // Compute keyword occurrence counts
  const searchResults = useKeywordSearch(pages, keywords);

  if (!documentUrl) return null;

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F5F5F7] dark:bg-[#0A0A0F] flex flex-col relative overflow-hidden transition-colors duration-500">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="orb-float-1 absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-400/20 dark:from-blue-600/15 dark:to-indigo-800/10 blur-[120px]" />
        <div className="orb-float-2 absolute top-[15%] right-[-8%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-violet-300/25 to-purple-400/15 dark:from-violet-700/12 dark:to-purple-900/8 blur-[120px]" />
        <div className="orb-float-3 absolute bottom-[-15%] left-[15%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-cyan-200/20 to-blue-300/15 dark:from-cyan-800/10 dark:to-blue-900/8 blur-[140px]" />
      </div>

      {/* App Header */}
      <header className="glass-header sticky top-0 z-50 shrink-0">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between max-w-[1800px] mx-auto relative z-10 gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={logoSrc}
              alt="Findr Logo"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-full"
              style={{
                filter: theme === 'dark'
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 20px rgba(255,255,255,0.25))'
                  : 'drop-shadow(0 0 8px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(0,0,0,0.15))',
              }}
            />
            <span className="font-bold text-gray-900 dark:text-white tracking-tight text-base sm:text-lg hidden xs:block">Findr</span>
          </div>

          {/* Center: Document name & count */}
          <div className="flex-1 flex justify-center items-center min-w-0">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 max-w-full"
            >
              <div className="glass-card flex items-center px-3 py-1.5 rounded-full min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[120px] sm:max-w-[300px]">
                  {documentName}
                </span>
              </div>
              
              {keywords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:flex items-center gap-1.5 bg-blue-100/50 dark:bg-blue-500/20 backdrop-blur-md border border-blue-200/50 dark:border-blue-400/20 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm shrink-0"
                >
                  <Search size={12} strokeWidth={2.5} />
                  {keywords.length} kata aktif
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right: Theme Toggle */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Split Layout Body */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row gap-3 sm:gap-4 max-w-[1800px] mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 overflow-hidden h-[calc(100dvh-56px)]">
        
        {/* Top/Left: PDF Viewer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 md:flex-[7] min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl glass-card flex flex-col"
        >
          <PdfViewer ref={pdfViewerRef} pdfUrl={documentUrl} keywords={keywords} />
        </motion.div>

        {/* Bottom/Right: Search Panel */}
        <div className="h-[280px] md:h-full md:flex-[3] min-w-0 md:max-w-[400px] lg:max-w-[480px] overflow-hidden shrink-0">
          <SearchPanel results={searchResults} isTextLoading={isTextLoading} onNavigateToPage={handleNavigateToPage} />
        </div>
      </main>
    </div>
  );
}
