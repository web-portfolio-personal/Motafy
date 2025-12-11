'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMusic, FiUser, FiHeart, FiChevronRight, FiChevronLeft,
  FiAward, FiTrendingUp, FiClock, FiStar, FiX, FiPlay
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SLIDES = [
  { id: 'intro', bg: 'from-purple-600 via-pink-600 to-red-500' },
  { id: 'stats-overview', bg: 'from-blue-600 via-cyan-600 to-teal-500' },
  { id: 'top-artists', bg: 'from-green-600 via-emerald-500 to-teal-500' },
  { id: 'favorite-genres', bg: 'from-orange-500 via-red-500 to-pink-500' },
  { id: 'activity', bg: 'from-indigo-600 via-purple-600 to-pink-500' },
  { id: 'summary', bg: 'from-spotify-green via-green-500 to-emerald-500' },
];

export default function WrappedPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { favorites, stats, getActivityByDay, trackWrappedView, playlistHistory } = usePlaylist();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [wrappedData, setWrappedData] = useState(null);

  // Calcular datos del wrapped basados en las stats del usuario
  useEffect(() => {
    if (!isAuthenticated) return;

    // Procesar favoritos para obtener top artistas y géneros
    const artistCount = {};
    const genreEstimate = {};

    favorites.forEach(track => {
      const artistName = track.artists?.[0]?.name || 'Desconocido';
      artistCount[artistName] = (artistCount[artistName] || 0) + 1;

      // Estimar género por nombre de artista (simplificado)
      const artistLower = artistName.toLowerCase();
      if (artistLower.includes('dean martin') || artistLower.includes('sinatra') || artistLower.includes('nat king')) {
        genreEstimate['Jazz/Clásicos'] = (genreEstimate['Jazz/Clásicos'] || 0) + 1;
      } else if (artistLower.includes('bad bunny') || artistLower.includes('j balvin') || artistLower.includes('ozuna')) {
        genreEstimate['Reggaeton'] = (genreEstimate['Reggaeton'] || 0) + 1;
      } else {
        genreEstimate['Pop/Otros'] = (genreEstimate['Pop/Otros'] || 0) + 1;
      }
    });

    // Top artistas
    const topArtists = Object.entries(artistCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / Math.max(favorites.length, 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top géneros
    const topGenres = Object.entries(genreEstimate)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / Math.max(favorites.length, 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Actividad
    const activityByDay = getActivityByDay();

    setWrappedData({
      topArtists,
      topGenres,
      activityByDay,
      totalFavorites: favorites.length,
      totalPlaylists: stats.playlistsGenerated,
      totalSongs: stats.songsGenerated,
      totalInteractions: stats.totalInteractions
    });
  }, [isAuthenticated, favorites, stats, getActivityByDay]);

  // Animación de fase dentro de cada slide
  useEffect(() => {
    if (!isStarted) return;

    setAnimationPhase(0);
    const timers = [
      setTimeout(() => setAnimationPhase(1), 200),
      setTimeout(() => setAnimationPhase(2), 500),
      setTimeout(() => setAnimationPhase(3), 800),
      setTimeout(() => setAnimationPhase(4), 1100),
    ];

    return () => timers.forEach(clearTimeout);
  }, [currentSlide, isStarted]);

  const nextSlide = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  const handleStart = () => {
    trackWrappedView();
    setIsStarted(true);
  };

  // Protección de ruta
  if (!authLoading && !isAuthenticated) {
    router.push('/');
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Verificar si hay datos suficientes
  const hasEnoughData = favorites.length > 0 || stats.totalInteractions > 0;

  // Pantalla cuando no hay datos
  if (!isStarted && !hasEnoughData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex flex-col">
        <button
          onClick={() => router.push('/dashboard')}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <FiX className="h-6 w-6 text-white" />
        </button>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <FiMusic className="h-16 w-16 text-white/50" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
              ¡Aún no tienes historial!
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Genera algunas playlists, guarda canciones en favoritos y vuelve para ver tu Wrapped personalizado 🎵
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-spotify-green text-black font-bold text-lg rounded-full hover:scale-105 transition-transform"
            >
              Ir a explorar
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de inicio
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex flex-col overflow-hidden">
        <button
          onClick={() => router.push('/dashboard')}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <FiX className="h-6 w-6 text-white" />
        </button>

        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8 relative">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-spotify-green to-green-400 rounded-full flex items-center justify-center shadow-2xl shadow-spotify-green/30 animate-bounce" style={{ animationDuration: '2s' }}>
                <FiMusic className="h-20 w-20 text-black" />
              </div>
              <div className="absolute inset-0 w-40 h-40 mx-auto bg-spotify-green/30 rounded-full blur-2xl animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 animate-fade-in">
              Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-spotify-green to-green-300">Wrapped</span>
            </h1>
            <p className="text-xl text-white/70 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Descubre tu año musical en Motafy
            </p>

            <button
              onClick={handleStart}
              className="group relative px-10 py-5 bg-spotify-green text-black font-bold text-xl rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-spotify-green/30 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FiPlay className="h-6 w-6" />
                Comenzar
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-spotify-green-light to-spotify-green opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <p className="mt-8 text-sm text-white/40 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              Basado en tu actividad en Motafy
            </p>
          </div>
        </main>
      </div>
    );
  }

  const currentSlideData = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentSlideData.bg} transition-all duration-1000 flex flex-col relative overflow-hidden`}>
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-black/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header con botón cerrar */}
      <div className="relative z-50 p-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <FiX className="h-6 w-6 text-white" />
        </button>

        {/* Indicadores de progreso */}
        <div className="flex-1 flex gap-1 mx-4 max-w-md">
          {SLIDES.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                index < currentSlide ? 'bg-white' : 
                index === currentSlide ? 'bg-white/80' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Contenido del slide */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg mx-auto">

          {/* Slide 0: Intro */}
          {currentSlide === 0 && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-widest mb-6 transition-all duration-700 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Hola, {user?.display_name?.split(' ')[0]} 👋
              </p>
              <h1 className={`text-4xl sm:text-6xl font-black text-white mb-6 leading-tight transition-all duration-700 delay-200 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Este es tu
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">resumen</span>
              </h1>
              <p className={`text-xl text-white/80 transition-all duration-700 delay-400 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Veamos qué has estado haciendo en Motafy
              </p>
            </div>
          )}

          {/* Slide 1: Stats Overview */}
          {currentSlide === 1 && wrappedData && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-widest mb-8 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tu actividad
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: wrappedData.totalPlaylists, label: 'Playlists', icon: FiMusic, delay: 0 },
                  { value: wrappedData.totalSongs, label: 'Canciones', icon: FiTrendingUp, delay: 100 },
                  { value: wrappedData.totalFavorites, label: 'Favoritos', icon: FiHeart, delay: 200 },
                  { value: wrappedData.totalInteractions, label: 'Interacciones', icon: FiStar, delay: 300 },
                ].map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`p-6 bg-white/10 backdrop-blur-sm rounded-2xl transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                    style={{ transitionDelay: `${stat.delay}ms` }}
                  >
                    <stat.icon className="h-8 w-8 text-white/60 mx-auto mb-2" />
                    <div className="text-4xl font-black text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 2: Top Artists */}
          {currentSlide === 2 && wrappedData && (
            <div>
              <p className={`text-white/60 text-sm uppercase tracking-widest mb-6 text-center transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tus artistas favoritos
              </p>
              {wrappedData.topArtists.length > 0 ? (
                <div className="space-y-3">
                  {wrappedData.topArtists.map((artist, index) => (
                    <div
                      key={artist.name}
                      className={`flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-700 ${
                        animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                      }`}
                      style={{ transitionDelay: `${200 + index * 150}ms` }}
                    >
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                        index === 0 ? 'bg-yellow-400 text-black' :
                        index === 1 ? 'bg-gray-300 text-black' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-white/20 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-lg truncate">{artist.name}</p>
                        <p className="text-sm text-white/60">{artist.count} canciones</p>
                      </div>
                      <span className="text-spotify-green font-bold text-xl">{artist.percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUser className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Añade canciones a favoritos para ver tus artistas</p>
                </div>
              )}
            </div>
          )}

          {/* Slide 3: Géneros */}
          {currentSlide === 3 && wrappedData && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-widest mb-8 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tus géneros
              </p>
              {wrappedData.topGenres.length > 0 ? (
                <div className="space-y-6">
                  {wrappedData.topGenres.map((genre, index) => (
                    <div
                      key={genre.name}
                      className={`transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{ transitionDelay: `${200 + index * 150}ms` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold text-lg">{genre.name}</span>
                        <span className="text-spotify-green font-bold">{genre.percentage}%</span>
                      </div>
                      <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-spotify-green to-green-300 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: animationPhase >= 3 ? `${genre.percentage}%` : '0%',
                            transitionDelay: `${400 + index * 150}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12">
                  <FiMusic className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Explora más música para descubrir tus géneros</p>
                </div>
              )}
            </div>
          )}

          {/* Slide 4: Actividad */}
          {currentSlide === 4 && wrappedData && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-widest mb-8 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tu actividad reciente
              </p>
              <div className={`p-6 bg-white/10 backdrop-blur-sm rounded-2xl transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <div className="flex items-end justify-between gap-2 h-40 mb-4">
                  {wrappedData.activityByDay.map((day, index) => {
                    const maxCount = Math.max(...wrappedData.activityByDay.map(d => d.count), 1);
                    const height = (day.count / maxCount) * 100;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-white/10 rounded-t-lg relative" style={{ height: '120px' }}>
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-spotify-green to-green-300 rounded-t-lg transition-all duration-1000 ease-out"
                            style={{
                              height: animationPhase >= 3 ? `${Math.max(height, 5)}%` : '0%',
                              transitionDelay: `${300 + index * 100}ms`
                            }}
                          />
                        </div>
                        <span className="text-xs text-white/60 capitalize">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-white/40 text-sm">Últimos 7 días</p>
              </div>
            </div>
          )}

          {/* Slide 5: Summary */}
          {currentSlide === 5 && (
            <div className="text-center">
              <div className={`mb-8 transition-all duration-700 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="w-28 h-28 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FiAward className="h-14 w-14 text-white" />
                </div>
              </div>
              <h1 className={`text-4xl sm:text-5xl font-black text-white mb-4 transition-all duration-700 delay-200 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                ¡Eso es todo!
              </h1>
              <p className={`text-xl text-white/80 mb-10 transition-all duration-700 delay-400 ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                Gracias por usar Motafy, {user?.display_name?.split(' ')[0]} 🎵
              </p>

              {/* Botones finales - CON Z-INDEX ALTO */}
              <div className={`flex flex-col sm:flex-row gap-4 justify-center relative z-50 transition-all duration-700 delay-600 ${animationPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard');
                  }}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                >
                  Volver al Dashboard
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(0);
                  }}
                  className="px-8 py-4 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-all hover:scale-105"
                >
                  Ver de nuevo
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Navegación - Solo si NO es el último slide */}
      {!isLastSlide && (
        <div className="absolute inset-0 flex z-20" style={{ top: '80px', bottom: '100px' }}>
          <button
            onClick={prevSlide}
            disabled={isFirstSlide}
            className="flex-1 cursor-pointer disabled:cursor-default focus:outline-none"
            aria-label="Anterior"
          />
          <button
            onClick={nextSlide}
            className="flex-1 cursor-pointer focus:outline-none"
            aria-label="Siguiente"
          />
        </div>
      )}

      {/* Controles manuales visibles */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-30">
        {!isFirstSlide && !isLastSlide && (
          <button
            onClick={prevSlide}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiChevronLeft className="h-6 w-6 text-white" />
          </button>
        )}

        {!isLastSlide && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>Toca para continuar</span>
            <FiChevronRight className="h-4 w-4 animate-pulse" />
          </div>
        )}

        {!isLastSlide && (
          <button
            onClick={nextSlide}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiChevronRight className="h-6 w-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

