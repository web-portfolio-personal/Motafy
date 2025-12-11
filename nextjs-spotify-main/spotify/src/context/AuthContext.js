'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccessToken, saveTokens, logout as authLogout, isAuthenticated } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Función para refrescar el token
  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('spotify_refresh_token');
    if (!refreshTokenValue) return null;

    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshTokenValue })
      });

      if (!response.ok) throw new Error('Failed to refresh token');

      const data = await response.json();
      const expirationTime = Date.now() + data.expires_in * 1000;

      localStorage.setItem('spotify_token', data.access_token);
      localStorage.setItem('spotify_token_expiration', expirationTime.toString());

      setToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return null;
    }
  }, []);

  // Obtener token válido (con auto-refresh)
  const getValidToken = useCallback(async () => {
    const currentToken = getAccessToken();
    if (currentToken) {
      return currentToken;
    }

    // Si no hay token válido, intentar refrescar
    return await refreshToken();
  }, [refreshToken]);

  // Obtener perfil del usuario
  const fetchUserProfile = useCallback(async () => {
    const accessToken = await getValidToken();
    if (!accessToken) return null;

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            const retryResponse = await fetch('https://api.spotify.com/v1/me', {
              headers: { 'Authorization': `Bearer ${newToken}` }
            });
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        }
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [getValidToken, refreshToken]);

  // Inicializar autenticación
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        const accessToken = getAccessToken();
        setToken(accessToken);

        const userProfile = await fetchUserProfile();
        setUser(userProfile);
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchUserProfile]);

  // Configurar auto-refresh del token
  useEffect(() => {
    if (!token) return;

    const expiration = localStorage.getItem('spotify_token_expiration');
    if (!expiration) return;

    const expiresIn = parseInt(expiration) - Date.now();
    // Refrescar 5 minutos antes de expirar
    const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 0);

    const timeoutId = setTimeout(() => {
      refreshToken();
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [token, refreshToken]);

  const logout = () => {
    authLogout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    getValidToken,
    refreshToken,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

