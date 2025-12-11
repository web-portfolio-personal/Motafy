'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiHeart, FiMusic, FiGrid, FiList, FiPlay, FiPause, FiSearch, FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import { useAudio } from '@/context/AudioContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { favorites, toggleFavorite } = usePlaylist();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name' | 'artist' | 'year'
  const [searchQuery, setSearchQuery] = useState('');

  // Estadísticas de favoritos
  const stats = useMemo(() => {
    if (favorites.length === 0) return null;

    // Contar artistas
    const artistCount = {};
    const decadeCount = {};

    favorites.forEach(track => {
      // Artistas
      const artistName = track.artists?.[0]?.name || 'Desconocido';
      artistCount[artistName] = (artistCount[artistName] || 0) + 1;

      // Décadas (aproximado por el año del álbum si está disponible)
      const year = track.album?.release_date?.split('-')[0];
      if (year) {
        const decade = Math.floor(parseInt(year) / 10) * 10;
        decadeCount[decade] = (decadeCount[decade] || 0) + 1;
      }
    });

    // Top artistas con porcentaje
    const topArtists = Object.entries(artistCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / favorites.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Décadas
    const decades = Object.entries(decadeCount)
      .map(([decade, count]) => ({
        decade: `${decade}s`,
        count,
        percentage: Math.round((count / favorites.length) * 100)
      }))
      .sort((a, b) => parseInt(b.decade) - parseInt(a.decade));

    return {
      total: favorites.length,
      topArtists,
      decades,
      uniqueArtists: Object.keys(artistCount).length
    };
  }, [favorites]);

  // Filtrar y ordenar favoritos
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    // Buscar
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(track =>
        track.name?.toLowerCase().includes(query) ||
        track.artists?.[0]?.name?.toLowerCase().includes(query) ||
        track.album?.name?.toLowerCase().includes(query)
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'artist':
        result.sort((a, b) =>
          (a.artists?.[0]?.name || '').localeCompare(b.artists?.[0]?.name || '')
        );
        break;
      case 'year':
        result.sort((a, b) => {
          const yearA = a.album?.release_date?.split('-')[0] || '0';
          const yearB = b.album?.release_date?.split('-')[0] || '0';
          return yearB.localeCompare(yearA);
        });
        break;
      case 'recent':
      default:
        // Mantener orden original (más recientes primero)
        result.reverse();
        break;
    }

    return result;
  }, [favorites, searchQuery, sortBy]);

  // Protección de ruta - después de todos los hooks
  if (!authLoading && !isAuthenticated) {
    router.push('/');
    return null;
  }

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header de página */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <FiHeart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
                Tus Favoritos
              </h1>
              <p className="text-[var(--foreground-secondary)]">
                {favorites.length} canciones guardadas
              </p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-[var(--background-highlight)] rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="h-12 w-12 text-[var(--foreground-tertiary)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Aún no tienes favoritos
            </h2>
            <p className="text-[var(--foreground-secondary)] mb-6">
              Genera playlists y marca tus canciones favoritas con el corazón
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green-light transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel de estadísticas */}
            <div className="lg:col-span-1 space-y-6">
              {/* Resumen */}
              <div className="bg-[var(--background-elevated)] rounded-2xl p-6 border border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <FiBarChart2 className="h-5 w-5 text-spotify-green" />
                  Estadísticas
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--background-highlight)] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-spotify-green">{stats?.total}</div>
                    <div className="text-xs text-[var(--foreground-secondary)]">Canciones</div>
                  </div>
                  <div className="bg-[var(--background-highlight)] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats?.uniqueArtists}</div>
                    <div className="text-xs text-[var(--foreground-secondary)]">Artistas</div>
                  </div>
                </div>

                {/* Top Artistas */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                    Top Artistas
                  </h3>
                  <div className="space-y-3">
                    {stats?.topArtists.map((artist, index) => (
                      <div key={artist.name} className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-spotify-green/20 rounded-full flex items-center justify-center text-xs font-bold text-spotify-green">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-[var(--foreground)] truncate">{artist.name}</span>
                            <span className="text-xs text-spotify-green font-medium">{artist.percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--background-highlight)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-spotify-green to-spotify-green-light rounded-full transition-all duration-500"
                              style={{ width: `${artist.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por Décadas */}
                {stats?.decades.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                      Por Década
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.decades.map(({ decade, count, percentage }) => (
                        <div
                          key={decade}
                          className="px-3 py-2 bg-[var(--background-highlight)] rounded-lg text-center"
                        >
                          <div className="text-sm font-semibold text-[var(--foreground)]">{decade}</div>
                          <div className="text-xs text-spotify-green">{percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de favoritos */}
            <div className="lg:col-span-2">
              {/* Controles */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Búsqueda */}
                <div className="flex-1 min-w-[200px] relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Buscar en favoritos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--background-elevated)] border border-[var(--border-color)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-spotify-green/50"
                  />
                </div>

                {/* Ordenar */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-[var(--background-elevated)] border border-[var(--border-color)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-spotify-green/50"
                >
                  <option value="recent">Más recientes</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="artist">Artista A-Z</option>
                  <option value="year">Año</option>
                </select>

                {/* Vista */}
                <div className="flex bg-[var(--background-elevated)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-spotify-green text-black' : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'}`}
                  >
                    <FiGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-spotify-green text-black' : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'}`}
                  >
                    <FiList className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lista/Grid de canciones */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredFavorites.map((track, index) => (
                    <div
                      key={track.id || index}
                      className="group bg-[var(--background-elevated)] rounded-xl p-4 border border-[var(--border-color)] hover:border-spotify-green/30 transition-all hover:shadow-lg hover:shadow-spotify-green/5"
                    >
                      {/* Imagen del álbum */}
                      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-[var(--background-highlight)]">
                        {track.album?.images?.[0]?.url ? (
                          <img
                            src={track.album.images[0].url}
                            alt={track.album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiMusic className="h-8 w-8 text-[var(--foreground-tertiary)]" />
                          </div>
                        )}
                        {/* Overlay con botones */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {track.preview_url && (
                            <button
                              onClick={() => playTrack(track)}
                              className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              {currentTrack?.id === track.id && isPlaying ? (
                                <FiPause className="h-5 w-5 text-black" />
                              ) : (
                                <FiPlay className="h-5 w-5 text-black ml-0.5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => toggleFavorite(track)}
                            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <FiHeart className="h-5 w-5 text-white fill-current" />
                          </button>
                        </div>
                      </div>
                      {/* Info */}
                      <h3 className="font-medium text-[var(--foreground)] text-sm truncate">
                        {track.name}
                      </h3>
                      <p className="text-xs text-[var(--foreground-secondary)] truncate">
                        {track.artists?.map(a => a.name).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFavorites.map((track, index) => (
                    <div
                      key={track.id || index}
                      className="group flex items-center gap-4 p-3 bg-[var(--background-elevated)] rounded-xl border border-[var(--border-color)] hover:border-spotify-green/30 transition-all"
                    >
                      <span className="w-8 text-center text-sm text-[var(--foreground-tertiary)]">
                        {index + 1}
                      </span>
                      {/* Imagen */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--background-highlight)] flex-shrink-0">
                        {track.album?.images?.[0]?.url ? (
                          <img
                            src={track.album.images[0].url}
                            alt={track.album.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiMusic className="h-5 w-5 text-[var(--foreground-tertiary)]" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[var(--foreground)] truncate">
                          {track.name}
                        </h3>
                        <p className="text-sm text-[var(--foreground-secondary)] truncate">
                          {track.artists?.map(a => a.name).join(', ')}
                        </p>
                      </div>
                      {/* Álbum */}
                      <div className="hidden md:block flex-1 min-w-0">
                        <p className="text-sm text-[var(--foreground-secondary)] truncate">
                          {track.album?.name}
                        </p>
                      </div>
                      {/* Año */}
                      <div className="hidden sm:block text-sm text-[var(--foreground-tertiary)]">
                        {track.album?.release_date?.split('-')[0]}
                      </div>
                      {/* Acciones */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {track.preview_url && (
                          <button
                            onClick={() => playTrack(track)}
                            className="p-2 hover:bg-spotify-green/20 rounded-full transition-colors"
                          >
                            {currentTrack?.id === track.id && isPlaying ? (
                              <FiPause className="h-4 w-4 text-spotify-green" />
                            ) : (
                              <FiPlay className="h-4 w-4 text-spotify-green" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => toggleFavorite(track)}
                          className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                        >
                          <FiHeart className="h-4 w-4 text-red-500 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredFavorites.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <FiSearch className="h-12 w-12 text-[var(--foreground-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--foreground-secondary)]">
                    No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

