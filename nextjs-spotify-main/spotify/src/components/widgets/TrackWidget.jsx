'use client';

import { useState, useEffect } from 'react';
import { FiMusic, FiX, FiSearch, FiPlay, FiPause } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { useSpotifyApi } from '@/hooks/useSpotifyApi';
import SearchInput from '@/components/ui/SearchInput';
import Chip from '@/components/ui/Chip';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TrackWidget({ selectedTracks = [], onSelect, maxItems = 5 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewTrack, setPreviewTrack] = useState(null);
  const [audio, setAudio] = useState(null);
  const debouncedQuery = useDebounce(query, 300);
  const { searchTracks } = useSpotifyApi();

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const data = await searchTracks(debouncedQuery, 8);
        const filtered = (data.tracks?.items || []).filter(
          track => !selectedTracks.some(s => s.id === track.id)
        );
        setResults(filtered);
      } catch (error) {
        console.error('Error searching tracks:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    search();
  }, [debouncedQuery, searchTracks, selectedTracks]);

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const handleSelect = (track) => {
    if (selectedTracks.length >= maxItems) return;
    onSelect?.([...selectedTracks, track]);
    setQuery('');
    setResults([]);
  };

  const handleRemove = (trackId) => {
    onSelect?.(selectedTracks.filter(t => t.id !== trackId));
  };

  const togglePreview = (track) => {
    if (!track.preview_url) return;

    if (previewTrack?.id === track.id) {
      // Pausar
      audio?.pause();
      setPreviewTrack(null);
    } else {
      // Reproducir
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(track.preview_url);
      newAudio.play();
      newAudio.onended = () => setPreviewTrack(null);
      setAudio(newAudio);
      setPreviewTrack(track);
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl p-5 border border-blue-500/20 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <FiMusic className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Canciones</h3>
          <p className="text-xs text-white/50">Selecciona hasta {maxItems} canciones</p>
        </div>
      </div>

      {/* Canciones seleccionadas */}
      {selectedTracks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTracks.map(track => (
            <Chip
              key={track.id}
              selected
              removable
              onRemove={() => handleRemove(track.id)}
              icon={
                track.album?.images?.[0]?.url && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-4 h-4 rounded object-cover"
                  />
                )
              }
            >
              {track.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Buscador */}
      {selectedTracks.length < maxItems && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar canciones..."
          loading={isSearching}
          className="mb-3"
        />
      )}

      {/* Resultados de búsqueda */}
      {results.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {results.map(track => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group"
            >
              {/* Preview button */}
              <button
                onClick={() => togglePreview(track)}
                disabled={!track.preview_url}
                className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 transition-all
                  ${track.preview_url 
                    ? 'bg-white/10 hover:bg-spotify-green hover:text-black' 
                    : 'bg-white/5 cursor-not-allowed'
                  }`}
              >
                {track.album?.images?.[0]?.url && !previewTrack?.id === track.id ? (
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : previewTrack?.id === track.id ? (
                  <FiPause className="h-4 w-4" />
                ) : (
                  <FiPlay className="h-4 w-4 text-white/50" />
                )}
              </button>

              {/* Info */}
              <button
                onClick={() => handleSelect(track)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-medium text-white truncate">{track.name}</p>
                <p className="text-xs text-white/50 truncate">
                  {track.artists?.map(a => a.name).join(', ')}
                </p>
              </button>

              {/* Duration */}
              <span className="text-xs text-white/40">
                {formatDuration(track.duration_ms)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {selectedTracks.length === 0 && !query && (
        <div className="text-center py-6">
          <FiSearch className="h-8 w-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">Busca tus canciones favoritas</p>
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
}

