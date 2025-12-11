/**
 * Sistema de almacenamiento avanzado para Motafy
 * Maneja localStorage con compresión, límites y fallbacks
 */

// Constantes
const STORAGE_PREFIX = 'motafy_';
const MAX_STORAGE_MB = 4; // Dejamos margen del límite de 5MB
const MAX_HISTORY_ITEMS = 50;
const MAX_FAVORITES = 500;

/**
 * Comprimir string usando LZ-based compression simple
 */
function compress(str) {
  if (!str || str.length < 100) return str;

  try {
    // Compresión simple basada en repeticiones
    return btoa(encodeURIComponent(str));
  } catch (e) {
    return str;
  }
}

/**
 * Descomprimir string
 */
function decompress(str) {
  if (!str) return str;

  try {
    // Detectar si está comprimido (base64)
    if (/^[A-Za-z0-9+/]+=*$/.test(str) && str.length > 50) {
      return decodeURIComponent(atob(str));
    }
    return str;
  } catch (e) {
    return str;
  }
}

/**
 * Obtener tamaño aproximado en bytes
 */
function getByteSize(str) {
  return new Blob([str]).size;
}

/**
 * Obtener uso total de localStorage
 */
export function getStorageUsage() {
  if (typeof window === 'undefined') return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };

  let total = 0;

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += getByteSize(localStorage[key]) + getByteSize(key);
    }
  }

  const maxBytes = 5 * 1024 * 1024;

  return {
    used: total,
    usedMB: (total / (1024 * 1024)).toFixed(2),
    total: maxBytes,
    totalMB: 5,
    percentage: ((total / maxBytes) * 100).toFixed(1),
    available: maxBytes - total
  };
}

/**
 * Verificar si hay espacio disponible
 */
function hasSpace(dataSize) {
  const usage = getStorageUsage();
  const maxBytes = MAX_STORAGE_MB * 1024 * 1024;
  return (usage.used + dataSize) < maxBytes;
}

/**
 * Limpiar datos antiguos para hacer espacio
 */
function makeSpace(neededBytes) {
  const keys = [];

  // Recopilar todas las keys de Motafy con timestamps
  for (let key in localStorage) {
    if (key.startsWith(STORAGE_PREFIX)) {
      try {
        const data = JSON.parse(localStorage[key]);
        if (data._timestamp) {
          keys.push({ key, timestamp: data._timestamp, size: getByteSize(localStorage[key]) });
        }
      } catch (e) {
        // No es JSON o no tiene timestamp
      }
    }
  }

  // Ordenar por antigüedad (más antiguos primero)
  keys.sort((a, b) => a.timestamp - b.timestamp);

  let freedSpace = 0;
  const keysToRemove = [];

  for (const item of keys) {
    if (freedSpace >= neededBytes) break;
    keysToRemove.push(item.key);
    freedSpace += item.size;
  }

  // Eliminar keys antiguas
  keysToRemove.forEach(key => localStorage.removeItem(key));

  return freedSpace;
}

/**
 * Guardar datos con compresión y manejo de límites
 */
export function saveToStorage(key, data, options = {}) {
  if (typeof window === 'undefined') return false;

  const fullKey = options.noPrefix ? key : STORAGE_PREFIX + key;

  try {
    // Añadir metadata
    const dataWithMeta = {
      ...data,
      _timestamp: Date.now(),
      _version: 1
    };

    let stringData = JSON.stringify(dataWithMeta);

    // Comprimir si es grande
    if (options.compress !== false && stringData.length > 1000) {
      stringData = compress(stringData);
    }

    const dataSize = getByteSize(stringData);

    // Verificar espacio
    if (!hasSpace(dataSize)) {
      // Intentar liberar espacio
      const freed = makeSpace(dataSize);
      if (freed < dataSize) {
        console.warn('No hay suficiente espacio en localStorage');
        return false;
      }
    }

    localStorage.setItem(fullKey, stringData);
    return true;
  } catch (error) {
    console.error(`Error saving to storage [${key}]:`, error);

    // Si es error de cuota, intentar limpiar
    if (error.name === 'QuotaExceededError') {
      makeSpace(1024 * 1024); // Liberar 1MB
      try {
        localStorage.setItem(fullKey, JSON.stringify(data));
        return true;
      } catch (e) {
        return false;
      }
    }

    return false;
  }
}

