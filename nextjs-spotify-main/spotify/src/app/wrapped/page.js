'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  { id: 'top-artist', bg: 'from-green-600 via-emerald-500 to-teal-500' },
  { id: 'top-songs', bg: 'from-orange-500 via-red-500 to-pink-500' },
  { id: 'genres', bg: 'from-indigo-600 via-purple-600 to-pink-500' },
  { id: 'activity', bg: 'from-cyan-500 via-blue-500 to-indigo-500' },
  { id: 'summary', bg: 'from-spotify-green via-green-500 to-emerald-500' },
];

export default function WrappedPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { favorites, stats, getActivityByDay, trackWrappedView, playlistHistory } = usePlaylist();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Calcular datos del wrapped basados en las stats del usuario
  const wrappedData = useMemo(() => {
    if (!isAuthenticated) return null;

    const artistCount = {};
    const albumImages = {};

    favorites.forEach(track => {
      const artistName = track.artists?.[0]?.name || 'Desconocido';
      artistCount[artistName] = (artistCount[artistName] || 0) + 1;

      // Guardar imagen del álbum para cada artista
      if (track.album?.images?.[0]?.url && !albumImages[artistName]) {
        albumImages[artistName] = track.album.images[0].url;
      }
    });

    const topArtists = Object.entries(artistCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / Math.max(favorites.length, 1)) * 100),
        image: albumImages[name]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top canciones (las más recientes en favoritos)
    const topSongs = favorites.slice(0, 5).map((track, index) => ({
      name: track.name,
      artist: track.artists?.[0]?.name || 'Desconocido',
      image: track.album?.images?.[0]?.url,
      position: index + 1
    }));

    // Actividad
    const activityByDay = getActivityByDay ? getActivityByDay() : [];

    // Imagen de fondo (del artista más escuchado)
    const backgroundImage = topArtists[0]?.image || topSongs[0]?.image || null;

    return {
      topArtists,
      topSongs,
      activityByDay,
      backgroundImage,
      totalFavorites: favorites.length,
      totalPlaylists: stats?.playlistsGenerated || 0,
      totalSongs: stats?.songsGenerated || 0,
      totalInteractions: stats?.totalInteractions || 0,
      topArtist: topArtists[0] || null
    };
  }, [isAuthenticated, favorites, stats, getActivityByDay]);

  // Animación de fase dentro de cada slide
  useEffect(() => {
    if (!isStarted) return;

    setAnimationPhase(0);
    const timers = [
      setTimeout(() => setAnimationPhase(1), 150),
      setTimeout(() => setAnimationPhase(2), 400),
      setTimeout(() => setAnimationPhase(3), 650),
      setTimeout(() => setAnimationPhase(4), 900),
      setTimeout(() => setAnimationPhase(5), 1150),
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
    trackWrappedView?.();
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

  const hasEnoughData = favorites.length > 0 || (stats?.totalInteractions || 0) > 0;

  // Pantalla cuando no hay datos
  if (!hasEnoughData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex flex-col relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="absolute top-4 right-4 z-50 p-3 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <FiX className="h-6 w-6 text-white" />
        </button>

        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FiMusic className="h-16 w-16 text-white/50" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              ¡Aún no tienes historial!
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Genera algunas playlists, guarda canciones en favoritos y vuelve para ver tu Wrapped personalizado 🎵
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-spotify-green text-black font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-lg shadow-spotify-green/30"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex flex-col overflow-hidden relative">
        {/* Imagen de fondo con blur */}
        {wrappedData?.backgroundImage && (
          <div className="absolute inset-0">
            <img
              src={wrappedData.backgroundImage}
              alt=""
              className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-red-900/80" />
          </div>
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="absolute top-4 right-4 z-50 p-3 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <FiX className="h-6 w-6 text-white" />
        </button>

        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8 relative">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-spotify-green to-green-400 rounded-full flex items-center justify-center shadow-2xl shadow-spotify-green/40 animate-bounce" style={{ animationDuration: '2s' }}>
                <FiMusic className="h-20 w-20 text-black" />
              </div>
              <div className="absolute inset-0 w-40 h-40 mx-auto bg-spotify-green/40 rounded-full blur-2xl animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-white mb-4">
              Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-spotify-green to-green-300">Wrapped</span>
            </h1>
            <p className="text-xl text-white/70 mb-10">
              Descubre tu año musical en Motafy
            </p>

            <button
              onClick={handleStart}
              className="group relative px-12 py-5 bg-spotify-green text-black font-bold text-xl rounded-full hover:scale-105 transition-all duration-300 shadow-xl shadow-spotify-green/30 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FiPlay className="h-6 w-6" />
                Comenzar
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-spotify-green-light to-spotify-green opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentSlideData = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;
  const isFirstSlide = currentSlide === 0;

  // Obtener imagen de fondo para el slide actual
  const getSlideBackground = () => {
    if (!wrappedData) return null;

    const slideIndex = currentSlide % (wrappedData.topSongs?.length || 1);
    return wrappedData.topSongs?.[slideIndex]?.image || wrappedData.backgroundImage;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentSlideData.bg} transition-all duration-1000 flex flex-col relative overflow-hidden`}>
      {/* Imagen de fondo con blur */}
      {getSlideBackground() && (
        <div className="absolute inset-0 transition-all duration-1000">
          <img
            src={getSlideBackground()}
            alt=""
            className="w-full h-full object-cover opacity-30 blur-3xl scale-125"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bg} opacity-80`} />
        </div>
      )}

      {/* Efectos de partículas/destellos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-black/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Partículas decorativas */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header con botón cerrar */}
      <div className="relative z-50 p-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-3 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
        >
          <FiX className="h-6 w-6 text-white" />
        </button>

        {/* Indicadores de progreso */}
        <div className="flex-1 flex gap-1.5 mx-4 max-w-md">
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

        <div className="w-12" />
      </div>

      {/* Contenido del slide */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg mx-auto">

          {/* Slide 0: Intro */}
          {currentSlide === 0 && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-[0.3em] mb-6 transition-all duration-700 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Hola, {user?.display_name?.split(' ')[0]} 👋
              </p>
              <h1 className={`text-5xl sm:text-7xl font-black text-white mb-6 leading-tight transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Este es tu
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400">
                  resumen
                </span>
              </h1>
              <p className={`text-xl text-white/80 transition-all duration-700 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Veamos qué has estado haciendo en Motafy
              </p>
            </div>
          )}

          {/* Slide 1: Stats Overview */}
          {currentSlide === 1 && wrappedData && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-[0.3em] mb-8 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tu actividad
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: wrappedData.totalPlaylists, label: 'Playlists', icon: FiMusic, color: 'from-purple-400 to-pink-400' },
                  { value: wrappedData.totalSongs, label: 'Canciones', icon: FiTrendingUp, color: 'from-blue-400 to-cyan-400' },
                  { value: wrappedData.totalFavorites, label: 'Favoritos', icon: FiHeart, color: 'from-pink-400 to-red-400' },
                  { value: wrappedData.totalInteractions, label: 'Interacciones', icon: FiStar, color: 'from-yellow-400 to-orange-400' },
                ].map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-4xl font-black text-white">{stat.value}</div>
                    <div className="text-sm text-white/60 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 2: Top Artist */}
          {currentSlide === 2 && wrappedData && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-[0.3em] mb-4 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tu artista #1
              </p>

              {wrappedData.topArtist ? (
                <>
                  {/* Imagen grande del artista */}
                  <div className={`relative w-48 h-48 mx-auto mb-6 transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    {wrappedData.topArtist.image ? (
                      <img
                        src={wrappedData.topArtist.image}
                        alt={wrappedData.topArtist.name}
                        className="w-full h-full object-cover rounded-full shadow-2xl ring-4 ring-white/20"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center">
                        <FiUser className="h-20 w-20 text-white/30" />
                      </div>
                    )}
                    {/* Badge de #1 */}
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-black text-black">#1</span>
                    </div>
                  </div>

                  <h2 className={`text-4xl sm:text-5xl font-black text-white mb-3 transition-all duration-700 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {wrappedData.topArtist.name}
                  </h2>
                  <p className={`text-xl text-white/70 transition-all duration-700 ${animationPhase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                    {wrappedData.topArtist.count} canciones • {wrappedData.topArtist.percentage}% de tus favoritos
                  </p>
                </>
              ) : (
                <div className="py-12">
                  <FiUser className="h-20 w-20 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Añade canciones a favoritos para ver tu artista #1</p>
                </div>
              )}
            </div>
          )}

          {/* Slide 3: Top Songs */}
          {currentSlide === 3 && wrappedData && (
            <div>
              <p className={`text-white/60 text-sm uppercase tracking-[0.3em] mb-6 text-center transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tus canciones favoritas
              </p>

              {wrappedData.topSongs.length > 0 ? (
                <div className="space-y-3">
                  {wrappedData.topSongs.map((song, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 transition-all duration-700 ${
                        animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                      }`}
                      style={{ transitionDelay: `${150 + index * 100}ms` }}
                    >
                      {/* Posición */}
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {index + 1}
                      </span>

                      {/* Imagen */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {song.image ? (
                          <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <FiMusic className="h-5 w-5 text-white/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{song.name}</p>
                        <p className="text-sm text-white/60 truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiMusic className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Añade canciones a favoritos</p>
                </div>
              )}
            </div>
          )}

          {/* Slide 4: Géneros / Artistas */}
          {currentSlide === 4 && wrappedData && (
            <div>
              <p className={`text-white/60 text-sm uppercase tracking-[0.3em] mb-6 text-center transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tus artistas favoritos
              </p>

              {wrappedData.topArtists.length > 0 ? (
                <div className="space-y-4">
                  {wrappedData.topArtists.slice(0, 5).map((artist, index) => (
                    <div
                      key={artist.name}
                      className={`transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{ transitionDelay: `${150 + index * 100}ms` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                            {artist.image ? (
                              <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiUser className="h-4 w-4 text-white/30" />
                              </div>
                            )}
                          </div>
                          <span className="text-white font-semibold">{artist.name}</span>
                        </div>
                        <span className="text-spotify-green font-bold">{artist.percentage}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-spotify-green to-green-300 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: animationPhase >= 3 ? `${artist.percentage}%` : '0%',
                            transitionDelay: `${300 + index * 100}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUser className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Explora más música</p>
                </div>
              )}
            </div>
          )}

          {/* Slide 5: Actividad */}
          {currentSlide === 5 && wrappedData && (
            <div className="text-center">
              <p className={`text-white/60 text-sm uppercase tracking-[0.3em] mb-8 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                Tu actividad reciente
              </p>
              <div className={`p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <div className="flex items-end justify-between gap-3 h-40 mb-4">
                  {wrappedData.activityByDay.map((day, index) => {
                    const maxCount = Math.max(...wrappedData.activityByDay.map(d => d.count), 1);
                    const height = (day.count / maxCount) * 100;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full h-32 bg-white/10 rounded-t-xl relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-spotify-green via-green-400 to-green-300 rounded-t-xl transition-all duration-1000 ease-out"
                            style={{
                              height: animationPhase >= 3 ? `${Math.max(height, 8)}%` : '0%',
                              transitionDelay: `${200 + index * 80}ms`
                            }}
                          />
                        </div>
                        <span className="text-xs text-white/60 capitalize font-medium">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-white/40 text-sm">
                  {wrappedData.activityByDay.reduce((sum, d) => sum + d.count, 0)} acciones esta semana
                </p>
              </div>
            </div>
          )}

          {/* Slide 6: Summary */}
          {currentSlide === 6 && (
            <div className="text-center">
              <div className={`mb-8 transition-all duration-700 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
                  <FiAward className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className={`text-5xl sm:text-6xl font-black text-white mb-4 transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                ¡Eso es todo!
              </h1>
              <p className={`text-xl text-white/80 mb-10 transition-all duration-700 ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                Gracias por usar Motafy, {user?.display_name?.split(' ')[0]} 🎵
              </p>

              {/* Botones finales */}
              <div className={`flex flex-col sm:flex-row gap-4 justify-center relative z-[60] transition-all duration-700 ${animationPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard');
                  }}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
                >
                  Volver al Dashboard
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(0);
                  }}
                  className="px-8 py-4 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-all hover:scale-105 backdrop-blur-sm"
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
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-30">
        {!isLastSlide && (
          <>
            {!isFirstSlide && (
              <button
                onClick={prevSlide}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
              >
                <FiChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}

            <div className="flex items-center gap-2 text-white/60 text-sm px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <span>Toca para continuar</span>
              <FiChevronRight className="h-4 w-4 animate-pulse" />
            </div>

            <button
              onClick={nextSlide}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            >
              <FiChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Animación CSS para partículas flotantes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-40px) translateX(-10px); opacity: 0.3; }
          75% { transform: translateY(-20px) translateX(5px); opacity: 0.6; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

