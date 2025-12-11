// Utilidades generales para Motafy

/**
 * Formatear duración en milisegundos a mm:ss
 */
export function formatDuration(ms) {
  if (!ms || isNaN(ms)) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formatear duración total en milisegundos a "X h Y min"
 */
export function formatTotalDuration(ms) {
  if (!ms || isNaN(ms)) return '0 min';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return `${minutes} min`;
}

/**
 * Formatear número con separador de miles
 */
export function formatNumber(num) {
  if (!num) return '0';
  return num.toLocaleString('es-ES');
}

/**
 * Formatear número de seguidores (ej: 1.5M)
 */
export function formatFollowers(num) {
  if (!num) return '0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Formatear fecha relativa
 */
export function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Ahora mismo';
  }
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }
  if (diffDays === 1) {
    return 'Ayer';
  }
  if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Capitalizar primera letra
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatear nombre de género (ej: hip-hop -> Hip Hop)
 */
export function formatGenreName(genre) {
  if (!genre) return '';
  return genre
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncar texto con ellipsis
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Obtener imagen del álbum con fallback
 */
export function getAlbumImage(track, size = 'medium') {
  const images = track?.album?.images || [];

  switch (size) {
    case 'small':
      return images[2]?.url || images[0]?.url || null;
    case 'medium':
      return images[1]?.url || images[0]?.url || null;
    case 'large':
      return images[0]?.url || null;
    default:
      return images[0]?.url || null;
  }
}

/**
 * Obtener imagen del artista con fallback
 */
export function getArtistImage(artist, size = 'medium') {
  const images = artist?.images || [];

  switch (size) {
    case 'small':
      return images[2]?.url || images[0]?.url || null;
    case 'medium':
      return images[1]?.url || images[0]?.url || null;
    case 'large':
      return images[0]?.url || null;
    default:
      return images[0]?.url || null;
  }
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Eliminar duplicados por ID
 */
export function removeDuplicates(array, key = 'id') {
  return Array.from(
    new Map(array.filter(item => item && item[key]).map(item => [item[key], item])).values()
  );
}

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generar string aleatorio
 */
export function generateRandomString(length = 16) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Verificar si es mobile
 */
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Verificar si Web Share API está disponible
 */
export function canShare() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Copiar al clipboard
 */
export async function copyToClipboard(text) {
  if (typeof navigator === 'undefined') return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
}

/**
 * Descargar archivo JSON
 */
export function downloadJSON(data, filename = 'data.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Obtener año de release date
 */
export function getReleaseYear(releaseDate) {
  if (!releaseDate) return null;
  return parseInt(releaseDate.slice(0, 4));
}

/**
 * Obtener década de release date
 */
export function getDecade(releaseDate) {
  const year = getReleaseYear(releaseDate);
  if (!year) return null;
  return Math.floor(year / 10) * 10;
}

/**
 * Calcular color según popularidad
 */
export function getPopularityColor(popularity) {
  if (popularity >= 80) return 'text-green-400';
  if (popularity >= 60) return 'text-yellow-400';
  if (popularity >= 40) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Class names helper (similar a clsx)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

