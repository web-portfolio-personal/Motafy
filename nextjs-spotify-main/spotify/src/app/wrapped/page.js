'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMusic, FiUser, FiHeart, FiPlay, FiChevronRight,
  FiAward, FiTrendingUp, FiClock, FiDisc, FiStar,
  FiShare2, FiDownload, FiX
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import { useSpotifyApi } from '@/hooks/useSpotifyApi';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SLIDES = [
  { id: 'intro', bg: 'from-purple-600 via-pink-600 to-red-600' },
  { id: 'top-artist', bg: 'from-green-600 via-emerald-600 to-teal-600' },
  { id: 'top-tracks', bg: 'from-blue-600 via-indigo-600 to-purple-600' },
  { id: 'genres', bg: 'from-orange-600 via-red-600 to-pink-600' },
  { id: 'listening-stats', bg: 'from-cyan-600 via-blue-600 to-indigo-600' },
  { id: 'top-5', bg: 'from-pink-600 via-purple-600 to-indigo-600' },
  { id: 'summary', bg: 'from-spotify-green via-green-500 to-emerald-600' },
];

export default function WrappedPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { favorites } = usePlaylist();
  const { getTopTracks, getTopArtists } = useSpotifyApi();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [wrappedData, setWrappedData] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Cargar datos del wrapped
  useEffect(() => {
    const loadWrappedData = async () => {
      if (!isAuthenticated) return;

      try {
        const [topTracksShort, topTracksLong, topArtistsShort, topArtistsLong] = await Promise.all([
          getTopTracks('short_term', 50),
          getTopTracks('long_term', 50),
          getTopArtists('short_term', 20),
          getTopArtists('long_term', 50)
        ]);

        // Procesar géneros
        const genreCount = {};
        topArtistsLong?.items?.forEach(artist => {
          artist.genres?.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        });

        const topGenres = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        // Calcular minutos estimados (asumiendo 3.5 min por canción promedio)
        const estimatedMinutes = (topTracksLong?.items?.length || 0) * 3.5 * 30;

        setWrappedData({
          topArtist: topArtistsShort?.items?.[0],
          topArtists: topArtistsLong?.items?.slice(0, 5) || [],
          topTracks: topTracksShort?.items?.slice(0, 10) || [],
          topTracksAllTime: topTracksLong?.items?.slice(0, 5) || [],
          topGenres,
          stats: {
            totalArtists: topArtistsLong?.items?.length || 0,
            totalTracks: topTracksLong?.items?.length || 0,
            estimatedMinutes: Math.round(estimatedMinutes),
            favoriteCount: favorites.length
          }
        });
      } catch (error) {
        console.error('Error loading wrapped data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWrappedData();
  }, [isAuthenticated, getTopTracks, getTopArtists, favorites.length]);

  // Animación de fase dentro de cada slide
  useEffect(() => {
    if (!isStarted) return;

    setAnimationPhase(0);
    const timer1 = setTimeout(() => setAnimationPhase(1), 300);
    const timer2 = setTimeout(() => setAnimationPhase(2), 600);
    const timer3 = setTimeout(() => setAnimationPhase(3), 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
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

  // Protección de ruta
  if (!authLoading && !isAuthenticated) {
    router.push('/');
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-[var(--foreground-secondary)]">Preparando tu Wrapped...</p>
        </div>
      </div>
    );
  }

  // Pantalla de inicio
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-spotify-green to-green-400 rounded-full flex items-center justify-center animate-pulse">
                <FiMusic className="h-16 w-16 text-black" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full blur-xl opacity-30 animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-spotify-green to-green-300">Wrapped</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Descubre tu año musical en Motafy
            </p>

            <button
              onClick={() => setIsStarted(true)}
              className="group relative px-8 py-4 bg-spotify-green text-black font-bold text-lg rounded-full hover:scale-105 transition-transform overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Comenzar
                <FiChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-spotify-green-light to-spotify-green opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <p className="mt-6 text-sm text-white/40">
              Basado en tus datos de Spotify
            </p>
          </div>
        </main>
      </div>
    );
  }

  const currentSlideData = SLIDES[currentSlide];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentSlideData.bg} transition-all duration-700 flex flex-col relative overflow-hidden`}>
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-black/10 rounded-full blur-3xl" />
      </div>

      {/* Botón cerrar */}
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
      >
        <FiX className="h-6 w-6 text-white" />
      </button>

      {/* Indicadores de progreso */}
      <div className="absolute top-4 left-4 right-16 z-50 flex gap-1">
        {SLIDES.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < currentSlide ? 'bg-white' : 
              index === currentSlide ? 'bg-white/70' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Contenido del slide */}
      <main className="flex-1 flex items-center justify-center p-6 pt-16 relative z-10">
        <div className="w-full max-w-lg mx-auto">

          {/* Slide 0: Intro */}
          {currentSlide === 0 && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-wider mb-4 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Hola, {user?.display_name?.split(' ')[0]}
              </p>
              <h1 className={`text-4xl sm:text-6xl font-black text-white mb-6 transition-all duration-500 delay-150 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Este ha sido tu año
              </h1>
              <p className={`text-xl text-white/80 transition-all duration-500 delay-300 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Vamos a ver qué has estado escuchando
              </p>
            </div>
          )}

          {/* Slide 1: Top Artist */}
          {currentSlide === 1 && wrappedData?.topArtist && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-wider mb-6 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tu artista favorito
              </p>
              <div className={`relative mb-6 transition-all duration-700 delay-150 ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                  {wrappedData.topArtist.images?.[0]?.url ? (
                    <img
                      src={wrappedData.topArtist.images[0].url}
                      alt={wrappedData.topArtist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <FiUser className="h-20 w-20 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-spotify-green text-black px-4 py-1 rounded-full text-sm font-bold">
                  #1
                </div>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-black text-white mb-2 transition-all duration-500 delay-300 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {wrappedData.topArtist.name}
              </h2>
              <p className={`text-white/60 transition-all duration-500 delay-500 ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                {wrappedData.topArtist.followers?.total?.toLocaleString()} seguidores
              </p>
            </div>
          )}

          {/* Slide 2: Top Tracks */}
          {currentSlide === 2 && (
            <div>
              <p className={`text-white/60 text-sm uppercase tracking-wider mb-4 text-center transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tus canciones más escuchadas
              </p>
              <div className="space-y-3">
                {wrappedData?.topTracks?.slice(0, 5).map((track, index) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-500 ${
                      animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    }`}
                    style={{ transitionDelay: `${150 + index * 100}ms` }}
                  >
                    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {track.album?.images?.[0]?.url && (
                        <img src={track.album.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{track.name}</p>
                      <p className="text-sm text-white/60 truncate">{track.artists?.[0]?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 3: Géneros */}
          {currentSlide === 3 && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-wider mb-6 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tus géneros favoritos
              </p>
              <div className="space-y-4">
                {wrappedData?.topGenres?.map((genre, index) => (
                  <div
                    key={genre.name}
                    className={`transition-all duration-500 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${150 + index * 100}ms` }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium capitalize">{genre.name}</span>
                      <span className="text-spotify-green font-bold">#{index + 1}</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-spotify-green to-green-300 rounded-full transition-all duration-1000"
                        style={{
                          width: animationPhase >= 3 ? `${100 - index * 15}%` : '0%',
                          transitionDelay: `${300 + index * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 4: Stats */}
          {currentSlide === 4 && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-wider mb-8 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tus estadísticas
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Artistas', value: wrappedData?.stats?.totalArtists, icon: FiUser },
                  { label: 'Canciones', value: wrappedData?.stats?.totalTracks, icon: FiMusic },
                  { label: 'Minutos', value: wrappedData?.stats?.estimatedMinutes?.toLocaleString(), icon: FiClock },
                  { label: 'Favoritos', value: wrappedData?.stats?.favoriteCount, icon: FiHeart },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`p-6 bg-white/10 rounded-2xl backdrop-blur-sm transition-all duration-500 ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                    style={{ transitionDelay: `${150 + index * 100}ms` }}
                  >
                    <stat.icon className="h-6 w-6 text-spotify-green mx-auto mb-2" />
                    <div className="text-3xl font-black text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 5: Top 5 artistas */}
          {currentSlide === 5 && (
            <div>
              <p className={`text-white/60 text-sm uppercase tracking-wider mb-6 text-center transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tu Top 5 artistas
              </p>
              <div className="space-y-3">
                {wrappedData?.topArtists?.map((artist, index) => (
                  <div
                    key={artist.id}
                    className={`flex items-center gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-500 ${
                      animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}
                    style={{ transitionDelay: `${150 + index * 100}ms` }}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-300 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-white/20 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      {artist.images?.[0]?.url && (
                        <img src={artist.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{artist.name}</p>
                      <p className="text-sm text-white/60 truncate capitalize">
                        {artist.genres?.slice(0, 2).join(', ') || 'Artista'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 6: Summary */}
          {currentSlide === 6 && (
            <div className="text-center">
              <div className={`mb-6 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <FiAward className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className={`text-3xl sm:text-4xl font-black text-white mb-4 transition-all duration-500 delay-150 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                ¡Eso ha sido tu Wrapped!
              </h1>
              <p className={`text-lg text-white/80 mb-8 transition-all duration-500 delay-300 ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                Gracias por usar Motafy, {user?.display_name?.split(' ')[0]}
              </p>
              <div className={`flex flex-col sm:flex-row gap-3 justify-center transition-all duration-500 delay-500 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors"
                >
                  Volver al Dashboard
                </button>
                <button
                  onClick={() => {
                    setCurrentSlide(0);
                    setIsStarted(true);
                  }}
                  className="px-6 py-3 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-colors"
                >
                  Ver de nuevo
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Controles de navegación */}
      <div className="absolute inset-y-0 left-0 right-0 flex pointer-events-none">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex-1 cursor-pointer pointer-events-auto opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default"
          aria-label="Anterior"
        />
        <button
          onClick={nextSlide}
          disabled={currentSlide === SLIDES.length - 1}
          className="flex-1 cursor-pointer pointer-events-auto opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default"
          aria-label="Siguiente"
        />
      </div>

      {/* Indicador de toque */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm flex items-center gap-2">
        {currentSlide < SLIDES.length - 1 && (
          <>
            <span>Toca para continuar</span>
            <FiChevronRight className="h-4 w-4 animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
}

