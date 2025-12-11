'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiBarChart2, FiTrendingUp, FiClock, FiMusic,
  FiDisc, FiCalendar, FiDatabase, FiActivity, FiHeart, FiZap
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import HistoryPanel from '@/components/playlist/HistoryPanel';
import ApiStatsPanel from '@/components/ui/ApiStatsPanel';
import StorageManager from '@/components/ui/StorageManager';

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { stats, getActivityByDay, favorites, playlistHistory } = usePlaylist();
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Obtener actividad por día
  const activityByDay = useMemo(() => {
    return getActivityByDay ? getActivityByDay() : [];
  }, [getActivityByDay]);

  // Calcular max para la gráfica
  const maxActivity = useMemo(() => {
    return Math.max(...activityByDay.map(d => d.count), 1);
  }, [activityByDay]);

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
            {/* Cards de estadísticas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Playlists generadas',
                  value: stats?.playlistsGenerated || 0,
                  icon: FiDisc,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10',
                  gradient: 'from-purple-500 to-pink-500'
                },
                {
                  label: 'Canciones generadas',
                  value: stats?.songsGenerated || 0,
                  icon: FiMusic,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                {
                  label: 'Favoritos',
                  value: favorites?.length || 0,
                  icon: FiHeart,
                  color: 'text-pink-400',
                  bg: 'bg-pink-500/10',
                  gradient: 'from-pink-500 to-red-500'
                },
                {
                  label: 'Interacciones totales',
                  value: stats?.totalInteractions || 0,
                  icon: FiZap,
                  color: 'text-yellow-400',
                  bg: 'bg-yellow-500/10',
                  gradient: 'from-yellow-500 to-orange-500'
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative bg-[var(--background-elevated)] rounded-2xl p-5 border border-[var(--border-color)] overflow-hidden group hover:border-spotify-green/30 transition-all"
                >
                  {/* Gradiente decorativo */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-[var(--foreground)]">{stat.value}</div>
                  <div className="text-sm text-[var(--foreground-secondary)]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Gráfico de actividad - Estilo onda Spotify */}
            <div className="bg-[var(--background-elevated)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                <FiActivity className="h-5 w-5 text-spotify-green" />
                Actividad últimos 7 días
              </h2>
              <p className="text-sm text-[var(--foreground-tertiary)] mb-6">
                Cada interacción cuenta: likes, playlists generadas, canciones exploradas
              </p>

              {/* Gráfica visual tipo onda */}
              <div className="relative h-48">
                {/* Líneas de fondo */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-t border-[var(--border-color)] opacity-30" />
                  ))}
                </div>

                {/* Barras con animación */}
                <div className="relative h-full flex items-end justify-between gap-2 px-2">
                  {activityByDay.map((day, index) => {
                    const height = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--foreground)] text-[var(--background)] text-xs px-2 py-1 rounded font-medium">
                          {day.count} acciones
                        </div>

                        {/* Barra */}
                        <div className="w-full h-36 bg-[var(--background-highlight)] rounded-t-xl relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-xl transition-all duration-1000 ease-out"
                            style={{
                              height: `${Math.max(height, 5)}%`,
                              background: `linear-gradient(to top, #1DB954, #1ed760)`
                            }}
                          >
                            {/* Efecto de brillo */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          </div>
                        </div>

                        {/* Día */}
                        <span className="text-xs text-[var(--foreground-secondary)] capitalize font-medium">{day.day}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Línea de tendencia SVG */}
                <svg className="absolute inset-0 pointer-events-none" style={{ top: '0', height: '144px', marginTop: '0' }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1DB954" />
                      <stop offset="100%" stopColor="#1ed760" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={activityByDay.map((day, i) => {
                      const x = (i / (activityByDay.length - 1)) * 100;
                      const y = 100 - (maxActivity > 0 ? (day.count / maxActivity) * 100 : 0);
                      return `${x}%,${y}%`;
                    }).join(' ')}
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(29, 185, 84, 0.5))',
                      opacity: 0.8
                    }}
                  />
                </svg>
              </div>

              {/* Leyenda */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-spotify-green" />
                    <span className="text-[var(--foreground-secondary)]">Actividad diaria</span>
                  </div>
                </div>
                <div className="text-[var(--foreground-tertiary)]">
                  Total: {activityByDay.reduce((sum, d) => sum + d.count, 0)} acciones esta semana
                </div>
              </div>
            </div>

            {/* Stats adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wrapped Views */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-1">Veces que viste tu Wrapped</p>
                    <p className="text-4xl font-bold text-[var(--foreground)]">{stats?.wrappedViews || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FiCalendar className="h-7 w-7 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Promedio de canciones por playlist */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-1">Promedio canciones/playlist</p>
                    <p className="text-4xl font-bold text-[var(--foreground)]">
                      {stats?.playlistsGenerated > 0
                        ? Math.round((stats?.songsGenerated || 0) / stats.playlistsGenerated)
                        : 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="h-7 w-7 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
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

      {/* Estilos para animación shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

