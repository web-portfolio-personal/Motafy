'use client';

import Link from 'next/link';
import { FiHome, FiMusic, FiArrowLeft } from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spotify-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-bold text-white/5 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-spotify-green to-green-600 rounded-full flex items-center justify-center animate-pulse-green">
              <FiMusic className="h-12 w-12 text-black" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          ¡Ups! Esta página no existe
        </h2>
        <p className="text-white/60 mb-8">
          Parece que te has perdido en el ritmo. La página que buscas no está disponible
          o ha sido movida a otra ubicación.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button
              size="lg"
              icon={<FiHome className="h-5 w-5" />}
            >
              Ir al inicio
            </Button>
          </Link>
          <Button
            size="lg"
            variant="secondary"
            icon={<FiArrowLeft className="h-5 w-5" />}
            onClick={() => window.history.back()}
          >
            Volver atrás
          </Button>
        </div>

        {/* Fun message */}
        <p className="text-white/30 text-sm mt-12">
          🎵 Mientras tanto, ¿qué tal si generas una playlist nueva?
        </p>
      </div>
    </div>
  );
}

