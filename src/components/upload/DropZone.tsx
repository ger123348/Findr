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
    if (isDragReject) return 'border-red-400 bg-red-50/60';
    if (isDragActive) return 'border-blue-400 bg-blue-50/60';
    if (uploadStatus === 'success') return 'border-green-400 bg-green-50/60';
    if (uploadStatus === 'error') return 'border-red-400 bg-red-50/60';
    return 'border-white/60 bg-white/40 hover:border-white/80 hover:bg-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
  };

  return (
    <div
      {...getRootProps()}
      className={`relative w-full max-w-xl cursor-pointer rounded-3xl border px-8 py-16 text-center transition-all duration-300 backdrop-blur-2xl ${getBorderColor()} ${
        isUploading ? 'cursor-not-allowed opacity-80' : ''
      }`}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {/* Uploading state */}
        {isUploading && uploadStatus === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <Spinner size={48} className="text-blue-500" />
            <p className="text-base font-medium text-gray-600">Mengunggah dokumen...</p>
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
            <CheckCircle2 size={48} className="text-green-500" />
            <p className="text-base font-medium text-green-700">Berhasil! Mengarahkan...</p>
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
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-base font-medium text-red-600">Upload gagal. Coba lagi.</p>
          </motion.div>
        )}

        {/* Idle / drag state */}
        {uploadStatus === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              animate={isDragActive ? { scale: 1.15, rotate: -5 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100"
            >
              {isDragActive ? (
                <FileText size={36} className="text-blue-500" />
              ) : (
                <Upload size={36} className="text-gray-400" />
              )}
            </motion.div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-800">
                {isDragActive ? 'Lepaskan file di sini' : 'Seret & Lepas PDF di sini'}
              </p>
              <p className="text-sm text-gray-400">
                atau{' '}
                <span className="font-medium text-blue-500 underline underline-offset-2">
                  pilih dari komputer
                </span>
              </p>
              <p className="text-xs text-gray-300 pt-1">Hanya PDF · Maks. 10 MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
