/**
 * Hook para control de playback de Spotify
 * Permite controlar la reproducción en dispositivos del usuario (requiere Premium)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useSpotifyPlayer() {
  const { getValidToken, user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pollingRef = useRef(null);

  // Verificar si el usuario es premium
  useEffect(() => {
    if (user?.product === 'premium') {
      setIsPremium(true);
    }
  }, [user]);

  /**
   * Fetch helper con manejo de errores
   */
  const spotifyFetch = useCallback(async (endpoint, options = {}) => {
    const token = await getValidToken();
    if (!token) throw new Error('No valid token');

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 204) return null;

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [getValidToken]);

  /**
   * Obtener dispositivos disponibles
   */
  const getDevices = useCallback(async () => {
    try {
      const data = await spotifyFetch('/me/player/devices');
      setDevices(data?.devices || []);

      const active = data?.devices?.find(d => d.is_active);
      if (active) {
        setActiveDevice(active);
      }

      return data?.devices || [];
    } catch (err) {
      console.error('Error getting devices:', err);
      return [];
    }
  }, [spotifyFetch]);

  /**
   * Obtener estado actual de reproducción
   */
  const getPlaybackState = useCallback(async () => {
    try {
      const data = await spotifyFetch('/me/player');

      if (data) {
        setIsPlaying(data.is_playing);
        setCurrentTrack(data.item);
        setPosition(data.progress_ms);
        setDuration(data.item?.duration_ms || 0);
        setVolume(data.device?.volume_percent || 50);
        setActiveDevice(data.device);
      }

      return data;
    } catch (err) {
      // 204 significa que no hay reproducción activa
      if (err.message?.includes('204')) {
        setIsPlaying(false);
        setCurrentTrack(null);
      }
      return null;
    }
  }, [spotifyFetch]);

  /**
   * Iniciar/pausar reproducción
   */
  const togglePlayback = useCallback(async () => {
    if (!isPremium) {
      setError('Se requiere Spotify Premium para controlar la reproducción');
      return false;
    }

    setIsLoading(true);
    try {
      const endpoint = isPlaying ? '/me/player/pause' : '/me/player/play';
      await spotifyFetch(endpoint, { method: 'PUT' });
      setIsPlaying(!isPlaying);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isPremium, isPlaying, spotifyFetch]);

  /**
   * Reproducir track específico
   */
  const playTrack = useCallback(async (trackUri, deviceId = null) => {
    if (!isPremium) {
      setError('Se requiere Spotify Premium para controlar la reproducción');
      return false;
    }

    setIsLoading(true);
    try {
      const body = {
        uris: Array.isArray(trackUri) ? trackUri : [trackUri]
      };

      const params = deviceId ? `?device_id=${deviceId}` : '';

      await spotifyFetch(`/me/player/play${params}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      setIsPlaying(true);

      // Actualizar estado después de un momento
      setTimeout(getPlaybackState, 500);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isPremium, spotifyFetch, getPlaybackState]);

  /**
   * Reproducir playlist/album/artist
   */
  const playContext = useCallback(async (contextUri, offset = 0) => {
    if (!isPremium) {
      setError('Se requiere Spotify Premium');
      return false;
    }

    setIsLoading(true);
    try {
      await spotifyFetch('/me/player/play', {
        method: 'PUT',
        body: JSON.stringify({
          context_uri: contextUri,
          offset: { position: offset }
        })
      });

      setIsPlaying(true);
      setTimeout(getPlaybackState, 500);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isPremium, spotifyFetch, getPlaybackState]);

  /**
   * Siguiente track
   */
  const next = useCallback(async () => {
    if (!isPremium) return false;

    try {
      await spotifyFetch('/me/player/next', { method: 'POST' });
      setTimeout(getPlaybackState, 500);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch, getPlaybackState]);

  /**
   * Track anterior
   */
  const previous = useCallback(async () => {
    if (!isPremium) return false;

    try {
      await spotifyFetch('/me/player/previous', { method: 'POST' });
      setTimeout(getPlaybackState, 500);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch, getPlaybackState]);

  /**
   * Seek a posición
   */
  const seek = useCallback(async (positionMs) => {
    if (!isPremium) return false;

    try {
      await spotifyFetch(`/me/player/seek?position_ms=${positionMs}`, { method: 'PUT' });
      setPosition(positionMs);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch]);

  /**
   * Cambiar volumen
   */
  const setPlayerVolume = useCallback(async (volumePercent) => {
    if (!isPremium) return false;

    try {
      await spotifyFetch(`/me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT' });
      setVolume(volumePercent);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch]);

  /**
   * Transferir reproducción a dispositivo
   */
  const transferPlayback = useCallback(async (deviceId, startPlaying = true) => {
    if (!isPremium) return false;

    try {
      await spotifyFetch('/me/player', {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: startPlaying
        })
      });

      await getDevices();
      setTimeout(getPlaybackState, 500);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch, getDevices, getPlaybackState]);

  /**
   * Activar/desactivar shuffle
   */
  const setShuffle = useCallback(async (state) => {
    if (!isPremium) return false;

    try {
      await spotifyFetch(`/me/player/shuffle?state=${state}`, { method: 'PUT' });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch]);

  /**
   * Cambiar modo de repetición
   */
  const setRepeat = useCallback(async (state) => {
    if (!isPremium) return false;

    // state: 'track', 'context', 'off'
    try {
      await spotifyFetch(`/me/player/repeat?state=${state}`, { method: 'PUT' });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch]);

  /**
   * Añadir track a la cola
   */
  const addToQueue = useCallback(async (trackUri) => {
    if (!isPremium) return false;

    try {
      await spotifyFetch(`/me/player/queue?uri=${encodeURIComponent(trackUri)}`, { method: 'POST' });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isPremium, spotifyFetch]);

  /**
   * Obtener tracks recientemente reproducidos
   */
  const getRecentlyPlayed = useCallback(async (limit = 20) => {
    try {
      const data = await spotifyFetch(`/me/player/recently-played?limit=${limit}`);
      return data?.items || [];
    } catch (err) {
      console.error('Error getting recently played:', err);
      return [];
    }
  }, [spotifyFetch]);

  /**
   * Iniciar polling del estado
   */
  const startPolling = useCallback((intervalMs = 1000) => {
    if (pollingRef.current) return;

    pollingRef.current = setInterval(() => {
      if (isPlaying) {
        setPosition(prev => Math.min(prev + intervalMs, duration));
      }
    }, intervalMs);

    // También actualizar estado real cada 5 segundos
    const stateInterval = setInterval(getPlaybackState, 5000);

    return () => {
      clearInterval(pollingRef.current);
      clearInterval(stateInterval);
      pollingRef.current = null;
    };
  }, [isPlaying, duration, getPlaybackState]);

  /**
   * Detener polling
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    // Estado
    isPlaying,
    currentTrack,
    position,
    duration,
    volume,
    devices,
    activeDevice,
    isPremium,
    error,
    isLoading,

    // Acciones
    togglePlayback,
    playTrack,
    playContext,
    next,
    previous,
    seek,
    setVolume: setPlayerVolume,
    transferPlayback,
    setShuffle,
    setRepeat,
    addToQueue,

    // Utilidades
    getDevices,
    getPlaybackState,
    getRecentlyPlayed,
    startPolling,
    stopPolling,
    clearError: () => setError(null)
  };
}

