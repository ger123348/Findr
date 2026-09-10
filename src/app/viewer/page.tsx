'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { SearchPanel } from '@/components/search/SearchPanel';
import { useDocumentStore } from '@/store/documentStore';
import { usePdfText } from '@/hooks/usePdfText';
import { useKeywordSearch } from '@/hooks/useKeywordSearch';

export default function ViewerPage() {
  const router = useRouter();
  const { documentUrl, documentName, keywords } = useDocumentStore();

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
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col relative overflow-hidden">
      {/* Ambient Background for Glassmorphism effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[100px]" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-200/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[120px]" />
      </div>

      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-gray-200/50">
        <div className="h-14 px-6 flex items-center justify-between max-w-[1600px] mx-auto relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Search size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">Findr</span>
          </div>

          {/* Document name */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/80 shadow-sm px-3 py-1.5 rounded-full"
          >
            <span className="text-xs font-medium text-gray-600 max-w-[240px] truncate">
              {documentName}
            </span>
          </motion.div>

          {/* Keyword count badge */}
          {keywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 bg-blue-50/80 backdrop-blur-md border border-blue-100/80 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
            >
              <Search size={11} />
              {keywords.length} kata kunci aktif
            </motion.div>
          )}
        </div>
      </header>

      {/* Split Layout Body */}
      <main className="relative z-10 flex-1 flex gap-0 max-w-[1600px] mx-auto w-full px-4 py-4 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left: PDF Viewer (70%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-[7] min-w-0 overflow-hidden rounded-2xl mr-4 bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          style={{ height: '100%' }}
        >
          <PdfViewer pdfUrl={documentUrl} keywords={keywords} />
        </motion.div>

        {/* Right: Search Panel (30%) */}
        <div className="flex-[3] min-w-0 overflow-hidden" style={{ height: '100%' }}>
          <SearchPanel results={searchResults} isTextLoading={isTextLoading} />
        </div>
      </main>
    </div>
  );
}
