'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { useDocumentStore } from '@/store/documentStore';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// Apple-like smooth spring transition
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

export function DropZone() {
  const router = useRouter();
  const setDocument = useDocumentStore((s) => s.setDocument);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        playErrorSound();
        const err = rejectedFiles[0].errors[0];
        if (err.code === 'file-too-large') {
          toast.error('File terlalu besar. Maksimum ukuran adalah 50 MB.');
        } else if (err.code === 'file-invalid-type') {
          toast.error('Hanya file PDF yang diizinkan.');
        } else {
          toast.error(err.message);
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      if (file.type !== 'application/pdf') {
        playErrorSound();
        toast.error('Hanya file PDF yang diizinkan.');
        return;
      }

      setIsProcessing(true);
      setStatus('processing');

      try {
        const localUrl = URL.createObjectURL(file);
        
        setDocument(localUrl, file.name);
        setStatus('success');
        playSuccessSound(); // Trigger success sound

        // Let the beautiful success animation play out before routing
        await new Promise((r) => setTimeout(r, 1200));
        router.push('/viewer');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memproses file.';
        playErrorSound(); // Trigger error sound
        toast.error(message);
        setStatus('error');
        setIsProcessing(false);
        setTimeout(() => setStatus('idle'), 3000);
      }
    },
    [router, setDocument]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    disabled: isProcessing,
  });

  // Dynamic styling based on state
  const getContainerStyle = () => {
    if (isDragReject) return 'border-red-400 bg-red-50/80 dark:border-red-500/50 dark:bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.15)]';
    if (isDragActive) return 'border-blue-400 bg-blue-50/80 dark:border-blue-500/50 dark:bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-[1.02]';
    if (status === 'success') return 'border-green-400 bg-green-50/80 dark:border-green-500/50 dark:bg-green-500/10 shadow-[0_0_40px_rgba(34,197,94,0.15)]';
    if (status === 'error') return 'border-red-400 bg-red-50/80 dark:border-red-500/50 dark:bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.15)]';
    return 'border-transparent shadow-sm hover:shadow-md hover:scale-[1.01]';
  };

  return (
    <div
      {...getRootProps()}
      className={`relative w-full max-w-xl mx-auto cursor-pointer rounded-[2.5rem] border-2 border-dashed px-6 py-10 sm:px-10 sm:py-12 text-center transition-all duration-500 ease-out glass-card ${getContainerStyle()} ${isProcessing ? 'cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {/* Processing State */}
        {isProcessing && status === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={springTransition}
            className="flex flex-col items-center gap-6"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
              <Spinner size={48} className="text-blue-600 dark:text-blue-400 relative z-10" />
            </motion.div>
            <p className="text-[15px] font-medium text-gray-600 dark:text-gray-300 tracking-wide">
              Menyiapkan dokumen Anda...
            </p>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
              className="relative"
            >
               <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl scale-150" />
               <CheckCircle2 size={64} strokeWidth={2.5} className="text-green-500 dark:text-green-400 relative z-10 drop-shadow-sm" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...springTransition }}
              className="text-lg font-semibold text-green-700 dark:text-green-300 tracking-tight"
            >
              Berhasil! Membuka file...
            </motion.p>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && !isProcessing && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }} // wobbly error effect
            className="flex flex-col items-center gap-5"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
              <AlertCircle size={56} strokeWidth={2.5} className="text-red-500 dark:text-red-400 relative z-10" />
            </div>
            <p className="text-[15px] font-medium text-red-600 dark:text-red-400">
              Gagal membuka file. Silakan coba lagi.
            </p>
          </motion.div>
        )}

        {/* Idle / Drag State */}
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={isDragActive ? { scale: 1.15, rotate: -4, y: -8 } : { scale: 1, rotate: 0, y: 0 }}
              transition={springTransition}
              className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-[1.5rem] bg-gradient-to-b from-white to-gray-50/50 dark:from-white/10 dark:to-white/5 shadow-sm border border-gray-200/60 dark:border-white/10 overflow-hidden group"
            >
              {/* Subtle hover glow inside the icon box */}
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 dark:group-hover:bg-blue-400/10 transition-colors duration-500" />
              
              {isDragActive ? (
                <FileText size={48} className="text-blue-500 dark:text-blue-400 relative z-10" strokeWidth={1.5} />
              ) : (
                <Upload size={48} className="text-gray-400 dark:text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-200 relative z-10 transition-colors duration-300" strokeWidth={1.5} />
              )}
            </motion.div>

            <div className="space-y-3">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isDragActive ? 'Lepaskan file di sini' : 'Seret & Lepas PDF di sini'}
              </p>
              <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                atau{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-current after:bottom-[-2px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300">
                  pilih dari komputer
                </span>
              </p>
              <div className="pt-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest backdrop-blur-sm">
                  Maks. 50 MB
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
