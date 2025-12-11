// Generar string aleatorio para el parámetro 'state'
export function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Construir URL de autorización de Spotify
export function getSpotifyAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || '';

  const state = generateRandomString(16);

  // Guardar el state ANTES de construir la URL (prevenir CSRF)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('spotify_auth_state', state);
      // Verificar que se guardó correctamente
      const saved = localStorage.getItem('spotify_auth_state');
      console.log('State saved:', saved === state);
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  // Scopes extendidos para funcionalidad completa
  const scope = [
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
    // Playback (Premium requerido para algunas funciones)
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    // Seguimiento
    'user-follow-read',
    'user-follow-modify'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    state: state,
    scope: scope
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Guardar tokens en localStorage
export function saveTokens(accessToken, refreshToken, expiresIn) {
  const expirationTime = Date.now() + expiresIn * 1000;
  localStorage.setItem('spotify_token', accessToken);
  localStorage.setItem('spotify_refresh_token', refreshToken);
  localStorage.setItem('spotify_token_expiration', expirationTime.toString());
}

// Obtener token actual (con verificación de expiración)
export function getAccessToken() {
  const token = localStorage.getItem('spotify_token');
  const expiration = localStorage.getItem('spotify_token_expiration');
  
  if (!token || !expiration) return null;
  
  // Si el token expiró, retornar null
  if (Date.now() > parseInt(expiration)) {
    return null;
  }
  
  return token;
}

// Verificar si hay token válido
export function isAuthenticated() {
  return getAccessToken() !== null;
}

// Cerrar sesión
export function logout() {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiration');
}