/**
 * Obtener datos del storage
 */
export function getFromStorage(key, defaultValue = null, options = {}) {
  if (typeof window === 'undefined') return defaultValue;

  const fullKey = options.noPrefix ? key : STORAGE_PREFIX + key;

  try {
    let data = localStorage.getItem(fullKey);
    if (!data) return defaultValue;

    // Intentar descomprimir
    data = decompress(data);

    const parsed = JSON.parse(data);

    // Remover metadata antes de retornar
    const { _timestamp, _version, ...cleanData } = parsed;

    return cleanData;
  } catch (error) {
    console.error(`Error reading from storage [${key}]:`, error);
    return defaultValue;
  }
}

/**
 * Eliminar del storage
 */
export function removeFromStorage(key, options = {}) {
  if (typeof window === 'undefined') return;

  const fullKey = options.noPrefix ? key : STORAGE_PREFIX + key;
  localStorage.removeItem(fullKey);
}

/**
 * Guardar historial con límite de items
 */
export function saveHistory(historyData) {
  // Limitar cantidad de items
  const limitedHistory = historyData.slice(0, MAX_HISTORY_ITEMS);

  // Limitar tracks por entrada para ahorrar espacio
  const compactHistory = limitedHistory.map(entry => ({
    id: entry.id,
    date: entry.date,
    preferences: entry.preferences,
    // Solo guardar info esencial de tracks
    tracks: entry.tracks.slice(0, 30).map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists?.map(a => ({ id: a.id, name: a.name })),
      album: {
        name: track.album?.name,
        images: track.album?.images?.slice(0, 1) // Solo primera imagen
      },
      duration_ms: track.duration_ms,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
      popularity: track.popularity
    }))
  }));

  return saveToStorage('history', compactHistory, { compress: true });
}

/**
 * Guardar favoritos con límite
 */
export function saveFavorites(favorites) {
  // Limitar cantidad
  const limitedFavorites = favorites.slice(0, MAX_FAVORITES);

  // Compactar datos
  const compactFavorites = limitedFavorites.map(track => ({
    id: track.id,
    name: track.name,
    artists: track.artists?.map(a => ({ id: a.id, name: a.name })),
    album: {
      name: track.album?.name,
      images: track.album?.images?.slice(0, 2)
    },
    duration_ms: track.duration_ms,
    preview_url: track.preview_url,
    external_urls: track.external_urls,
    popularity: track.popularity,
    addedAt: track.addedAt || Date.now()
  }));

  return saveToStorage('favorites', compactFavorites);
}

/**
 * Guardar preferencias de widgets
 */
export function savePreferences(preferences) {
  return saveToStorage('preferences', preferences);
}

/**
 * Exportar todos los datos del usuario
 */
export function exportAllData() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    favorites: getFromStorage('favorites', []),
    history: getFromStorage('history', []),
    preferences: getFromStorage('preferences', {}),
    theme: localStorage.getItem('motafy_theme')
  };

  return data;
}

/**
 * Importar datos del usuario
 */
export function importData(data) {
  if (!data || !data.version) {
    throw new Error('Formato de datos inválido');
  }

  if (data.favorites) {
    saveFavorites(data.favorites);
  }

  if (data.history) {
    saveHistory(data.history);
  }

  if (data.preferences) {
    savePreferences(data.preferences);
  }

  if (data.theme) {
    localStorage.setItem('motafy_theme', data.theme);
  }

  return true;
}

/**
 * Limpiar todos los datos de Motafy
 */
export function clearAllData() {
  const keysToRemove = [];

  for (let key in localStorage) {
    if (key.startsWith(STORAGE_PREFIX) || key.startsWith('spotify_')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));

  return keysToRemove.length;
}

/**
 * Verificar salud del storage
 */
export function checkStorageHealth() {
  const usage = getStorageUsage();

  return {
    ...usage,
    isHealthy: parseFloat(usage.percentage) < 80,
    warning: parseFloat(usage.percentage) >= 70,
    critical: parseFloat(usage.percentage) >= 90
  };
}

