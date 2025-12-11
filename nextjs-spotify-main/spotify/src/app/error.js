'use client';

import { useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log del error para debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
            <FiAlertTriangle className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          ¡Algo salió mal!
        </h1>
        <p className="text-white/60 mb-4">
          Ha ocurrido un error inesperado en la aplicación.
          No te preocupes, puedes intentar recargar la página.
        </p>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
            <p className="text-xs text-red-400 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button
            size="lg"
            onClick={() => reset()}
            icon={<FiRefreshCw className="h-5 w-5" />}
          >
            Intentar de nuevo
          </Button>
          <Link href="/">
            <Button
              size="lg"
              variant="secondary"
              icon={<FiHome className="h-5 w-5" />}
            >
              Ir al inicio
            </Button>
          </Link>
        </div>

        {/* Help message */}
        <p className="text-white/30 text-sm">
          Si el problema persiste, intenta cerrar sesión y volver a iniciar.
        </p>
      </div>
    </div>
  );
}

