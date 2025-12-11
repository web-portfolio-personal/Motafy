'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiSettings, FiInfo, FiDatabase } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import { useToast } from '@/context/ToastContext';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StorageManager from '@/components/ui/StorageManager';
import ApiStatsPanel from '@/components/ui/ApiStatsPanel';

import ArtistWidget from '@/components/widgets/ArtistWidget';
import TrackWidget from '@/components/widgets/TrackWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import MoodWidget from '@/components/widgets/MoodWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';

import PlaylistDisplay from '@/components/playlist/PlaylistDisplay';
import HistoryPanel from '@/components/playlist/HistoryPanel';
import StatsPanel from '@/components/playlist/StatsPanel';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const {
    preferences,
    updatePreferences,
    generatePlaylist,
    isGenerating,
    playlist
  } = usePlaylist();
  const toast = useToast();

  const [showTips, setShowTips] = useState(true);
  const [showStorageManager, setShowStorageManager] = useState(false);

  // Protección de ruta
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleGenerate = async () => {
    try {
      await generatePlaylist();
      setShowTips(false);
      toast.success('¡Playlist generada con éxito!');
    } catch (error) {
      console.error('Error generating playlist:', error);
      toast.error('Error al generar la playlist');
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

            {/* Generate Button */}
            <div className="bg-gradient-to-r from-spotify-green/20 via-green-600/20 to-spotify-green/20 rounded-2xl p-6 border border-spotify-green/30">
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
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  loading={isGenerating}
                  disabled={!hasSelections}
                  icon={<FiPlay className="h-5 w-5" />}
                  className="w-full sm:w-auto"
                >
                  Generar Playlist
                </Button>
              </div>
            </div>

            {/* Stats and History - Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:hidden">
              <StatsPanel />
              <HistoryPanel />
            </div>
          </div>

          {/* Right Column - Playlist + Stats */}
          <div className="space-y-6">
            <PlaylistDisplay />

            {/* Stats and History - Desktop */}
            <div className="hidden xl:block space-y-6">
              <StatsPanel />
              <HistoryPanel />

              {/* API Stats Panel */}
              <ApiStatsPanel />

              {/* Storage Button */}
              <button
                onClick={() => setShowStorageManager(true)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors text-sm text-white/60 hover:text-white"
              >
                <FiDatabase className="h-4 w-4" />
                Gestionar Almacenamiento
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Storage Manager Modal */}
      <StorageManager
        isOpen={showStorageManager}
        onClose={() => setShowStorageManager(false)}
      />
    </div>
  );
}

