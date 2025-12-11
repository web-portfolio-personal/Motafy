'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FiHeart, FiX, FiPlay, FiPause, FiMoreHorizontal,
  FiExternalLink, FiInfo
} from 'react-icons/fi';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePlaylist } from '@/context/PlaylistContext';
import { useAudio } from '@/context/AudioContext';
import TrackInfoPopup from '@/components/ui/TrackInfoPopup';

export default function TrackCard({
  track,
  index,
  onRemove,
  showDragHandle = true,
  compact = false
}) {
  const { toggleFavorite, isFavorite, addTrackToPlaylist, playlist } = usePlaylist();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const menuRef = useRef(null);
  const favorite = isFavorite(track.id);

  // Verificar si esta es la canción que está sonando
  const isCurrentTrack = currentTrack?.id === track.id;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Importar toast para mensajes
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleMouseEnterImage = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    showTimeoutRef.current = setTimeout(() => {
      setShowInfo(true);
    }, 400);
  };

  const handleMouseLeaveImage = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowInfo(false);
    }, 300);
  };

  const handlePopupMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowInfo(false);
    }, 100);
  };

  const handlePlay = () => {
    playTrack(track);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const openInSpotify = () => {
    if (track.external_urls?.spotify) {
      window.open(track.external_urls.spotify, '_blank');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group relative">
        <span className="text-sm text-white/40 w-5">{index + 1}</span>
        <div
          className="relative"
          onMouseEnter={handleMouseEnterImage}
          onMouseLeave={handleMouseLeaveImage}
        >
          <img
            src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
            alt={track.name}
            className={`w-10 h-10 rounded object-cover cursor-pointer ${isCurrentTrack ? 'ring-2 ring-spotify-green' : ''}`}
          />
          {/* Icono de info */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <FiInfo className="h-4 w-4 text-white" />
          </div>

          {/* Popup de información */}
          <TrackInfoPopup
            track={track}
            isVisible={showInfo}
            position="right"
            onPlay={handlePlay}
            onToggleFavorite={() => toggleFavorite(track)}
            onAddToPlaylist={() => addTrackToPlaylist?.(track)}
            onRemoveFromPlaylist={() => onRemove?.(track.id)}
            isFavorite={favorite}
            isInPlaylist={true}
            isPlaying={isThisPlaying}
            hasPreview={!!track.preview_url}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${isCurrentTrack ? 'text-spotify-green' : 'text-white'}`}>{track.name}</p>
          <p className="text-xs text-white/50 truncate">
            {track.artists?.map(a => a.name).join(', ')}
          </p>
        </div>
        <button
          onClick={handlePlay}
          className={`p-1.5 rounded-full transition-colors ${
            isThisPlaying ? 'text-spotify-green' : 'text-white/30 hover:text-white/60'
          }`}
        >
          {isThisPlaying ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
        </button>
        <button
          onClick={() => toggleFavorite(track)}
          className={`p-1.5 rounded-full transition-colors ${
            favorite ? 'text-spotify-green' : 'text-white/30 hover:text-white/60'
          }`}
        >
          <FiHeart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group ${
        isDragging ? 'shadow-xl ring-2 ring-spotify-green' : ''
      }`}
    >
      {showDragHandle && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-white/30 hover:text-white/60 transition-colors"
        >
          <RxDragHandleDots2 className="h-5 w-5" />
        </button>
      )}

      <span className="text-sm text-white/40 w-6 text-center">
        {index + 1}
      </span>

      {/* Imagen con popup */}
      <div
        className="relative flex-shrink-0"
        onMouseEnter={handleMouseEnterImage}
        onMouseLeave={handleMouseLeaveImage}
      >
        <img
          src={track.album?.images?.[1]?.url || track.album?.images?.[0]?.url}
          alt={track.name}
          className={`w-12 h-12 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105 ${isCurrentTrack ? 'ring-2 ring-spotify-green' : ''}`}
        />
        {/* Overlay con icono de info */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <FiInfo className="h-5 w-5 text-white" />
        </div>

        {/* Indicador de preview disponible */}
        {track.preview_url && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-spotify-green rounded-full flex items-center justify-center shadow-lg">
            <FiPlay className="h-2.5 w-2.5 text-black ml-0.5" />
          </div>
        )}

        {/* Popup de información */}
        <TrackInfoPopup
          track={track}
          isVisible={showInfo}
          position="right"
          onPlay={handlePlay}
          onToggleFavorite={() => toggleFavorite(track)}
          onAddToPlaylist={() => addTrackToPlaylist?.(track)}
          onRemoveFromPlaylist={() => onRemove?.(track.id)}
          isFavorite={favorite}
          isInPlaylist={true}
          isPlaying={isThisPlaying}
          hasPreview={!!track.preview_url}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCurrentTrack ? 'text-spotify-green' : 'text-white'}`}>
          {track.name}
        </p>
        <p className="text-sm text-white/50 truncate">
          {track.artists?.map(a => a.name).join(', ')}
        </p>
      </div>

      <p className="hidden md:block text-sm text-white/40 truncate max-w-[150px]">
        {track.album?.name}
      </p>

      <span className="text-sm text-white/40 w-12 text-right">
        {formatDuration(track.duration_ms)}
      </span>

      {/* Barra de popularidad */}
      <div className="hidden lg:flex items-center gap-1 w-16">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-spotify-green rounded-full"
            style={{ width: `${track.popularity}%` }}
          />
        </div>
        <span className="text-xs text-white/40">{track.popularity}</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1">
        {/* Botón de play */}
        <button
          onClick={handlePlay}
          className={`p-2 rounded-full transition-all ${
            isThisPlaying 
              ? 'text-spotify-green bg-spotify-green/20' 
              : 'text-white/50 hover:text-spotify-green hover:bg-spotify-green/10'
          }`}
          title={track.preview_url ? (isThisPlaying ? 'Pausar' : 'Reproducir preview') : 'Sin preview disponible'}
        >
          {isThisPlaying ? (
            <FiPause className="h-5 w-5" />
          ) : (
            <FiPlay className="h-5 w-5" />
          )}
        </button>

        {/* Favorito */}
        <button
          onClick={() => toggleFavorite(track)}
          className={`p-2 rounded-full transition-all ${
            favorite 
              ? 'text-pink-500 hover:scale-110' 
              : 'text-white/30 hover:text-pink-400'
          }`}
          title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <FiHeart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Menú */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-white/30 hover:text-white/60 transition-all rounded-full hover:bg-white/10"
          >
            <FiMoreHorizontal className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded-lg shadow-xl border border-white/10 py-1 min-w-[160px] z-50 animate-scale-in">
              <button
                onClick={() => {
                  openInSpotify();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <FiExternalLink className="h-4 w-4" />
                Abrir en Spotify
              </button>
              <button
                onClick={() => {
                  onRemove?.(track.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
              >
                <FiX className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Eliminar */}
        <button
          onClick={() => onRemove?.(track.id)}
          className="p-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-400/10"
          title="Eliminar de la playlist"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

