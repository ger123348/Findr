'use client';

import { Toaster, toast } from 'react-hot-toast';

export { toast };

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#1C1C1E',
          color: '#F5F5F7',
          borderRadius: '14px',
          padding: '12px 18px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
        },
        success: {
          iconTheme: { primary: '#30D158', secondary: '#1C1C1E' },
          duration: 3000,
        },
        error: {
          iconTheme: { primary: '#FF453A', secondary: '#1C1C1E' },
          duration: 4000,
        },
      }}
    />
  );
}
