'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { uploadPdf } from '@/lib/uploadPdf';
import { useDocumentStore } from '@/store/documentStore';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function DropZone() {
  const router = useRouter();
  const setDocument = useDocumentStore((s) => s.setDocument);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files (from react-dropzone built-in validation)
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        if (err.code === 'file-too-large') {
          toast.error('File terlalu besar. Maksimum ukuran adalah 10 MB.');
        } else if (err.code === 'file-invalid-type') {
          toast.error('Hanya file PDF yang diizinkan.');
        } else {
          toast.error(err.message);
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Extra MIME type guard
      if (file.type !== 'application/pdf') {
        toast.error('Hanya file PDF yang diizinkan.');
        return;
      }

      setIsUploading(true);
      setUploadStatus('uploading');

      try {
        const result = await uploadPdf(file);
        setDocument(result.file_url, result.file_name);
        setUploadStatus('success');
        toast.success(`"${result.file_name}" berhasil diunggah!`);

        // Short delay to show success state before redirect
        await new Promise((r) => setTimeout(r, 800));
        router.push('/viewer');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengunggah file.';
        toast.error(message);
        setUploadStatus('error');
        setIsUploading(false);
        setTimeout(() => setUploadStatus('idle'), 2000);
      }
    },
    [router, setDocument]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    disabled: isUploading,
  });

  const getBorderColor = () => {
    if (isDragReject) return 'border-red-400 dark:border-red-500/50 bg-red-50/60 dark:bg-red-500/10';
    if (isDragActive) return 'border-blue-400 dark:border-blue-500/50 bg-blue-50/60 dark:bg-blue-500/10';
    if (uploadStatus === 'success') return 'border-green-400 dark:border-green-500/50 bg-green-50/60 dark:bg-green-500/10';
    if (uploadStatus === 'error') return 'border-red-400 dark:border-red-500/50 bg-red-50/60 dark:bg-red-500/10';
    return ''; // The base glass-card-hover will handle the idle state styling
  };

  return (
    <div
      {...getRootProps()}
      className={`relative w-full max-w-xl mx-auto cursor-pointer rounded-[2rem] border-2 border-dashed px-6 py-12 sm:px-10 sm:py-16 text-center transition-all duration-300 glass-card glass-card-hover ${
        getBorderColor() || 'border-transparent'
      } ${isUploading ? 'cursor-not-allowed opacity-70 scale-[0.98]' : ''}`}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {/* Uploading state */}
        {isUploading && uploadStatus === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5"
          >
            <Spinner size={48} className="text-blue-600 dark:text-blue-400" />
            <p className="text-base font-medium text-gray-700 dark:text-gray-200">Mengunggah dokumen...</p>
          </motion.div>
        )}

        {/* Success state */}
        {uploadStatus === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
               <CheckCircle2 size={56} className="text-green-500 dark:text-green-400 drop-shadow-sm" />
            </motion.div>
            <p className="text-lg font-semibold text-green-700 dark:text-green-300">Berhasil! Membuka dokumen...</p>
          </motion.div>
        )}

        {/* Error state */}
        {uploadStatus === 'error' && !isUploading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <AlertCircle size={48} className="text-red-500 dark:text-red-400" />
            <p className="text-base font-medium text-red-600 dark:text-red-400">Upload gagal. Coba lagi.</p>
          </motion.div>
        )}

        {/* Idle / drag state */}
        {uploadStatus === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={isDragActive ? { scale: 1.15, rotate: -5, y: -5 } : { scale: 1, rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-[1.25rem] bg-gradient-to-b from-white to-gray-50 dark:from-white/10 dark:to-white/5 shadow-sm border border-gray-100 dark:border-white/10"
            >
              {isDragActive ? (
                <FileText size={40} className="text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              ) : (
                <Upload size={40} className="text-gray-400 dark:text-gray-300" strokeWidth={1.5} />
              )}
            </motion.div>

            <div className="space-y-2.5">
              <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                {isDragActive ? 'Lepaskan file di sini' : 'Seret & Lepas PDF di sini'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                atau{' '}
                <span className="font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  pilih dari komputer
                </span>
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Maks. 10 MB
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
