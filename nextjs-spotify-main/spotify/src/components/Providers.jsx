'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PlaylistProvider } from '@/context/PlaylistContext';
import { ToastProvider } from '@/context/ToastContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PlaylistProvider>
            {children}
          </PlaylistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

