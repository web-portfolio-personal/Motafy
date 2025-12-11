'use client';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSpotifyAuthUrl } from '@/lib/auth';
import { FaSpotify } from 'react-icons/fa';
import { FiMusic, FiHeart, FiZap, FiSliders, FiSave, FiShare2 } from 'react-icons/fi';
import Button from '@/components/ui/Button';

const FEATURES = [
  {
    icon: FiSliders,
    title: '6 Widgets Personalizables',
    description: 'Configura artistas, géneros, décadas, mood, popularidad y canciones específicas',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FiZap,
    title: 'Generación Inteligente',
    description: 'Algoritmo que combina tus preferencias para crear la playlist perfecta',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: FiHeart,
    title: 'Sistema de Favoritos',
    description: 'Guarda tus canciones favoritas y accede a ellas en cualquier momento',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: FiSave,
    title: 'Guarda en Spotify',
    description: 'Exporta tus playlists directamente a tu cuenta de Spotify',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: FiMusic,
    title: 'Preview de 30 Segundos',
    description: 'Escucha un adelanto de cada canción antes de añadirla',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FiShare2,
    title: 'Comparte y Exporta',
    description: 'Comparte tus playlists o expórtalas en formato JSON',
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-spotify-green/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
              <FiMusic className="h-5 w-5 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">
              Mota<span className="text-spotify-green">fy</span>
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
              <FaSpotify className="h-4 w-4 text-spotify-green" />
              <span className="text-sm text-white/70">Powered by Spotify Web API</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Tu música,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-spotify-green to-green-400">
                tu estilo
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Genera playlists personalizadas de Spotify basándose en tus preferencias
              musicales mediante widgets configurables. Descubre nueva música que te encantará.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                onClick={handleLogin}
                icon={<FaSpotify className="h-6 w-6" />}
                className="w-full sm:w-auto shadow-lg shadow-spotify-green/25 hover:shadow-spotify-green/40 transition-shadow"
              >
                Conectar con Spotify
              </Button>
              <p className="text-sm text-white/40">
                Gratis • Sin registro adicional
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Widget Preview */}
          <div className="bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/10 p-8 mb-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Configura tu playlist perfecta
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Artistas', emoji: '🎤', color: 'bg-purple-500/20 border-purple-500/30' },
                { name: 'Canciones', emoji: '🎵', color: 'bg-blue-500/20 border-blue-500/30' },
                { name: 'Géneros', emoji: '🎸', color: 'bg-green-500/20 border-green-500/30' },
                { name: 'Décadas', emoji: '📅', color: 'bg-orange-500/20 border-orange-500/30' },
                { name: 'Mood', emoji: '😊', color: 'bg-pink-500/20 border-pink-500/30' },
                { name: 'Popularidad', emoji: '📊', color: 'bg-yellow-500/20 border-yellow-500/30' }
              ].map((widget, index) => (
                <div
                  key={index}
                  className={`${widget.color} border rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-default`}
                >
                  <span className="text-3xl mb-2 block">{widget.emoji}</span>
                  <span className="text-sm font-medium text-white">{widget.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para descubrir tu próxima canción favorita?
            </h2>
            <p className="text-white/50 mb-8">
              Únete a miles de usuarios que ya disfrutan de playlists personalizadas
            </p>
            <Button
              size="lg"
              onClick={handleLogin}
              icon={<FaSpotify className="h-5 w-5" />}
            >
              Comenzar ahora
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FiMusic className="h-5 w-5 text-spotify-green" />
              <span className="font-semibold text-white">Motafy</span>
            </div>
            <p className="text-sm text-white/40">
              Proyecto Final de Programación Web 1 • U-tad • {new Date().getFullYear()}
            </p>
            <p className="text-sm text-white/40">
              Los datos pertenecen a Spotify AB
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}


