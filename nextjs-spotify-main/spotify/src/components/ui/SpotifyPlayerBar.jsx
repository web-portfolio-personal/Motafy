'use client';

import { useState, useEffect } from 'react';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX,
  FiShuffle, FiRepeat, FiMonitor, FiSmartphone, FiSpeaker, FiX,
  FiChevronUp, FiChevronDown, FiHeart, FiExternalLink
} from 'react-icons/fi';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { usePlaylist } from '@/context/PlaylistContext';

export default function SpotifyPlayerBar() {
  const {
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
    togglePlayback,
    next,
    previous,
    seek,
    setVolume,
    transferPlayback,
    setShuffle,
    setRepeat,
    getDevices,
    getPlaybackState,
    clearError
  } = useSpotifyPlayer();

  const { toggleFavorite, isFavorite } = usePlaylist();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [localVolume, setLocalVolume] = useState(volume);

  const favorite = currentTrack ? isFavorite(currentTrack.id) : false;

  // Inicializar
  useEffect(() => {
    if (isPremium) {
      getPlaybackState();
      getDevices();
    }
  }, [isPremium, getPlaybackState, getDevices]);

  // Sincronizar volumen
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  // Formatear tiempo
  const formatTime = (ms) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcular porcentaje de progreso
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  // Manejar seek al hacer clic en la barra
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newPosition = Math.floor(percent * duration);
    seek(newPosition);
  };

  // Manejar cambio de volumen
  const handleVolumeChange = async (e) => {
    const newVolume = parseInt(e.target.value);
    setLocalVolume(newVolume);
    await setVolume(newVolume);
  };

  // Cambiar shuffle
  const handleShuffle = async () => {
    const newState = !shuffleEnabled;
    const success = await setShuffle(newState);
    if (success) setShuffleEnabled(newState);
  };

  // Cambiar repeat
  const handleRepeat = async () => {
    const modes = ['off', 'context', 'track'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    const success = await setRepeat(nextMode);
    if (success) setRepeatMode(nextMode);
  };

  // Seleccionar dispositivo
  const handleDeviceSelect = async (deviceId) => {
    await transferPlayback(deviceId);
    setShowDevices(false);
  };

  // Icono de dispositivo
  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'computer':
        return FiMonitor;
      case 'smartphone':
        return FiSmartphone;
      default:
        return FiSpeaker;
    }
  };

  // Si no hay Premium o no hay reproducción activa
  if (!isPremium || !currentTrack) {
    return null;
  }

  return (
    <>
      {/* Barra compacta */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-900/98 to-zinc-900/95 backdrop-blur-lg border-t border-white/10">
        {/* Progress bar */}
        <div
          className="h-1 bg-white/10 cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-spotify-green relative transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Track info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="md:hidden p-1 text-white/50"
              >
                {isExpanded ? <FiChevronDown /> : <FiChevronUp />}
              </button>

              {currentTrack.album?.images?.[0] && (
                <img
                  src={currentTrack.album.images[0].url}
                  alt={currentTrack.name}
                  className="w-12 h-12 rounded-lg object-cover shadow-lg"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="font-medium text-white truncate text-sm">
                  {currentTrack.name}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {currentTrack.artists?.map(a => a.name).join(', ')}
                </p>
              </div>

              <button
                onClick={() => toggleFavorite(currentTrack)}
                className={`p-2 rounded-full transition-colors hidden sm:block ${
                  favorite ? 'text-spotify-green' : 'text-white/50 hover:text-white'
                }`}
              >
                <FiHeart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleShuffle}
                className={`p-2 rounded-full transition-colors hidden sm:block ${
                  shuffleEnabled ? 'text-spotify-green' : 'text-white/50 hover:text-white'
                }`}
              >
                <FiShuffle className="h-4 w-4" />
              </button>

              <button
                onClick={previous}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <FiSkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={togglePlayback}
                disabled={isLoading}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isPlaying ? (
                  <FiPause className="h-5 w-5 text-black" />
                ) : (
                  <FiPlay className="h-5 w-5 text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={next}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <FiSkipForward className="h-5 w-5" />
              </button>

              <button
                onClick={handleRepeat}
                className={`p-2 rounded-full transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-spotify-green' : 'text-white/50 hover:text-white'
                }`}
              >
                <FiRepeat className="h-4 w-4" />
                {repeatMode === 'track' && (
                  <span className="absolute text-[8px] font-bold">1</span>
                )}
              </button>
            </div>

            {/* Time & Volume */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
              <span className="text-xs text-white/50 w-10 text-right">
                {formatTime(position)}
              </span>
              <span className="text-xs text-white/30">/</span>
              <span className="text-xs text-white/50 w-10">
                {formatTime(duration)}
              </span>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume(localVolume > 0 ? 0 : 50)}
                  className="p-1 text-white/50 hover:text-white transition-colors"
                >
                  {localVolume === 0 ? (
                    <FiVolumeX className="h-4 w-4" />
                  ) : (
                    <FiVolume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localVolume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-3
                           [&::-webkit-slider-thumb]:h-3
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Devices */}
              <div className="relative">
                <button
                  onClick={() => setShowDevices(!showDevices)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                  title={activeDevice?.name || 'Dispositivos'}
                >
                  {(() => {
                    const Icon = getDeviceIcon(activeDevice?.type);
                    return <Icon className="h-4 w-4" />;
                  })()}
                </button>

                {showDevices && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-zinc-800 rounded-xl shadow-xl border border-white/10 overflow-hidden animate-scale-in">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white">Dispositivos disponibles</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {devices.length === 0 ? (
                        <p className="p-3 text-sm text-white/50">No hay dispositivos activos</p>
                      ) : (
                        devices.map(device => {
                          const DeviceIcon = getDeviceIcon(device.type);
                          return (
                            <button
                              key={device.id}
                              onClick={() => handleDeviceSelect(device.id)}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors ${
                                device.is_active ? 'bg-spotify-green/10' : ''
                              }`}
                            >
                              <DeviceIcon className={`h-5 w-5 ${device.is_active ? 'text-spotify-green' : 'text-white/50'}`} />
                              <div className="flex-1 text-left">
                                <p className={`text-sm font-medium ${device.is_active ? 'text-spotify-green' : 'text-white'}`}>
                                  {device.name}
                                </p>
                                <p className="text-xs text-white/50">{device.type}</p>
                              </div>
                              {device.is_active && (
                                <span className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <button
                      onClick={() => getDevices()}
                      className="w-full p-2 text-xs text-white/50 hover:text-white hover:bg-white/5 border-t border-white/10"
                    >
                      Actualizar dispositivos
                    </button>
                  </div>
                )}
              </div>

              {/* Open in Spotify */}
              {currentTrack.external_urls?.spotify && (
                <a
                  href={currentTrack.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/50 hover:text-spotify-green transition-colors"
                >
                  <FiExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-600 text-white text-sm rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
          <span>{error}</span>
          <button onClick={clearError} className="p-1 hover:bg-white/20 rounded">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

