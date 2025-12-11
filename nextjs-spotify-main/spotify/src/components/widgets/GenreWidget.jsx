'use client';

import { useState, useMemo } from 'react';
import { FiDisc, FiSearch } from 'react-icons/fi';
import SearchInput from '@/components/ui/SearchInput';
import Chip from '@/components/ui/Chip';

// Géneros disponibles en Spotify (hardcoded porque el endpoint está deprecated)
const AVAILABLE_GENRES = [
  'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient',
  'anime', 'black-metal', 'bluegrass', 'blues', 'bossanova',
  'brazil', 'breakbeat', 'british', 'cantopop', 'chicago-house',
  'children', 'chill', 'classical', 'club', 'comedy',
  'country', 'dance', 'dancehall', 'death-metal', 'deep-house',
  'detroit-techno', 'disco', 'disney', 'drum-and-bass', 'dub',
  'dubstep', 'edm', 'electro', 'electronic', 'emo',
  'folk', 'forro', 'french', 'funk', 'garage',
  'german', 'gospel', 'goth', 'grindcore', 'groove',
  'grunge', 'guitar', 'happy', 'hard-rock', 'hardcore',
  'hardstyle', 'heavy-metal', 'hip-hop', 'house', 'idm',
  'indian', 'indie', 'indie-pop', 'industrial', 'iranian',
  'j-dance', 'j-idol', 'j-pop', 'j-rock', 'jazz',
  'k-pop', 'kids', 'latin', 'latino', 'malay',
  'mandopop', 'metal', 'metal-misc', 'metalcore', 'minimal-techno',
  'movies', 'mpb', 'new-age', 'new-release', 'opera',
  'pagode', 'party', 'philippines-opm', 'piano', 'pop',
  'pop-film', 'post-dubstep', 'power-pop', 'progressive-house', 'psych-rock',
  'punk', 'punk-rock', 'r-n-b', 'rainy-day', 'reggae',
  'reggaeton', 'road-trip', 'rock', 'rock-n-roll', 'rockabilly',
  'romance', 'sad', 'salsa', 'samba', 'sertanejo',
  'show-tunes', 'singer-songwriter', 'ska', 'sleep', 'songwriter',
  'soul', 'soundtracks', 'spanish', 'study', 'summer',
  'swedish', 'synth-pop', 'tango', 'techno', 'trance',
  'trip-hop', 'turkish', 'work-out', 'world-music'
];

// Géneros populares para mostrar por defecto
const POPULAR_GENRES = [
  'pop', 'rock', 'hip-hop', 'electronic', 'indie', 'jazz',
  'r-n-b', 'latin', 'reggaeton', 'classical', 'metal', 'folk'
];

export default function GenreWidget({ selectedGenres = [], onSelect, maxItems = 5 }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGenres = useMemo(() => {
    if (!searchQuery.trim()) {
      return POPULAR_GENRES.filter(g => !selectedGenres.includes(g));
    }
    return AVAILABLE_GENRES.filter(
      genre =>
        genre.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedGenres.includes(genre)
    );
  }, [searchQuery, selectedGenres]);

  const handleSelect = (genre) => {
    if (selectedGenres.length >= maxItems) return;
    onSelect?.([...selectedGenres, genre]);
    setSearchQuery('');
  };

  const handleRemove = (genre) => {
    onSelect?.(selectedGenres.filter(g => g !== genre));
  };

  const formatGenreName = (genre) => {
    return genre
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-2xl p-5 border border-green-500/20 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
          <FiDisc className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Géneros</h3>
          <p className="text-xs text-white/50">Selecciona hasta {maxItems} géneros</p>
        </div>
      </div>

      {/* Géneros seleccionados */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedGenres.map(genre => (
            <Chip
              key={genre}
              selected
              removable
              onRemove={() => handleRemove(genre)}
            >
              {formatGenreName(genre)}
            </Chip>
          ))}
        </div>
      )}

      {/* Buscador */}
      {selectedGenres.length < maxItems && (
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar géneros..."
          className="mb-3"
        />
      )}

      {/* Lista de géneros */}
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
        {filteredGenres.slice(0, 20).map(genre => (
          <Chip
            key={genre}
            onClick={() => handleSelect(genre)}
            className={selectedGenres.length >= maxItems ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          >
            {formatGenreName(genre)}
          </Chip>
        ))}
      </div>

      {/* Contador */}
      {searchQuery && (
        <p className="text-xs text-white/40 mt-3">
          {filteredGenres.length} géneros encontrados
        </p>
      )}

      {/* Estado vacío */}
      {filteredGenres.length === 0 && searchQuery && (
        <div className="text-center py-4">
          <p className="text-sm text-white/40">No se encontraron géneros</p>
        </div>
      )}
    </div>
  );
}

