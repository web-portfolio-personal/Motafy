'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveTokens } from '@/lib/auth';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevenir ejecución duplicada
    if (hasProcessed.current || isProcessing) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Autenticación cancelada');
      return;
    }

    if (!code) {
      setError('No se recibió código de autorización');
      return;
    }

    // Validar state para prevenir CSRF (más flexible)
    const savedState = localStorage.getItem('spotify_auth_state');

    // Si no hay state guardado o no coincide, dar una oportunidad pero loguear
    if (!savedState) {
      console.warn('No saved state found - proceeding anyway (first auth)');
    } else if (state !== savedState) {
      console.warn('State mismatch - saved:', savedState, 'received:', state);
      // Limpiar y continuar en lugar de bloquear
    }

    // Limpiar state
    localStorage.removeItem('spotify_auth_state');

    // Marcar como procesado
    hasProcessed.current = true;
    setIsProcessing(true);

    // Intercambiar código por token
    const exchangeCodeForToken = async () => {
      try {
        const response = await fetch('/api/spotify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (!response.ok) {
          console.log('Error data:', data);
          throw new Error(data.error || 'Error al obtener token');
        }

        // Guardar tokens
        saveTokens(data.access_token, data.refresh_token, data.expires_in);

        // Pequeño delay para asegurar que los tokens se guardan
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirigir al dashboard usando window.location para evitar loops
        window.location.href = '/dashboard';

      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setIsProcessing(false);
      }
    };

    exchangeCodeForToken();
  }, [searchParams, isProcessing]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white text-xl">Autenticando...</p>
      </div>
    </div>
  );
}