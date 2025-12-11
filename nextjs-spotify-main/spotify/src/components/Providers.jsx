'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PlaylistProvider } from '@/context/PlaylistContext';
import { ToastProvider } from '@/context/ToastContext';
import { AudioProvider } from '@/context/AudioContext';
import GlobalPlayer from '@/components/ui/GlobalPlayer';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PlaylistProvider>
            <AudioProvider>
              {children}
              <GlobalPlayer />
            </AudioProvider>
          </PlaylistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

