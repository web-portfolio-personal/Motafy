'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiInfo, FiShuffle, FiHeart, FiPlus, FiX, FiMusic } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import { useToast } from '@/context/ToastContext';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import ArtistWidget from '@/components/widgets/ArtistWidget';
import TrackWidget from '@/components/widgets/TrackWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import MoodWidget from '@/components/widgets/MoodWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';

import PlaylistDisplay from '@/components/playlist/PlaylistDisplay';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const {
    preferences,
    updatePreferences,
    generatePlaylist,
    isGenerating,
    playlist,
    trackActivity,
    generateSingleTrack,
    toggleFavorite,
    isFavorite,
    addTrackToPlaylist
  } = usePlaylist();
  const toast = useToast();

  const [showTips, setShowTips] = useState(true);
  const [singleTrack, setSingleTrack] = useState(null);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);
  const [showSingleTrackModal, setShowSingleTrackModal] = useState(false);

  // Protección de ruta
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

const handleGenerate = async () => {
    try {
      const result = await generatePlaylist();
      setShowTips(false);

      // Registrar actividad
      if (trackActivity && result?.length > 0) {
        trackActivity('playlist_generated', { trackCount: result.length });
      }

      toast.success('¡Playlist generada con éxito!');
    } catch (error) {
      console.error('Error generating playlist:', error);
      toast.error('Error al generar la playlist');
    }
  };

  // Generar canción individual
  const handleGenerateSingle = async () => {
    setIsGeneratingSingle(true);
    try {
      const track = await generateSingleTrack();
      if (track) {
        setSingleTrack(track);
        setShowSingleTrackModal(true);
        toast.success('¡Canción generada!');
      } else {
        toast.error('No se encontró ninguna canción');
      }
    } catch (error) {
      console.error('Error generating single track:', error);
      toast.error('Error al generar canción');
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  // Añadir canción generada a la playlist
  const addSingleTrackToPlaylist = () => {
    if (singleTrack) {
      const added = addTrackToPlaylist(singleTrack);
      if (added) {
        toast.success('¡Canción añadida a la playlist!');
        setShowSingleTrackModal(false);
      } else {
        toast.error('La canción ya está en la playlist');
      }
    }
  };

  // Handlers para actualizar preferencias
  const handleArtistsChange = (artists) => {
    updatePreferences({ artists });
  };

  const handleTracksChange = (tracks) => {
    updatePreferences({ tracks });
  };

  const handleGenresChange = (genres) => {
    updatePreferences({ genres });
  };

  const handleDecadesChange = (decades) => {
    updatePreferences({ decades });
  };

  const handleMoodChange = (mood) => {
    updatePreferences({ mood });
  };

  const handlePopularityChange = (popularity) => {
    updatePreferences({ popularity });
  };

  // Verificar si hay algo seleccionado
  const hasSelections =
    preferences.artists.length > 0 ||
    preferences.tracks.length > 0 ||
    preferences.genres.length > 0 ||
    preferences.decades.length > 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Message */}
        {user && (
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              ¡Hola, {user.display_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-[var(--foreground-secondary)]">
              Configura los widgets y genera tu playlist personalizada
            </p>
          </div>
        )}

        {/* Tips Banner */}
        {showTips && playlist.length === 0 && (
          <div className="mb-6 p-4 bg-spotify-green/10 border border-spotify-green/20 rounded-xl flex items-start gap-3">
            <FiInfo className="h-5 w-5 text-spotify-green flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[var(--foreground)]">
                <strong>Consejo:</strong> Selecciona al menos algunos artistas, géneros o canciones
                en los widgets de la izquierda, ajusta el mood y la popularidad, y luego haz clic
                en &ldquo;Generar Playlist&rdquo; para crear tu mezcla perfecta.
              </p>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Widgets */}
          <div className="xl:col-span-2 space-y-6">
            {/* Widgets Grid - Primera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ArtistWidget
                selectedArtists={preferences.artists}
                onSelect={handleArtistsChange}
                maxItems={5}
              />
              <TrackWidget
                selectedTracks={preferences.tracks}
                onSelect={handleTracksChange}
                maxItems={5}
              />
            </div>

            {/* Widgets Grid - Segunda fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GenreWidget
                selectedGenres={preferences.genres}
                onSelect={handleGenresChange}
                maxItems={5}
              />
              <DecadeWidget
                selectedDecades={preferences.decades}
                onSelect={handleDecadesChange}
              />
            </div>

            {/* Widgets Grid - Tercera fila (Mood y Popularity - más altos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MoodWidget
                mood={preferences.mood}
                onSelect={handleMoodChange}
              />
              <PopularityWidget
                popularity={preferences.popularity}
                onSelect={handlePopularityChange}
              />
            </div>

            {/* Generate Buttons */}
            <div className="bg-gradient-to-r from-spotify-green/20 via-green-600/20 to-spotify-green/20 rounded-2xl p-6 border border-spotify-green/30">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
                      ¿Listo para crear tu playlist?
                    </h2>
                    <p className="text-[var(--foreground-secondary)] text-sm">
                      {hasSelections
                        ? `${preferences.artists.length} artistas, ${preferences.genres.length} géneros, ${preferences.decades.length} décadas seleccionados`
                        : 'Selecciona algunas preferencias para empezar'
                      }
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      size="lg"
                      onClick={handleGenerate}
                      loading={isGenerating}
                      disabled={!hasSelections}
                      icon={<FiPlay className="h-5 w-5" />}
                      className="flex-1 sm:flex-none"
                    >
                      Generar Playlist
                    </Button>
                  </div>
                </div>

                {/* Botón generar canción individual */}
                <div className="pt-4 border-t border-spotify-green/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">¿Solo quieres una canción?</h3>
                      <p className="text-[var(--foreground-secondary)] text-sm">Genera una canción aleatoria basada en tus preferencias</p>
                    </div>
                    <button
                      onClick={handleGenerateSingle}
                      disabled={isGeneratingSingle}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      {isGeneratingSingle ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FiShuffle className="h-4 w-4" />
                      )}
                      Generar Canción
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Playlist */}
          <div className="space-y-6">
            <PlaylistDisplay />
          </div>
        </div>
      </main>

      <Footer />

{/* Modal de canción individual */}
      {showSingleTrackModal && singleTrack && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSingleTrackModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-3xl p-6 border border-white/10 shadow-2xl animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fondo con imagen blur */}
            {singleTrack.album?.images?.[0]?.url && (
              <div className="absolute inset-0 -z-10">
                <img
                  src={singleTrack.album.images[0].url}
                  alt=""
                  className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
                />
              </div>
            )}

            {/* Botón cerrar - Z-INDEX ALTO */}
            <button
              onClick={() => setShowSingleTrackModal(false)}
              className="absolute top-4 right-4 z-50 p-3 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
            >
              <FiX className="h-6 w-6 text-white" />
            </button>

            <div className="text-center relative z-10">
              <p className="text-white/60 text-sm uppercase tracking-wider mb-4">Tu canción aleatoria</p>

              {/* Imagen del álbum con botón de play */}
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl group">
                {singleTrack.album?.images?.[0]?.url ? (
                  <img
                    src={singleTrack.album.images[0].url}
                    alt={singleTrack.album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <FiMusic className="h-16 w-16 text-white/30" />
                  </div>
                )}

                {/* Overlay con play */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {singleTrack.preview_url ? (
                    <div className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <FiPlay className="h-6 w-6 text-black ml-1" />
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-white/20 rounded-full text-xs text-white/80">
                      Sin preview
                    </div>
                  )}
                </div>

                {/* Badge de preview */}
                {singleTrack.preview_url && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-spotify-green text-black text-xs font-medium rounded-full">
                    30s
                  </div>
                )}
              </div>

              {/* Info de la canción */}
              <h2 className="text-xl font-bold text-white mb-1 truncate px-4">{singleTrack.name}</h2>
              <p className="text-white/70 mb-1">{singleTrack.artists?.map(a => a.name).join(', ')}</p>
              <p className="text-white/50 text-sm mb-4">{singleTrack.album?.name}</p>

              {/* Stats de la canción */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="p-2 bg-white/10 rounded-xl">
                  <p className="text-xs text-white/40">Año</p>
                  <p className="text-sm font-medium text-white">{singleTrack.album?.release_date?.split('-')[0] || 'N/A'}</p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl">
                  <p className="text-xs text-white/40">Duración</p>
                  <p className="text-sm font-medium text-white">
                    {singleTrack.duration_ms ? `${Math.floor(singleTrack.duration_ms / 60000)}:${String(Math.floor((singleTrack.duration_ms % 60000) / 1000)).padStart(2, '0')}` : 'N/A'}
                  </p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl">
                  <p className="text-xs text-white/40">Popularidad</p>
                  <p className="text-sm font-medium text-white">{singleTrack.popularity || 0}%</p>
                </div>
              </div>

              {/* Barra de popularidad */}
              <div className="mb-6 px-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full"
                    style={{ width: `${singleTrack.popularity || 0}%` }}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => {
                    toggleFavorite(singleTrack);
                    toast.success(isFavorite(singleTrack.id) ? 'Eliminado de favoritos' : '¡Añadido a favoritos!');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                    isFavorite(singleTrack.id)
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <FiHeart className={`h-4 w-4 ${isFavorite(singleTrack.id) ? 'fill-current' : ''}`} />
                  {isFavorite(singleTrack.id) ? 'Favorito' : 'Me gusta'}
                </button>

                {playlist.length > 0 && (
                  <button
                    onClick={addSingleTrackToPlaylist}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-full font-medium transition-all"
                  >
                    <FiPlus className="h-4 w-4" />
                    Añadir a playlist
                  </button>
                )}

                <button
                  onClick={handleGenerateSingle}
                  disabled={isGeneratingSingle}
                  className="flex items-center gap-2 px-4 py-2.5 bg-spotify-green text-black rounded-full font-medium hover:bg-spotify-green-light transition-all disabled:opacity-50"
                >
                  <FiShuffle className="h-4 w-4" />
                  Otra más
                </button>
              </div>

              {/* Link a Spotify */}
              {singleTrack.external_urls?.spotify && (
                <a
                  href={singleTrack.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-6 text-sm text-white/50 hover:text-spotify-green transition-colors"
                >
                  Abrir en Spotify →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

