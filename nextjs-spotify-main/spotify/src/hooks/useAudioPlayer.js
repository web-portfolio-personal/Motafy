import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Crear elemento de audio una sola vez
    audioRef.current = new Audio();

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleError = () => {
      console.error('Error playing audio');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  const play = useCallback((track) => {
    if (!track?.preview_url) {
      console.warn('No preview available for this track');
      return false;
    }

    const audio = audioRef.current;

    // Si es el mismo track, toggle play/pause
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return true;
    }

    // Nuevo track
    audio.src = track.preview_url;
    audio.play();
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    return true;
  }, [currentTrack, isPlaying]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
  }, []);

  const seek = useCallback((percentage) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (percentage / 100) * audio.duration;
    }
  }, []);

  const setVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    currentTrack,
    isPlaying,
    progress,
    duration,
    play,
    pause,
    stop,
    seek,
    setVolume
  };
}

