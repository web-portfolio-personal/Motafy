'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiBarChart2, FiTrendingUp, FiClock, FiMusic,
  FiDisc, FiCalendar, FiDatabase, FiActivity
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import HistoryPanel from '@/components/playlist/HistoryPanel';
import StatsPanel from '@/components/playlist/StatsPanel';
import ApiStatsPanel from '@/components/ui/ApiStatsPanel';
import StorageManager from '@/components/ui/StorageManager';

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { playlistHistory, favorites } = usePlaylist();
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Calcular estadísticas generales - ANTES de cualquier return condicional
  const generalStats = useMemo(() => {
    const totalPlaylists = playlistHistory?.length || 0;
    const totalTracks = playlistHistory?.reduce((acc, p) => acc + (p.tracks?.length || 0), 0) || 0;
    const totalFavorites = favorites?.length || 0;

    // Tracks por playlist promedio
    const avgTracksPerPlaylist = totalPlaylists > 0 ? Math.round(totalTracks / totalPlaylists) : 0;

    // Artistas únicos en favoritos
    const uniqueArtists = new Set(favorites?.map(t => t.artists?.[0]?.name).filter(Boolean)).size;

    return {
      totalPlaylists,
      totalTracks,
      totalFavorites,
      avgTracksPerPlaylist,
      uniqueArtists
    };
  }, [playlistHistory, favorites]);

  // Actividad por día (últimos 7 días)
  const activityByDay = useMemo(() => {
    if (!playlistHistory || playlistHistory.length === 0) return [];

    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = playlistHistory.filter(p => {
        if (!p.createdAt) return false;
        const pDate = new Date(p.createdAt).toISOString().split('T')[0];
        return pDate === dateStr;
      }).length;

      last7Days.push({
        day: date.toLocaleDateString('es', { weekday: 'short' }),
        date: dateStr,
        count
      });
    }

    return last7Days;
  }, [playlistHistory]);

  // Protección de ruta - DESPUÉS de todos los hooks
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

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FiBarChart2 },
    { id: 'history', label: 'Historial', icon: FiClock },
    { id: 'system', label: 'Sistema', icon: FiDatabase },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header de página */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiBarChart2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
                Estadísticas
              </h1>
              <p className="text-[var(--foreground-secondary)]">
                Analiza tu actividad en Motafy
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-spotify-green text-black'
                  : 'bg-[var(--background-elevated)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] border border-[var(--border-color)]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido según tab activa */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Playlists creadas', value: generalStats.totalPlaylists, icon: FiDisc, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Canciones generadas', value: generalStats.totalTracks, icon: FiMusic, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Favoritos', value: generalStats.totalFavorites, icon: FiTrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                { label: 'Artistas únicos', value: generalStats.uniqueArtists, icon: FiActivity, color: 'text-green-400', bg: 'bg-green-500/10' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-[var(--background-elevated)] rounded-2xl p-5 border border-[var(--border-color)]"
                >
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
                  <div className="text-sm text-[var(--foreground-secondary)]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Gráfico de actividad */}
            <div className="bg-[var(--background-elevated)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-spotify-green" />
                Actividad últimos 7 días
              </h2>
              <div className="flex items-end justify-between gap-2 h-32">
                {activityByDay.map((day, index) => {
                  const maxCount = Math.max(...activityByDay.map(d => d.count), 1);
                  const height = (day.count / maxCount) * 100;

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-[var(--background-highlight)] rounded-t-lg relative" style={{ height: '100px' }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-spotify-green to-spotify-green-light rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--foreground-secondary)] capitalize">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* StatsPanel original */}
            <StatsPanel />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <HistoryPanel expanded />
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <ApiStatsPanel />

            {/* Botón de gestión de almacenamiento */}
            <div className="bg-[var(--background-elevated)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <FiDatabase className="h-5 w-5 text-spotify-green" />
                Almacenamiento Local
              </h2>
              <p className="text-[var(--foreground-secondary)] mb-4">
                Gestiona los datos almacenados localmente en tu navegador.
              </p>
              <button
                onClick={() => setShowStorageManager(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-spotify-green text-black font-medium rounded-xl hover:bg-spotify-green-light transition-colors"
              >
                <FiDatabase className="h-4 w-4" />
                Gestionar Almacenamiento
              </button>
            </div>
          </div>
        )}
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

