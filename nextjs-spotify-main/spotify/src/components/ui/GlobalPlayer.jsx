'use client';

import { useRef } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiX, FiExternalLink, FiHeart, FiMusic } from 'react-icons/fi';
import { useAudio } from '@/context/AudioContext';
import { usePlaylist } from '@/context/PlaylistContext';

export default function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seekTo,
    changeVolume,
    toggleMute,
    closePlayer
  } = useAudio();

  const { toggleFavorite, isFavorite } = usePlaylist();
  const progressRef = useRef(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seekTo(percent);
  };

  if (!currentTrack) return null;

  const favorite = isFavorite(currentTrack.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-900/98 to-zinc-900/95 backdrop-blur-xl border-t border-white/10 animate-slide-up">
      {/* Barra de progreso superior (clickeable) */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="h-1 bg-white/10 cursor-pointer group"
      >
        <div
          className="h-full bg-spotify-green group-hover:bg-spotify-green-light transition-colors relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform translate-x-1/2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative group">
              {currentTrack.album?.images?.[0]?.url ? (
                <img
                  src={currentTrack.album.images[1]?.url || currentTrack.album.images[0].url}
                  alt={currentTrack.name}
                  className="w-14 h-14 rounded-lg object-cover shadow-lg group-hover:shadow-spotify-green/20 transition-shadow"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                  <FiMusic className="h-6 w-6 text-white/30" />
                </div>
              )}
              {/* Indicador de reproducción */}
              {isPlaying && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-spotify-green rounded-full animate-pulse"
                      style={{
                        height: `${8 + Math.random() * 8}px`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate text-sm sm:text-base">
                {currentTrack.name}
              </p>
              <p className="text-xs sm:text-sm text-white/50 truncate">
                {currentTrack.artists?.map(a => a.name).join(', ')}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`p-2 rounded-full transition-all hover:scale-110 ${
                favorite ? 'text-spotify-green' : 'text-white/50 hover:text-white'
              }`}
            >
              <FiHeart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Player controls - Centro */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <FiPause className="h-5 w-5 text-black" />
                ) : (
                  <FiPlay className="h-5 w-5 text-black ml-0.5" />
                )}
              </button>
            </div>

            {/* Tiempo */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume and actions - Derecha */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Volume */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-white/50 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <FiVolumeX className="h-5 w-5" />
                ) : (
                  <FiVolume2 className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Open in Spotify */}
            {currentTrack.external_urls?.spotify && (
              <a
                href={currentTrack.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex p-2 text-white/50 hover:text-spotify-green transition-colors"
                title="Abrir en Spotify"
              >
                <FiExternalLink className="h-5 w-5" />
              </a>
            )}

            {/* Close */}
            <button
              onClick={closePlayer}
              className="p-2 text-white/50 hover:text-white transition-colors"
              title="Cerrar reproductor"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Badge de preview */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
        <div className="bg-spotify-green text-black text-xs font-medium px-3 py-1 rounded-t-lg">
          Preview 30s
        </div>
      </div>
    </div>
  );
}

