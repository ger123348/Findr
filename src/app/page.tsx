import type { Metadata } from 'next';
import { HomeContent } from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: 'Findr — Upload Dokumen PDF',
  description: 'Unggah dokumen PDF Anda untuk memulai pencarian multi-keyword yang cerdas.',
};

export default function HomePage() {
  return <HomeContent />;
}
