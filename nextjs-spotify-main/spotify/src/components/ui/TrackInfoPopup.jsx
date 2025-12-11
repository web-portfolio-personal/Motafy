'use client';

import { useState } from 'react';
import {
  FiPlay, FiPause, FiHeart, FiPlus, FiX, FiExternalLink,
  FiMusic, FiDisc, FiClock, FiTrendingUp, FiCalendar, FiUser
} from 'react-icons/fi';

export default function TrackInfoPopup({
  track,
  isVisible,
  position = 'right',
  onPlay,
  onToggleFavorite,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  isFavorite = false,
  isInPlaylist = false,
  isPlaying = false,
  hasPreview = false,
  onMouseEnter,
  onMouseLeave
}) {
  if (!isVisible || !track) return null;

  const formatDuration = (ms) => {
    if (!ms) return '--:--';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getYear = () => {
    return track.album?.release_date?.split('-')[0] || 'N/A';
  };

  const positionClasses = {
    right: 'left-full ml-2 top-0',
    left: 'right-full mr-2 top-0',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2'
  };

return (
    <div
      className={`absolute ${positionClasses[position]} z-50 w-72 bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header con imagen grande */}
      <div className="relative">
        <div className="aspect-square w-full bg-zinc-800">
          {track.album?.images?.[0]?.url ? (
            <img
              src={track.album.images[0].url}
              alt={track.album.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiMusic className="h-16 w-16 text-white/20" />
            </div>
          )}
        </div>

        {/* Overlay con botón de play */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-4">
          {hasPreview ? (
            <button
              onClick={onPlay}
              className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-spotify-green/30"
            >
              {isPlaying ? (
                <FiPause className="h-6 w-6 text-black" />
              ) : (
                <FiPlay className="h-6 w-6 text-black ml-1" />
              )}
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/60">
              Sin preview disponible
            </div>
          )}
        </div>

        {/* Badge de preview */}
        {hasPreview && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-spotify-green text-black text-xs font-medium rounded-full">
            30s Preview
          </div>
        )}
      </div>

      {/* Información de la canción */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg truncate mb-1">
          {track.name}
        </h3>
        <p className="text-white/60 text-sm truncate mb-4">
          {track.artists?.map(a => a.name).join(', ')}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <FiDisc className="h-4 w-4 text-purple-400" />
            <div className="min-w-0">
              <p className="text-xs text-white/40">Álbum</p>
              <p className="text-xs text-white truncate">{track.album?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <FiCalendar className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-white/40">Año</p>
              <p className="text-xs text-white">{getYear()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <FiClock className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-xs text-white/40">Duración</p>
              <p className="text-xs text-white">{formatDuration(track.duration_ms)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <FiTrendingUp className="h-4 w-4 text-orange-400" />
            <div>
              <p className="text-xs text-white/40">Popularidad</p>
              <p className="text-xs text-white">{track.popularity || 0}/100</p>
            </div>
          </div>
        </div>

        {/* Barra de popularidad */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Popularidad</span>
            <span>{track.popularity || 0}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all"
              style={{ width: `${track.popularity || 0}%` }}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              isFavorite 
                ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' 
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Favorito' : 'Me gusta'}
          </button>

          {isInPlaylist ? (
            <button
              onClick={onRemoveFromPlaylist}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all"
            >
              <FiX className="h-4 w-4" />
              Quitar
            </button>
          ) : (
            <button
              onClick={onAddToPlaylist}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-spotify-green/20 text-spotify-green rounded-xl font-medium hover:bg-spotify-green/30 transition-all"
            >
              <FiPlus className="h-4 w-4" />
              Añadir
            </button>
          )}
        </div>

        {/* Link a Spotify */}
        {track.external_urls?.spotify && (
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-3 py-2 text-sm text-white/50 hover:text-spotify-green transition-colors"
          >
            <FiExternalLink className="h-4 w-4" />
            Abrir en Spotify
          </a>
        )}
      </div>
    </div>
  );
}

