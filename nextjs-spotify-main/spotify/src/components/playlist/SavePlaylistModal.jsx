'use client';

import { useState } from 'react';
import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { FaSpotify } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { usePlaylist } from '@/context/PlaylistContext';
import { useAuth } from '@/context/AuthContext';
import { useSpotifyApi } from '@/hooks/useSpotifyApi';

export default function SavePlaylistModal({ isOpen, onClose }) {
  const { playlist } = usePlaylist();
  const { user } = useAuth();
  const { createPlaylist, addTracksToPlaylist } = useSpotifyApi();

  const [name, setName] = useState('Mi Playlist de Motafy');
  const [description, setDescription] = useState('Playlist generada con Motafy - Tu generador de playlists personalizado');
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState(null);

  const handleSave = async () => {
    if (!user?.id || playlist.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      // 1. Crear la playlist
      const newPlaylist = await createPlaylist(user.id, name, description, isPublic);

      // 2. Añadir tracks a la playlist (max 100 por request)
      const trackUris = playlist.map(track => `spotify:track:${track.id}`);

      // Dividir en chunks de 100
      for (let i = 0; i < trackUris.length; i += 100) {
        const chunk = trackUris.slice(i, i + 100);
        await addTracksToPlaylist(newPlaylist.id, chunk);
      }

      setSaved(true);
      setPlaylistUrl(newPlaylist.external_urls?.spotify);
    } catch (err) {
      console.error('Error saving playlist:', err);
      setError(err.message || 'Error al guardar la playlist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSaved(false);
    setError(null);
    setPlaylistUrl(null);
    onClose?.();
  };

  const openInSpotify = () => {
    if (playlistUrl) {
      window.open(playlistUrl, '_blank');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={saved ? '¡Playlist Guardada!' : 'Guardar en Spotify'}
      size="md"
    >
      {saved ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="h-8 w-8 text-spotify-green" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            ¡Tu playlist ha sido guardada!
          </h3>
          <p className="text-white/60 mb-6">
            Ahora puedes encontrarla en tu biblioteca de Spotify
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={openInSpotify}
              icon={<FaSpotify className="h-5 w-5" />}
            >
              Abrir en Spotify
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nombre de la playlist
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi Playlist de Motafy"
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              maxLength={100}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de tu playlist..."
              rows={3}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-spotify-green resize-none"
              maxLength={300}
            />
          </div>

          {/* Visibilidad */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">Playlist pública</p>
              <p className="text-sm text-white/50">
                {isPublic ? 'Cualquiera podrá ver tu playlist' : 'Solo tú podrás verla'}
              </p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-spotify-green' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isPublic ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="flex items-center gap-3 p-4 bg-spotify-green/10 rounded-lg border border-spotify-green/20">
            <FaSpotify className="h-6 w-6 text-spotify-green flex-shrink-0" />
            <p className="text-sm text-white/70">
              Se guardarán <strong className="text-white">{playlist.length} canciones</strong> en tu cuenta de Spotify
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <FiAlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
              disabled={!name.trim() || playlist.length === 0}
              icon={<FiSave className="h-4 w-4" />}
            >
              Guardar Playlist
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

