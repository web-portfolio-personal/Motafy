import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRequestQueue } from '@/lib/requestQueue';

export function useSpotifyApi() {
  const { getValidToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queueRef = useRef(null);

  // Obtener o crear la cola de requests
  const getQueue = useCallback(() => {
    if (!queueRef.current) {
      queueRef.current = getRequestQueue({
        maxRequestsPerMinute: 150,
        minDelayBetweenRequests: 100,
        retryAttempts: 3,
        onRateLimited: (retryAfter) => {
          console.warn(`Rate limited. Retry after ${retryAfter}s`);
          setError(`Demasiadas peticiones. Reintentando en ${retryAfter}s...`);
        }
      });
    }
    return queueRef.current;
  }, []);

  // Fetch con cola de requests
  const fetchFromSpotify = useCallback(async (endpoint, options = {}, priority = 0) => {
    setLoading(true);
    setError(null);

    const queue = getQueue();

    try {
      const result = await queue.enqueue(async () => {
        const token = await getValidToken();
        if (!token) {
          throw new Error('No valid token available');
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

        // Manejar respuestas sin contenido
        if (response.status === 204) {
          return null;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
          error.status = response.status;
          throw error;
        }

        return response.json();
      }, priority);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getValidToken, getQueue]);

  // ============ Búsquedas ============

  const searchArtists = useCallback(async (query, limit = 10) => {
    if (!query.trim()) return { artists: { items: [] } };
    return await fetchFromSpotify(`/search?type=artist&q=${encodeURIComponent(query)}&limit=${limit}&market=ES`);
  }, [fetchFromSpotify]);

  const searchTracks = useCallback(async (query, limit = 10) => {
    if (!query.trim()) return { tracks: { items: [] } };
    return await fetchFromSpotify(`/search?type=track&q=${encodeURIComponent(query)}&limit=${limit}&market=ES`);
  }, [fetchFromSpotify]);

  const searchAlbums = useCallback(async (query, limit = 10) => {
    if (!query.trim()) return { albums: { items: [] } };
    return await fetchFromSpotify(`/search?type=album&q=${encodeURIComponent(query)}&limit=${limit}&market=ES`);
  }, [fetchFromSpotify]);

  const searchAll = useCallback(async (query, limit = 5) => {
    if (!query.trim()) return { artists: { items: [] }, tracks: { items: [] }, albums: { items: [] } };
    return await fetchFromSpotify(`/search?type=artist,track,album&q=${encodeURIComponent(query)}&limit=${limit}&market=ES`);
  }, [fetchFromSpotify]);

  // ============ Artistas ============

  const getArtist = useCallback(async (artistId) => {
    return await fetchFromSpotify(`/artists/${artistId}`);
  }, [fetchFromSpotify]);

  const getArtistTopTracks = useCallback(async (artistId) => {
    return await fetchFromSpotify(`/artists/${artistId}/top-tracks?market=ES`);
  }, [fetchFromSpotify]);

  const getArtistAlbums = useCallback(async (artistId, limit = 20) => {
    return await fetchFromSpotify(`/artists/${artistId}/albums?limit=${limit}&market=ES`);
  }, [fetchFromSpotify]);

  const getRelatedArtists = useCallback(async (artistId) => {
    return await fetchFromSpotify(`/artists/${artistId}/related-artists`);
  }, [fetchFromSpotify]);

  const getMultipleArtists = useCallback(async (artistIds) => {
    const ids = Array.isArray(artistIds) ? artistIds.join(',') : artistIds;
    return await fetchFromSpotify(`/artists?ids=${ids}`);
  }, [fetchFromSpotify]);

  // ============ Tracks ============

  const getTrack = useCallback(async (trackId) => {
    return await fetchFromSpotify(`/tracks/${trackId}?market=ES`);
  }, [fetchFromSpotify]);

  const getMultipleTracks = useCallback(async (trackIds) => {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
    return await fetchFromSpotify(`/tracks?ids=${ids}&market=ES`);
  }, [fetchFromSpotify]);

  const getAudioFeatures = useCallback(async (trackIds) => {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
    return await fetchFromSpotify(`/audio-features?ids=${ids}`);
  }, [fetchFromSpotify]);

  const getAudioAnalysis = useCallback(async (trackId) => {
    return await fetchFromSpotify(`/audio-analysis/${trackId}`);
  }, [fetchFromSpotify]);

  // ============ Usuario ============

  const getUserProfile = useCallback(async () => {
    return await fetchFromSpotify('/me');
  }, [fetchFromSpotify]);

  const getUserTopTracks = useCallback(async (timeRange = 'medium_term', limit = 20) => {
    return await fetchFromSpotify(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  }, [fetchFromSpotify]);

  const getUserTopArtists = useCallback(async (timeRange = 'medium_term', limit = 20) => {
    return await fetchFromSpotify(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
  }, [fetchFromSpotify]);

  const getRecentlyPlayed = useCallback(async (limit = 20) => {
    return await fetchFromSpotify(`/me/player/recently-played?limit=${limit}`);
  }, [fetchFromSpotify]);

  const getSavedTracks = useCallback(async (limit = 20, offset = 0) => {
    return await fetchFromSpotify(`/me/tracks?limit=${limit}&offset=${offset}`);
  }, [fetchFromSpotify]);

  const checkSavedTracks = useCallback(async (trackIds) => {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
    return await fetchFromSpotify(`/me/tracks/contains?ids=${ids}`);
  }, [fetchFromSpotify]);

  const saveTracks = useCallback(async (trackIds) => {
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds];
    return await fetchFromSpotify('/me/tracks', {
      method: 'PUT',
      body: JSON.stringify({ ids })
    });
  }, [fetchFromSpotify]);

  const removeSavedTracks = useCallback(async (trackIds) => {
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds];
    return await fetchFromSpotify('/me/tracks', {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    });
  }, [fetchFromSpotify]);

  // ============ Playlists ============

  const getUserPlaylists = useCallback(async (limit = 20, offset = 0) => {
    return await fetchFromSpotify(`/me/playlists?limit=${limit}&offset=${offset}`);
  }, [fetchFromSpotify]);

  const getPlaylist = useCallback(async (playlistId) => {
    return await fetchFromSpotify(`/playlists/${playlistId}`);
  }, [fetchFromSpotify]);

  const getPlaylistTracks = useCallback(async (playlistId, limit = 100, offset = 0) => {
    return await fetchFromSpotify(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
  }, [fetchFromSpotify]);

  const createPlaylist = useCallback(async (userId, name, description = '', isPublic = true) => {
    return await fetchFromSpotify(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: isPublic
      })
    });
  }, [fetchFromSpotify]);

  const addTracksToPlaylist = useCallback(async (playlistId, trackUris, position = null) => {
    const body = { uris: trackUris };
    if (position !== null) body.position = position;

    return await fetchFromSpotify(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }, [fetchFromSpotify]);

  const removeTracksFromPlaylist = useCallback(async (playlistId, trackUris) => {
    return await fetchFromSpotify(`/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      body: JSON.stringify({
        tracks: trackUris.map(uri => ({ uri }))
      })
    });
  }, [fetchFromSpotify]);

  const updatePlaylistDetails = useCallback(async (playlistId, data) => {
    return await fetchFromSpotify(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }, [fetchFromSpotify]);

  // ============ Albums ============

  const getAlbum = useCallback(async (albumId) => {
    return await fetchFromSpotify(`/albums/${albumId}?market=ES`);
  }, [fetchFromSpotify]);

  const getAlbumTracks = useCallback(async (albumId, limit = 50) => {
    return await fetchFromSpotify(`/albums/${albumId}/tracks?limit=${limit}&market=ES`);
  }, [fetchFromSpotify]);

  // ============ Seguimiento ============

  const getFollowedArtists = useCallback(async (limit = 20) => {
    return await fetchFromSpotify(`/me/following?type=artist&limit=${limit}`);
  }, [fetchFromSpotify]);

  const followArtists = useCallback(async (artistIds) => {
    const ids = Array.isArray(artistIds) ? artistIds : [artistIds];
    return await fetchFromSpotify(`/me/following?type=artist&ids=${ids.join(',')}`, {
      method: 'PUT'
    });
  }, [fetchFromSpotify]);

  const unfollowArtists = useCallback(async (artistIds) => {
    const ids = Array.isArray(artistIds) ? artistIds : [artistIds];
    return await fetchFromSpotify(`/me/following?type=artist&ids=${ids.join(',')}`, {
      method: 'DELETE'
    });
  }, [fetchFromSpotify]);

  const checkFollowingArtists = useCallback(async (artistIds) => {
    const ids = Array.isArray(artistIds) ? artistIds.join(',') : artistIds;
    return await fetchFromSpotify(`/me/following/contains?type=artist&ids=${ids}`);
  }, [fetchFromSpotify]);

  // ============ Utilidades ============

  const getQueueStats = useCallback(() => {
    return getQueue().getStats();
  }, [getQueue]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    clearError,

    // Core
    fetchFromSpotify,
    getQueueStats,

    // Búsquedas
    searchArtists,
    searchTracks,
    searchAlbums,
    searchAll,

    // Artistas
    getArtist,
    getArtistTopTracks,
    getArtistAlbums,
    getRelatedArtists,
    getMultipleArtists,

    // Tracks
    getTrack,
    getMultipleTracks,
    getAudioFeatures,
    getAudioAnalysis,

    // Usuario
    getUserProfile,
    getUserTopTracks,
    getUserTopArtists,
    getRecentlyPlayed,
    getSavedTracks,
    checkSavedTracks,
    saveTracks,
    removeSavedTracks,

    // Playlists
    getUserPlaylists,
    getPlaylist,
    getPlaylistTracks,
    createPlaylist,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    updatePlaylistDetails,

    // Albums
    getAlbum,
    getAlbumTracks,

    // Seguimiento
    getFollowedArtists,
    followArtists,
    unfollowArtists,
    checkFollowingArtists
  };
}

