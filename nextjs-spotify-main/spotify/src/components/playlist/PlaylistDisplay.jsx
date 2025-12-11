'use client';

import { useState, useCallback } from 'react';
import {
  FiMusic, FiClock, FiHeart, FiList, FiRefreshCw,
  FiPlus, FiSave, FiDownload, FiShare2, FiTrash2
} from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { usePlaylist } from '@/context/PlaylistContext';
import TrackCard from './TrackCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import SavePlaylistModal from './SavePlaylistModal';

export default function PlaylistDisplay() {
  const {
    playlist,
    isGenerating,
    removeTrack,
    refreshPlaylist,
    addMoreTracks,
    reorderPlaylist,
    clearPlaylist,
    exportPlaylist,
    favorites
  } = usePlaylist();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddingMore, setIsAddingMore] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = playlist.findIndex(t => t.id === active.id);
      const newIndex = playlist.findIndex(t => t.id === over.id);
      reorderPlaylist(oldIndex, newIndex);
    }
  }, [playlist, reorderPlaylist]);

  const handleAddMore = async () => {
    setIsAddingMore(true);
    try {
      await addMoreTracks(5);
    } catch (error) {
      console.error('Error adding more tracks:', error);
    } finally {
      setIsAddingMore(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mi Playlist de Motafy',
      text: `¡Mira mi playlist de ${playlist.length} canciones generada con Motafy!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copiar al clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const getTotalDuration = () => {
    const totalMs = playlist.reduce((acc, track) => acc + (track.duration_ms || 0), 0);
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);

    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  };

  const displayTracks = showFavorites ? favorites : playlist;

  return (
    <div className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-spotify-green/20 to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-spotify-green to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              {showFavorites ? (
                <FiHeart className="h-8 w-8 text-black fill-current" />
              ) : (
                <FiMusic className="h-8 w-8 text-black" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {showFavorites ? 'Tus Favoritos' : 'Tu Playlist'}
              </h2>
              <p className="text-white/60 text-sm">
                {displayTracks.length} canciones • {getTotalDuration()}
              </p>
            </div>
          </div>

          {/* Toggle Favorites */}
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`p-2 rounded-full transition-all ${
              showFavorites 
                ? 'bg-spotify-green text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={showFavorites ? 'Ver playlist' : 'Ver favoritos'}
          >
            <FiHeart className={`h-5 w-5 ${showFavorites ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Action Buttons */}
        {!showFavorites && playlist.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={refreshPlaylist}
              loading={isGenerating}
              icon={<FiRefreshCw className="h-4 w-4" />}
            >
              Refrescar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddMore}
              loading={isAddingMore}
              icon={<FiPlus className="h-4 w-4" />}
            >
              Añadir más
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsSaveModalOpen(true)}
              icon={<FiSave className="h-4 w-4" />}
            >
              Guardar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={exportPlaylist}
              icon={<FiDownload className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              icon={<FiShare2 className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Compartir</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearPlaylist}
              icon={<FiTrash2 className="h-4 w-4 text-red-400" />}
            >
              <span className="hidden sm:inline text-red-400">Limpiar</span>
            </Button>
          </div>
        )}
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <p className="text-white/60 mt-4">Generando tu playlist...</p>
          </div>
        ) : displayTracks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayTracks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {displayTracks.map((track, index) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    index={index}
                    onRemove={removeTrack}
                    showDragHandle={!showFavorites}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              {showFavorites ? (
                <FiHeart className="h-10 w-10 text-white/20" />
              ) : (
                <FiList className="h-10 w-10 text-white/20" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {showFavorites
                ? 'No tienes favoritos aún'
                : 'Tu playlist está vacía'
              }
            </h3>
            <p className="text-white/50 text-sm max-w-xs">
              {showFavorites
                ? 'Marca canciones como favoritas haciendo clic en el corazón'
                : 'Configura los widgets y genera tu playlist personalizada'
              }
            </p>
          </div>
        )}
      </div>

      {/* Save Playlist Modal */}
      <SavePlaylistModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </div>
  );
}

