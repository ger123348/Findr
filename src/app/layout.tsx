import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Findr — Multi-Keyword PDF Search',
  description:
    'Temukan kata kunci di dokumen PDF Anda secara instan dengan pencarian multi-keyword cerdas dan highlight visual yang akurat.',
  keywords: ['PDF', 'pencarian', 'multi-keyword', 'highlight', 'dokumen'],
  authors: [{ name: 'Findr' }],
  openGraph: {
    title: 'Findr — Multi-Keyword PDF Search',
    description: 'Cari banyak kata sekaligus di PDF, lebih cerdas dari Ctrl+F.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-[#F5F5F7] antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
