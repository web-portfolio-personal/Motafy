'use client';

import { useState } from 'react';
import { FiClock, FiRefreshCw, FiChevronRight } from 'react-icons/fi';
import { usePlaylist } from '@/context/PlaylistContext';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import TrackCard from './TrackCard';

export default function HistoryPanel() {
  const { history, loadFromHistory, playlist } = usePlaylist();
  const [selectedHistory, setSelectedHistory] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `Hace ${diffMinutes} minutos`;
      }
      return `Hace ${diffHours} horas`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleLoad = (entry) => {
    loadFromHistory(entry);
    setSelectedHistory(null);
  };

  if (history.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FiClock className="h-5 w-5 text-white/50" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Historial</h3>
            <p className="text-xs text-white/50">Tus playlists anteriores</p>
          </div>
        </div>
        <p className="text-center text-white/40 py-8">
          Aún no has generado ninguna playlist
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FiClock className="h-5 w-5 text-white/50" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Historial</h3>
            <p className="text-xs text-white/50">{history.length} playlists guardadas</p>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelectedHistory(entry)}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left group"
            >
              {/* Preview images */}
              <div className="relative w-12 h-12 flex-shrink-0">
                {entry.tracks.slice(0, 4).map((track, idx) => (
                  <img
                    key={track.id}
                    src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                    alt=""
                    className="absolute w-6 h-6 rounded object-cover border border-black"
                    style={{
                      top: idx < 2 ? 0 : 'auto',
                      bottom: idx >= 2 ? 0 : 'auto',
                      left: idx % 2 === 0 ? 0 : 'auto',
                      right: idx % 2 === 1 ? 0 : 'auto',
                    }}
                  />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {entry.tracks.length} canciones
                </p>
                <p className="text-xs text-white/50">
                  {formatDate(entry.date)}
                </p>
              </div>

              <FiChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* History Detail Modal */}
      <Modal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        title={`Playlist del ${selectedHistory ? formatDate(selectedHistory.date) : ''}`}
        size="lg"
      >
        {selectedHistory && (
          <div className="space-y-4">
            {/* Info */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-white/60">
                  {selectedHistory.tracks.length} canciones
                </p>
                <p className="text-xs text-white/40">
                  Preferencias: {selectedHistory.preferences?.genres?.length || 0} géneros,
                  {selectedHistory.preferences?.artists?.length || 0} artistas
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLoad(selectedHistory)}
                icon={<FiRefreshCw className="h-4 w-4" />}
              >
                Restaurar
              </Button>
            </div>

            {/* Track list */}
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {selectedHistory.tracks.map((track, index) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={index}
                  compact
                  showDragHandle={false}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

