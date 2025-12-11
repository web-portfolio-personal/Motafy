'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiSearch } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { useSpotifyApi } from '@/hooks/useSpotifyApi';
import SearchInput from '@/components/ui/SearchInput';
import Chip from '@/components/ui/Chip';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ArtistWidget({ selectedArtists = [], onSelect, maxItems = 5 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { searchArtists } = useSpotifyApi();

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const data = await searchArtists(debouncedQuery, 8);
        const filtered = (data.artists?.items || []).filter(
          artist => !selectedArtists.some(s => s.id === artist.id)
        );
        setResults(filtered);
      } catch (error) {
        console.error('Error searching artists:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    search();
  }, [debouncedQuery, searchArtists, selectedArtists]);

  const handleSelect = (artist) => {
    if (selectedArtists.length >= maxItems) return;
    onSelect?.([...selectedArtists, artist]);
    setQuery('');
    setResults([]);
  };

  const handleRemove = (artistId) => {
    onSelect?.(selectedArtists.filter(a => a.id !== artistId));
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-2xl p-5 border border-purple-500/20 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <FiUser className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Artistas</h3>
          <p className="text-xs text-white/50">Selecciona hasta {maxItems} artistas</p>
        </div>
      </div>

      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedArtists.map(artist => (
            <Chip
              key={artist.id}
              selected
              removable
              onRemove={() => handleRemove(artist.id)}
              icon={
                artist.images?.[0]?.url && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )
              }
            >
              {artist.name}
            </Chip>
          ))}
        </div>
      )}

      {selectedArtists.length < maxItems && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar artistas..."
          loading={isSearching}
          className="mb-3"
        />
      )}

      {results.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {results.map(artist => (
            <button
              key={artist.id}
              onClick={() => handleSelect(artist)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
            >
              {artist.images?.[0]?.url ? (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-white/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{artist.name}</p>
                <p className="text-xs text-white/50">
                  {artist.followers?.total?.toLocaleString()} seguidores
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedArtists.length === 0 && !query && (
        <div className="text-center py-6">
          <FiSearch className="h-8 w-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">Busca tus artistas favoritos</p>
        </div>
      )}

      {isSearching && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
}

