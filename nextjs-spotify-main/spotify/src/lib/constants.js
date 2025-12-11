// Constantes de la aplicación Motafy

// Géneros disponibles (hardcoded porque el endpoint está deprecated)
export const AVAILABLE_GENRES = [
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
export const POPULAR_GENRES = [
  'pop', 'rock', 'hip-hop', 'electronic', 'indie', 'jazz',
  'r-n-b', 'latin', 'reggaeton', 'classical', 'metal', 'folk'
];

// Décadas disponibles
export const DECADES = [
  { value: '1950', label: '1950s', emoji: '🎷' },
  { value: '1960', label: '1960s', emoji: '🎸' },
  { value: '1970', label: '1970s', emoji: '🕺' },
  { value: '1980', label: '1980s', emoji: '📼' },
  { value: '1990', label: '1990s', emoji: '💿' },
  { value: '2000', label: '2000s', emoji: '📱' },
  { value: '2010', label: '2010s', emoji: '🎧' },
  { value: '2020', label: '2020s', emoji: '🎤' },
];

// Presets de mood
export const MOOD_PRESETS = [
  {
    name: 'Feliz',
    emoji: '😊',
    values: { energy: 75, valence: 85, danceability: 70, acousticness: 30 }
  },
  {
    name: 'Triste',
    emoji: '😢',
    values: { energy: 30, valence: 20, danceability: 35, acousticness: 65 }
  },
  {
    name: 'Energético',
    emoji: '⚡',
    values: { energy: 95, valence: 70, danceability: 85, acousticness: 15 }
  },
  {
    name: 'Relajado',
    emoji: '😌',
    values: { energy: 25, valence: 50, danceability: 30, acousticness: 75 }
  },
  {
    name: 'Fiesta',
    emoji: '🎉',
    values: { energy: 90, valence: 80, danceability: 95, acousticness: 10 }
  },
  {
    name: 'Focus',
    emoji: '🎯',
    values: { energy: 40, valence: 45, danceability: 40, acousticness: 55 }
  },
  {
    name: 'Romántico',
    emoji: '💕',
    values: { energy: 35, valence: 60, danceability: 45, acousticness: 60 }
  },
  {
    name: 'Workout',
    emoji: '💪',
    values: { energy: 95, valence: 75, danceability: 80, acousticness: 5 }
  }
];

// Presets de popularidad
export const POPULARITY_PRESETS = [
  {
    name: 'Top Hits',
    description: 'Los más escuchados',
    values: { min: 70, max: 100 }
  },
  {
    name: 'Popular',
    description: 'Canciones conocidas',
    values: { min: 40, max: 70 }
  },
  {
    name: 'Underground',
    description: 'Joyas ocultas',
    values: { min: 0, max: 40 }
  },
  {
    name: 'Todo',
    description: 'Sin restricciones',
    values: { min: 0, max: 100 }
  }
];

// Scopes de Spotify necesarios (extendidos)
export const SPOTIFY_SCOPES = [
  // Perfil de usuario
  'user-read-private',
  'user-read-email',
  // Datos de escucha
  'user-top-read',
  'user-read-recently-played',
  'user-library-read',
  'user-library-modify',
  // Playlists
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  // Playback (Premium requerido)
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  // Seguimiento
  'user-follow-read',
  'user-follow-modify'
];

// Límites de la aplicación
export const LIMITS = {
  MAX_ARTISTS: 5,
  MAX_TRACKS: 5,
  MAX_GENRES: 5,
  MAX_PLAYLIST_SIZE: 100,
  SEARCH_LIMIT: 10,
  HISTORY_SIZE: 50,
  MAX_FAVORITES: 500,
  DEBOUNCE_MS: 300,
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 150, // Margen de seguridad (Spotify permite ~180)
  MIN_REQUEST_DELAY_MS: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  // Storage
  MAX_STORAGE_MB: 4,
  COMPRESSION_THRESHOLD: 1000 // bytes
};

// Mensajes de la aplicación
export const MESSAGES = {
  GENERATING: 'Generando tu playlist personalizada...',
  GENERATED: '¡Playlist generada con éxito!',
  SAVED: '¡Playlist guardada en Spotify!',
  ERROR_GENERATE: 'Error al generar la playlist. Inténtalo de nuevo.',
  ERROR_SAVE: 'Error al guardar la playlist.',
  NO_PREVIEW: 'Esta canción no tiene preview disponible',
  ADDED_FAVORITE: 'Añadido a favoritos',
  REMOVED_FAVORITE: 'Eliminado de favoritos',
  COPIED_LINK: '¡Enlace copiado al portapapeles!',
  EXPORTED: 'Playlist exportada correctamente'
};

// API URLs
export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// LocalStorage keys
export const STORAGE_KEYS = {
  TOKEN: 'spotify_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  TOKEN_EXPIRATION: 'spotify_token_expiration',
  AUTH_STATE: 'spotify_auth_state',
  FAVORITES: 'motafy_favorites',
  HISTORY: 'motafy_history',
  PREFERENCES: 'motafy_preferences',
  THEME: 'motafy_theme'
};

