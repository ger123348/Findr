import type { Metadata } from 'next';
import { DropZone } from '@/components/upload/DropZone';
import { Search, Zap, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Findr — Upload Dokumen PDF',
  description: 'Unggah dokumen PDF Anda untuk memulai pencarian multi-keyword yang cerdas.',
};

const features = [
  {
    icon: Search,
    title: 'Multi-Keyword',
    description: 'Cari banyak kata sekaligus, jauh lebih efisien dari Ctrl+F.',
  },
  {
    icon: Zap,
    title: 'Instant Highlight',
    description: 'Setiap kata kunci tampil dengan warna berbeda di dokumen.',
  },
  {
    icon: Layers,
    title: 'Rekap Otomatis',
    description: 'Lihat jumlah kemunculan setiap kata kunci secara real-time.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] flex flex-col">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Search size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">Findr</span>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Multi-Keyword PDF Search
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
          <Zap size={12} />
          Lebih pintar dari Ctrl+F
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4 max-w-2xl">
          Temukan setiap kata{' '}
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            sekaligus
          </span>
        </h1>

        <p className="text-gray-500 text-base sm:text-lg max-w-md mb-12 leading-relaxed">
          Upload PDF, tambahkan kata kunci, dan lihat semua kecocokan ter-highlight otomatis
          dengan warna berbeda per kata.
        </p>

        {/* DropZone */}
        <DropZone />

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-2xl w-full">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-gray-500" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        Findr · Dokumen tetap aman di cloud Anda
      </footer>
    </main>
  );
}
