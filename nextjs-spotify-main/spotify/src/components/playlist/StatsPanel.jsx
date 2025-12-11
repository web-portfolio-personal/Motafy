'use client';

import { useMemo } from 'react';
import { FiTrendingUp, FiMusic, FiBarChart2, FiDisc, FiZap, FiHeart } from 'react-icons/fi';
import { usePlaylist } from '@/context/PlaylistContext';

export default function StatsPanel() {
  const { playlist, history, favorites } = usePlaylist();

  const stats = useMemo(() => {
    if (playlist.length === 0) return null;

    // Promedio de popularidad
    const avgPopularity = Math.round(
      playlist.reduce((acc, t) => acc + (t.popularity || 0), 0) / playlist.length
    );

    // Géneros más comunes (basado en artistas)
    const genreCounts = {};
    playlist.forEach(track => {
      track.artists?.forEach(artist => {
        if (artist.genres) {
          artist.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    // Décadas
    const decadeCounts = {};
    playlist.forEach(track => {
      if (track.album?.release_date) {
        const year = parseInt(track.album.release_date.slice(0, 4));
        const decade = Math.floor(year / 10) * 10;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      }
    });

    const topDecade = Object.entries(decadeCounts)
      .sort((a, b) => b[1] - a[1])[0];

    // Duración total
    const totalDuration = playlist.reduce((acc, t) => acc + (t.duration_ms || 0), 0);
    const hours = Math.floor(totalDuration / 3600000);
    const minutes = Math.floor((totalDuration % 3600000) / 60000);

    // Artistas únicos
    const uniqueArtists = new Set(
      playlist.flatMap(t => t.artists?.map(a => a.id) || [])
    ).size;

    // Total playlists generadas
    const totalPlaylists = history.length;

    return {
      avgPopularity,
      topGenres,
      topDecade: topDecade ? `${topDecade[0]}s` : 'N/A',
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`,
      uniqueArtists,
      totalPlaylists,
      totalFavorites: favorites.length
    };
  }, [playlist, history, favorites]);

  if (!stats) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FiBarChart2 className="h-5 w-5 text-white/50" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Estadísticas</h3>
            <p className="text-xs text-white/50">Análisis de tu música</p>
          </div>
        </div>
        <p className="text-center text-white/40 py-8">
          Genera una playlist para ver las estadísticas
        </p>
      </div>
    );
  }

  const statItems = [
    {
      icon: FiTrendingUp,
      label: 'Popularidad promedio',
      value: `${stats.avgPopularity}%`,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      icon: FiMusic,
      label: 'Artistas únicos',
      value: stats.uniqueArtists,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: FiDisc,
      label: 'Década dominante',
      value: stats.topDecade,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      icon: FiZap,
      label: 'Duración total',
      value: stats.duration,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: FiBarChart2,
      label: 'Playlists generadas',
      value: stats.totalPlaylists,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: FiHeart,
      label: 'Canciones favoritas',
      value: stats.totalFavorites,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    }
  ];

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <FiBarChart2 className="h-5 w-5 text-white/50" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Estadísticas</h3>
          <p className="text-xs text-white/50">Análisis de tu música</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
            >
              <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className="text-lg font-bold text-white">{item.value}</p>
              <p className="text-xs text-white/50">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Top Genres */}
      {stats.topGenres.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 mb-2">Géneros más presentes</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.topGenres.map(genre => (
              <span
                key={genre}
                className="px-2 py-1 bg-spotify-green/20 text-spotify-green text-xs rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

