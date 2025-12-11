'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiX, FiExternalLink, FiHeart } from 'react-icons/fi';
import { usePlaylist } from '@/context/PlaylistContext';

export default function AudioPlayer({ track, onClose }) {
  const { toggleFavorite, isFavorite } = usePlaylist();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const favorite = isFavorite(track?.id);

  useEffect(() => {
    if (!track?.preview_url) return;

    const audio = new Audio(track.preview_url);
    audioRef.current = audio;
    audio.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Auto-play
    audio.play().catch(console.error);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
    };
  }, [track, volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.7;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-900/95 to-zinc-900/90 backdrop-blur-md border-t border-white/10 p-4 animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={track.album?.images?.[1]?.url || track.album?.images?.[0]?.url}
            alt={track.name}
            className="w-14 h-14 rounded-lg object-cover shadow-lg"
          />
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{track.name}</p>
            <p className="text-sm text-white/50 truncate">
              {track.artists?.map(a => a.name).join(', ')}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(track)}
            className={`p-2 rounded-full transition-colors ${
              favorite ? 'text-spotify-green' : 'text-white/50 hover:text-white'
            }`}
          >
            <FiHeart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <FiPause className="h-5 w-5 text-black" />
              ) : (
                <FiPlay className="h-5 w-5 text-black ml-0.5" />
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-white/50 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer group"
            >
              <div
                className="h-full bg-spotify-green rounded-full relative group-hover:bg-spotify-green-light transition-colors"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
              </div>
            </div>
            <span className="text-xs text-white/50 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume and actions */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              {isMuted ? (
                <FiVolumeX className="h-5 w-5" />
              ) : (
                <FiVolume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          {/* Open in Spotify */}
          {track.external_urls?.spotify && (
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/50 hover:text-spotify-green transition-colors"
              title="Abrir en Spotify"
            >
              <FiExternalLink className="h-5 w-5" />
            </a>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

