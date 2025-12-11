'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PlaylistContext = createContext(null);

// Helper para obtener token desde localStorage
const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('spotify_token');
  const expiration = localStorage.getItem('spotify_token_expiration');

  if (!token || !expiration) return null;
  if (Date.now() > parseInt(expiration)) return null;

  return token;
};

export function PlaylistProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [preferences, setPreferences] = useState({
    artists: [],
    tracks: [],
    genres: [],
    decades: [],
    mood: { energy: 50, valence: 50, danceability: 50, acousticness: 50 },
    popularity: { min: 0, max: 100 }
  });

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedFavorites = localStorage.getItem('motafy_favorites');
      const savedHistory = localStorage.getItem('motafy_history');
      const savedPreferences = localStorage.getItem('motafy_preferences');

      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }, []);

  // Guardar preferencias
  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('motafy_preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Generar playlist
  const generatePlaylist = useCallback(async () => {
    setIsGenerating(true);
    try {
      const token = getStoredToken();
      if (!token) throw new Error('No token available');

      let allTracks = [];

      // 1. Obtener tracks de artistas seleccionados
      for (const artist of preferences.artists.slice(0, 5)) {
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=ES`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            allTracks.push(...(data.tracks || []));
          }
        } catch (e) {
          console.error('Error fetching artist tracks:', e);
        }
      }

      // 2. Añadir tracks seleccionados directamente
      if (preferences.tracks.length > 0) {
        allTracks.push(...preferences.tracks);
      }

      // 3. Buscar por géneros y décadas
      for (const genre of preferences.genres.slice(0, 3)) {
        for (const decade of preferences.decades.length > 0 ? preferences.decades : ['2020']) {
          const yearStart = decade;
          const yearEnd = parseInt(decade) + 9;
          const query = `genre:${genre} year:${yearStart}-${yearEnd}`;

          try {
            const response = await fetch(
              `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=15&market=ES`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.ok) {
              const data = await response.json();
              allTracks.push(...(data.tracks?.items || []));
            }
          } catch (e) {
            console.error('Error searching tracks:', e);
          }
        }
      }

      // Si no hay filtros específicos, buscar tracks populares
      if (allTracks.length === 0) {
        try {
          const response = await fetch(
            'https://api.spotify.com/v1/search?type=track&q=year:2024&limit=50&market=ES',
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            allTracks.push(...(data.tracks?.items || []));
          }
        } catch (e) {
          console.error('Error fetching popular tracks:', e);
        }
      }

      // 4. Filtrar por popularidad
      const { min, max } = preferences.popularity;
      allTracks = allTracks.filter(track =>
        track && track.popularity >= min && track.popularity <= max
      );

      // 5. Obtener audio features para filtrar por mood (si hay suficientes tracks)
      if (allTracks.length > 0) {
        const trackIds = allTracks.slice(0, 50).map(t => t.id).join(',');
        try {
          const featuresResponse = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (featuresResponse.ok) {
            const featuresData = await featuresResponse.json();
            const features = featuresData.audio_features || [];

            // Mapear features a tracks
            const tracksWithFeatures = allTracks.slice(0, 50).map((track, idx) => ({
              ...track,
              audioFeatures: features[idx]
            }));

            // Filtrar por mood con tolerancia del 30%
            const tolerance = 0.3;
            allTracks = tracksWithFeatures.filter(track => {
              if (!track.audioFeatures) return true;
              const af = track.audioFeatures;
              const targetEnergy = preferences.mood.energy / 100;
              const targetValence = preferences.mood.valence / 100;
              const targetDanceability = preferences.mood.danceability / 100;
              const targetAcousticness = preferences.mood.acousticness / 100;

              return (
                Math.abs(af.energy - targetEnergy) <= tolerance &&
                Math.abs(af.valence - targetValence) <= tolerance &&
                Math.abs(af.danceability - targetDanceability) <= tolerance &&
                Math.abs(af.acousticness - targetAcousticness) <= tolerance
              );
            });
          }
        } catch (e) {
          console.error('Error fetching audio features:', e);
        }
      }

      // 6. Eliminar duplicados y mezclar
      const uniqueTracks = Array.from(
        new Map(allTracks.filter(t => t && t.id).map(track => [track.id, track])).values()
      );

      // Shuffle usando Fisher-Yates
      for (let i = uniqueTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueTracks[i], uniqueTracks[j]] = [uniqueTracks[j], uniqueTracks[i]];
      }

      const finalPlaylist = uniqueTracks.slice(0, 30);
      setPlaylist(finalPlaylist);

      // Guardar en historial
      if (finalPlaylist.length > 0) {
        const historyEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          tracks: finalPlaylist,
          preferences: { ...preferences }
        };
        setHistory(prev => {
          const newHistory = [historyEntry, ...prev].slice(0, 10);
          localStorage.setItem('motafy_history', JSON.stringify(newHistory));
          return newHistory;
        });
      }

      return finalPlaylist;
    } catch (error) {
      console.error('Error generating playlist:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [preferences]);

  // Añadir más canciones
  const addMoreTracks = useCallback(async (count = 5) => {
    setIsGenerating(true);
    try {
      const token = getStoredToken();
      if (!token) throw new Error('No token available');

      const existingIds = new Set(playlist.map(t => t.id));
      let newTracks = [];

      // Buscar más tracks basados en los artistas de la playlist actual
      const artists = [...new Set(playlist.flatMap(t => t.artists?.map(a => a.id) || []))];

      for (const artistId of artists.slice(0, 3)) {
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            const filteredTracks = (data.tracks || []).filter(t => !existingIds.has(t.id));
            newTracks.push(...filteredTracks);
          }
        } catch (e) {
          console.error('Error fetching more tracks:', e);
        }
      }

      // Shuffle y añadir
      for (let i = newTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newTracks[i], newTracks[j]] = [newTracks[j], newTracks[i]];
      }

      const tracksToAdd = newTracks.slice(0, count);
      setPlaylist(prev => [...prev, ...tracksToAdd]);

      return tracksToAdd;
    } catch (error) {
      console.error('Error adding more tracks:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [playlist]);

  // Eliminar track
  const removeTrack = useCallback((trackId) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
  }, []);

  // Refrescar playlist
  const refreshPlaylist = useCallback(async () => {
    return await generatePlaylist();
  }, [generatePlaylist]);

  // Toggle favorito
  const toggleFavorite = useCallback((track) => {
    setFavorites(prev => {
      const isFavorite = prev.some(f => f.id === track.id);
      let newFavorites;

      if (isFavorite) {
        newFavorites = prev.filter(f => f.id !== track.id);
      } else {
        newFavorites = [...prev, track];
      }

      localStorage.setItem('motafy_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Verificar si es favorito
  const isFavorite = useCallback((trackId) => {
    return favorites.some(f => f.id === trackId);
  }, [favorites]);

  // Reordenar playlist
  const reorderPlaylist = useCallback((oldIndex, newIndex) => {
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      const [removed] = newPlaylist.splice(oldIndex, 1);
      newPlaylist.splice(newIndex, 0, removed);
      return newPlaylist;
    });
  }, []);

  // Cargar playlist del historial
  const loadFromHistory = useCallback((historyEntry) => {
    setPlaylist(historyEntry.tracks);
    setPreferences(historyEntry.preferences);
  }, []);

  // Limpiar playlist
  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
  }, []);

  // Exportar playlist como JSON
  const exportPlaylist = useCallback(() => {
    const data = {
      name: 'Motafy Playlist',
      exportedAt: new Date().toISOString(),
      tracks: playlist.map(t => ({
        id: t.id,
        name: t.name,
        artists: t.artists?.map(a => a.name) || [],
        album: t.album?.name,
        duration: t.duration_ms,
        popularity: t.popularity,
        previewUrl: t.preview_url,
        externalUrl: t.external_urls?.spotify
      })),
      preferences
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motafy-playlist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [playlist, preferences]);

  // === SISTEMA DE TRACKING DE ACTIVIDAD ===
  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({
    playlistsGenerated: 0,
    songsGenerated: 0,
    likesGiven: 0,
    wrappedViews: 0,
    totalInteractions: 0
  });

  // Cargar actividad y stats de localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedActivity = localStorage.getItem('motafy_activity');
      const savedStats = localStorage.getItem('motafy_stats');
      if (savedActivity) setActivityLog(JSON.parse(savedActivity));
      if (savedStats) setStats(JSON.parse(savedStats));
    } catch (e) {
      console.error('Error loading activity:', e);
    }
  }, []);

  // Registrar actividad
  const trackActivity = useCallback((type, data = {}) => {
    const activity = {
      id: Date.now(),
      type,
      timestamp: new Date().toISOString(),
      ...data
    };

    setActivityLog(prev => {
      const newLog = [activity, ...prev].slice(0, 100); // Mantener últimas 100
      localStorage.setItem('motafy_activity', JSON.stringify(newLog));
      return newLog;
    });

    // Actualizar stats
    setStats(prev => {
      const newStats = { ...prev };
      switch (type) {
        case 'playlist_generated':
          newStats.playlistsGenerated += 1;
          newStats.songsGenerated += (data.trackCount || 0);
          break;
        case 'song_generated':
          newStats.songsGenerated += 1;
          break;
        case 'like_given':
          newStats.likesGiven += 1;
          break;
        case 'like_removed':
          newStats.likesGiven = Math.max(0, newStats.likesGiven - 1);
          break;
        case 'wrapped_viewed':
          newStats.wrappedViews += 1;
          break;
      }
      newStats.totalInteractions += 1;
      localStorage.setItem('motafy_stats', JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  // Obtener actividad por día (últimos 7 días)
  const getActivityByDay = useCallback(() => {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayActivity = activityLog.filter(a => {
        const actDate = new Date(a.timestamp).toISOString().split('T')[0];
        return actDate === dateStr;
      });

      last7Days.push({
        day: date.toLocaleDateString('es', { weekday: 'short' }),
        date: dateStr,
        count: dayActivity.length,
        details: dayActivity
      });
    }

    return last7Days;
  }, [activityLog]);

  // Generar canción individual
  const generateSingleTrack = useCallback(async () => {
    const token = getStoredToken();
    if (!token) throw new Error('No token available');

    try {
      // Buscar una canción aleatoria basada en preferencias
      let query = '';
      if (preferences.genres.length > 0) {
        query = `genre:${preferences.genres[Math.floor(Math.random() * preferences.genres.length)]}`;
      } else if (preferences.artists.length > 0) {
        const artist = preferences.artists[Math.floor(Math.random() * preferences.artists.length)];
        query = `artist:${artist.name}`;
      } else {
        query = 'year:2024';
      }

      const response = await fetch(
        `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=50&market=ES`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Error searching tracks');

      const data = await response.json();
      const tracks = data.tracks?.items || [];

      if (tracks.length === 0) return null;

      // Filtrar por popularidad
      const { min, max } = preferences.popularity;
      const filteredTracks = tracks.filter(t => t.popularity >= min && t.popularity <= max);
      const finalTracks = filteredTracks.length > 0 ? filteredTracks : tracks;

      // Seleccionar una aleatoria
      const randomTrack = finalTracks[Math.floor(Math.random() * finalTracks.length)];

      // Registrar actividad
      trackActivity('song_generated', { trackName: randomTrack.name, artistName: randomTrack.artists?.[0]?.name });

      return randomTrack;
    } catch (error) {
      console.error('Error generating single track:', error);
      throw error;
    }
  }, [preferences, trackActivity]);

  // Modificar toggleFavorite para trackear
  const toggleFavoriteWithTracking = useCallback((track) => {
    const isFav = favorites.some(f => f.id === track.id);

    setFavorites(prev => {
      let newFavorites;
      if (isFav) {
        newFavorites = prev.filter(f => f.id !== track.id);
        trackActivity('like_removed', { trackName: track.name });
      } else {
        newFavorites = [...prev, { ...track, favoritedAt: new Date().toISOString() }];
        trackActivity('like_given', { trackName: track.name, artistName: track.artists?.[0]?.name });
      }
      localStorage.setItem('motafy_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, [favorites, trackActivity]);

  // Registrar vista de wrapped
  const trackWrappedView = useCallback(() => {
    trackActivity('wrapped_viewed');
  }, [trackActivity]);

  const value = {
    playlist,
    isGenerating,
    history,
    favorites,
    preferences,
    updatePreferences,
    generatePlaylist,
    addMoreTracks,
    removeTrack,
    refreshPlaylist,
    toggleFavorite: toggleFavoriteWithTracking,
    isFavorite,
    reorderPlaylist,
    loadFromHistory,
    clearPlaylist,
    exportPlaylist,
    // Nuevas funciones
    activityLog,
    stats,
    trackActivity,
    getActivityByDay,
    generateSingleTrack,
    trackWrappedView,
    playlistHistory: history
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}
