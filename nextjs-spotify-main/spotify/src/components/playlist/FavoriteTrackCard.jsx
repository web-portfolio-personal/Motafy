'use client';

import { useState, useRef, useEffect } from 'react';
import { FiHeart, FiPlay, FiPause, FiMusic, FiInfo } from 'react-icons/fi';
import { useAudio } from '@/context/AudioContext';
import { usePlaylist } from '@/context/PlaylistContext';
import TrackInfoPopup from '@/components/ui/TrackInfoPopup';

export default function FavoriteTrackCard({ track, index, viewMode = 'grid' }) {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { toggleFavorite, isFavorite, addTrackToPlaylist } = usePlaylist();
  const [showInfo, setShowInfo] = useState(false);
  const infoTimeoutRef = useRef(null);

  const favorite = isFavorite(track.id);
  const isCurrentTrack = currentTrack?.id === track.id;
  const isThisPlaying = isCurrentTrack && isPlaying;

  useEffect(() => {
    return () => {
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    infoTimeoutRef.current = setTimeout(() => {
      setShowInfo(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }
    setTimeout(() => {
      setShowInfo(false);
    }, 100);
  };

  const handlePlay = () => {
    playTrack(track);
  };

  if (viewMode === 'grid') {
    return (
      <div className="group bg-[var(--background-elevated)] rounded-xl p-4 border border-[var(--border-color)] hover:border-spotify-green/30 transition-all hover:shadow-lg hover:shadow-spotify-green/5">
        {/* Imagen del álbum con popup */}
        <div
          className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-[var(--background-highlight)]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {track.album?.images?.[0]?.url ? (
            <img
              src={track.album.images[0].url}
              alt={track.album?.name || track.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isCurrentTrack ? 'ring-2 ring-spotify-green' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiMusic className="h-8 w-8 text-[var(--foreground-tertiary)]" />
            </div>
          )}

          {/* Overlay con botones */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={handlePlay}
              className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              {isThisPlaying ? (
                <FiPause className="h-5 w-5 text-black" />
              ) : (
                <FiPlay className="h-5 w-5 text-black ml-0.5" />
              )}
            </button>
            <button
              onClick={() => toggleFavorite(track)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
            >
              <FiHeart className="h-5 w-5 text-white fill-current" />
            </button>
          </div>

          {/* Indicador de info */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
              <FiInfo className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Badge de preview */}
          {track.preview_url && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-spotify-green text-black text-xs font-medium rounded-full">
              30s
            </div>
          )}

          {/* Popup de información */}
          <TrackInfoPopup
            track={track}
            isVisible={showInfo}
            position="bottom"
            onPlay={handlePlay}
            onToggleFavorite={() => toggleFavorite(track)}
            onAddToPlaylist={() => addTrackToPlaylist?.(track)}
            onRemoveFromPlaylist={() => toggleFavorite(track)}
            isFavorite={favorite}
            isInPlaylist={false}
            isPlaying={isThisPlaying}
            hasPreview={!!track.preview_url}
          />
        </div>

        {/* Info */}
        <h3 className={`font-medium text-sm truncate ${isCurrentTrack ? 'text-spotify-green' : 'text-[var(--foreground)]'}`}>
          {track.name}
        </h3>
        <p className="text-xs text-[var(--foreground-secondary)] truncate">
          {track.artists?.map(a => a.name).join(', ')}
        </p>
      </div>
    );
  }

  // Vista lista
  return (
    <div className="group flex items-center gap-4 p-3 bg-[var(--background-elevated)] rounded-xl border border-[var(--border-color)] hover:border-spotify-green/30 transition-all">
      <span className="w-8 text-center text-sm text-[var(--foreground-tertiary)]">
        {index + 1}
      </span>

      {/* Imagen con popup */}
      <div
        className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--background-highlight)] flex-shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {track.album?.images?.[0]?.url ? (
          <img
            src={track.album.images[0].url}
            alt={track.album?.name || track.name}
            className={`w-full h-full object-cover ${isCurrentTrack ? 'ring-2 ring-spotify-green' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiMusic className="h-5 w-5 text-[var(--foreground-tertiary)]" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <FiInfo className="h-4 w-4 text-white" />
        </div>

        {/* Popup */}
        <TrackInfoPopup
          track={track}
          isVisible={showInfo}
          position="right"
          onPlay={handlePlay}
          onToggleFavorite={() => toggleFavorite(track)}
          onAddToPlaylist={() => addTrackToPlaylist?.(track)}
          onRemoveFromPlaylist={() => toggleFavorite(track)}
          isFavorite={favorite}
          isInPlaylist={false}
          isPlaying={isThisPlaying}
          hasPreview={!!track.preview_url}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium truncate ${isCurrentTrack ? 'text-spotify-green' : 'text-[var(--foreground)]'}`}>
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
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          className={`p-2 rounded-full transition-colors ${
            isThisPlaying 
              ? 'text-spotify-green bg-spotify-green/20' 
              : 'text-[var(--foreground-secondary)] hover:text-spotify-green hover:bg-spotify-green/10'
          }`}
        >
          {isThisPlaying ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
        </button>
        <button
          onClick={() => toggleFavorite(track)}
          className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
        >
          <FiHeart className="h-4 w-4 text-red-500 fill-current" />
        </button>
      </div>
    </div>
  );
}

