import { getAccessToken } from './auth';

/**
 * Realizar petición a la API de Spotify con manejo de errores
 */
export async function spotifyFetch(endpoint, options = {}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error('No access token available');
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `https://api.spotify.com/v1${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Buscar artistas
 */
export async function searchArtists(query, limit = 10) {
  return spotifyFetch(`/search?type=artist&q=${encodeURIComponent(query)}&limit=${limit}&market=ES`);
}

/**
 * Buscar tracks
 */
export async function searchTracks(query, limit = 10) {
  return spotifyFetch(`/search?type=track&q=${encodeURIComponent(query)}&limit=${limit}&market=ES`);
}

/**
 * Obtener top tracks de un artista
 */
export async function getArtistTopTracks(artistId) {
  return spotifyFetch(`/artists/${artistId}/top-tracks?market=ES`);
}

/**
 * Obtener perfil del usuario
 */
export async function getUserProfile() {
  return spotifyFetch('/me');
}

/**
 * Obtener audio features de tracks
 */
export async function getAudioFeatures(trackIds) {
  const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
  return spotifyFetch(`/audio-features?ids=${ids}`);
}

/**
 * Crear playlist en Spotify
 */
export async function createPlaylist(userId, name, description = '', isPublic = true) {
  return spotifyFetch(`/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      public: isPublic
    })
  });
}

/**
 * Añadir tracks a una playlist
 */
export async function addTracksToPlaylist(playlistId, trackUris) {
  return spotifyFetch(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({
      uris: trackUris
    })
  });
}

/**
 * Generar playlist basada en preferencias
 */
export async function generatePlaylist(preferences) {
  const { artists, genres, decades, popularity } = preferences;
  const token = getAccessToken();
  let allTracks = [];

  // 1. Obtener top tracks de artistas seleccionados
  for (const artist of artists) {
    const tracks = await fetch(
      `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=ES`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await tracks.json();
    allTracks.push(...(data.tracks || []));
  }

  // 2. Buscar por géneros
  for (const genre of genres) {
    const results = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=genre:${genre}&limit=20&market=ES`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await results.json();
    allTracks.push(...(data.tracks?.items || []));
  }

  // 3. Filtrar por década
  if (decades.length > 0) {
    allTracks = allTracks.filter(track => {
      if (!track?.album?.release_date) return false;
      const year = new Date(track.album.release_date).getFullYear();
      return decades.some(decade => {
        const decadeStart = parseInt(decade);
        return year >= decadeStart && year < decadeStart + 10;
      });
    });
  }

  // 4. Filtrar por popularidad
  if (popularity) {
    const [min, max] = popularity;
    allTracks = allTracks.filter(
      track => track && track.popularity >= min && track.popularity <= max
    );
  }

  // 5. Eliminar duplicados y limitar a 30 canciones
  const uniqueTracks = Array.from(
    new Map(allTracks.filter(t => t && t.id).map(track => [track.id, track])).values()
  ).slice(0, 30);

  return uniqueTracks;
}