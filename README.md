<div align="center">

# 🎵 Motafy

### Generador de Playlists Personalizadas con Spotify

<p>
  <img src="https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Spotify_API-1DB954?style=for-the-badge&logo=spotify&logoColor=white" alt="Spotify" />
</p>

**Motafy** es una aplicación web que permite crear playlists personalizadas de Spotify mediante un sistema intuitivo de widgets configurables. Genera listas de reproducción únicas basadas en artistas, géneros, décadas, estado de ánimo y popularidad.

[🌐 Ver Demo en Vivo](https://motafy.vercel.app)

</div>

---

## 📋 Índice

1. [Funcionalidades Obligatorias](#-funcionalidades-obligatorias)
2. [Funcionalidades Opcionales Implementadas](#-funcionalidades-opcionales-implementadas)
3. [Funcionalidades Extra Añadidas](#-funcionalidades-extra-añadidas)
4. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
5. [Gestión de Estado](#-gestión-de-estado)
6. [Autor](#-autor)

---

## ✅ Funcionalidades Obligatorias

Todas las funcionalidades obligatorias del enunciado están implementadas:

### 🔐 Autenticación OAuth 2.0

| Archivo | Descripción |
|---------|-------------|
| `src/context/AuthContext.js` | Gestiona todo el estado de autenticación |
| `src/lib/auth.js` | Funciones de generación de URLs y validación CSRF |
| `src/app/api/spotify-token/route.js` | Exchange del código por tokens (server-side) |
| `src/app/api/refresh-token/route.js` | Renovación automática de tokens |
| `src/app/auth/callback/page.js` | Manejo del callback de Spotify |

**Características:**
- ✅ Validación CSRF con parámetro `state`
- ✅ Token refresh automático antes de expirar
- ✅ Client Secret protegido en el servidor
- ✅ Logout seguro limpiando localStorage

### 🎛️ 6 Widgets de Preferencias

| Widget | Archivo | Funcionalidad |
|--------|---------|---------------|
| 🎤 **Artistas** | `src/components/widgets/ArtistWidget.jsx` | Búsqueda y selección de hasta 5 artistas con preview de imagen |
| 🎵 **Canciones** | `src/components/widgets/TrackWidget.jsx` | Búsqueda de canciones como semillas para recomendaciones |
| 🎸 **Géneros** | `src/components/widgets/GenreWidget.jsx` | 100+ géneros con filtrado instantáneo y chips seleccionables |
| 📅 **Décadas** | `src/components/widgets/DecadeWidget.jsx` | Selector visual de épocas (50s - 2020s) |
| 😊 **Mood** | `src/components/widgets/MoodWidget.jsx` | Sliders para energía, positividad, bailabilidad, acústico |
| 📊 **Popularidad** | `src/components/widgets/PopularityWidget.jsx` | Presets rápidos o rango personalizado |

**Características técnicas:**
- Búsqueda con **debounce** de 300ms (`src/hooks/useDebounce.js`)
- Estado centralizado en `src/context/PlaylistContext.js`
- Límites de selección configurables por widget

### 📀 Generación y Gestión de Playlist

| Funcionalidad | Archivo | Descripción |
|---------------|---------|-------------|
| Generar playlist | `PlaylistContext.js` → `generatePlaylist()` | Combina preferencias y llama a `/recommendations` |
| Eliminar tracks | `PlaylistContext.js` → `removeTrack()` | Elimina canciones individuales |
| Refrescar | `PlaylistContext.js` → `refreshPlaylist()` | Genera nuevas recomendaciones |
| Añadir más | `PlaylistContext.js` → `addMoreTracks()` | Añade canciones manteniendo las actuales |
| Reordenar | `PlaylistDisplay.jsx` con `@dnd-kit` | Drag & Drop accesible |

### 💾 Guardar Playlist en Spotify

| Archivo | Funcionalidad |
|---------|---------------|
| `src/app/api/save-playlist/route.js` | API Route que crea la playlist y añade tracks |
| `src/components/playlist/SavePlaylistModal.jsx` | Modal para nombrar y guardar |

---

## 🎯 Funcionalidades Opcionales Implementadas

### ❤️ Sistema de Favoritos

**Archivos involucrados:**
- `src/context/PlaylistContext.js` → `toggleFavorite()`, `isFavorite()`, `favorites`
- `src/app/favorites/page.js` → Página dedicada
- `src/components/playlist/FavoriteTrackCard.jsx` → Tarjeta con funcionalidades

**Características:**
- Persistencia en localStorage
- Vista Grid/Lista intercambiable
- Búsqueda y filtrado de favoritos
- Ordenación por: recientes, nombre, artista, año
- Estadísticas de favoritos (artista más favorito, década predominante)

### 🔀 Drag & Drop para Reordenar

**Implementación:** Librería `@dnd-kit/sortable`

```
src/components/playlist/PlaylistDisplay.jsx
├── DndContext
├── SortableContext
└── TrackCard (useSortable hook)
```

### 📜 Historial de Playlists

**Archivos:**
- `src/context/PlaylistContext.js` → `history`, `loadFromHistory()`
- `src/components/playlist/HistoryPanel.jsx` → Panel desplegable

Guarda automáticamente cada playlist generada con timestamp.

### 🎧 Preview de Canciones (30 segundos)

**Sistema de audio global:**
- `src/context/AudioContext.js` → Estado del reproductor
- `src/components/ui/GlobalPlayer.jsx` → Barra inferior tipo Spotify

### 📤 Exportar Playlist como JSON

```javascript
// PlaylistContext.js
exportPlaylist() → Descarga archivo .json con toda la información
```

### 🔗 Compartir Playlist

Genera URL con parámetros codificados para compartir configuración.

### 🔔 Sistema de Notificaciones Toast

**Archivos:**
- `src/context/ToastContext.js` → Provider y hooks
- Métodos: `toast.success()`, `toast.error()`, `toast.info()`

### 🌓 Tema Claro/Oscuro

**Archivos:**
- `src/context/ThemeContext.js` → Toggle y persistencia
- `src/app/globals.css` → Variables CSS para ambos temas

---

## 🌟 Funcionalidades Extra Añadidas

### 📈 Wrapped Personal (Estilo Spotify)

**Archivo principal:** `src/app/wrapped/page.js`

Una experiencia inmersiva de 7 slides animados que muestra tu resumen musical:

| Slide | Contenido |
|-------|-----------|
| 1 | Intro personalizada con nombre del usuario |
| 2 | Estadísticas generales: playlists, canciones, favoritos, interacciones |
| 3 | Tu artista #1 con imagen circular y badge dorado |
| 4 | Top 5 canciones favoritas con carátulas |
| 5 | Top 5 artistas con barras de porcentaje animadas |
| 6 | Gráfico de actividad semanal |
| 7 | Resumen final con botones de acción |

**Características técnicas:**
- Imagen de fondo dinámica con blur de tus canciones
- Partículas decorativas flotantes (CSS animations)
- Transiciones entre slides con animaciones por fases
- Gradientes de fondo que cambian por slide
- Datos extraídos de `PlaylistContext.stats`

### 📊 Panel de Estadísticas Avanzado

**Archivo:** `src/app/stats/page.js`

| Métrica | Descripción |
|---------|-------------|
| Playlists generadas | Total histórico |
| Canciones generadas | Suma de todas las canciones |
| Favoritos guardados | Total en localStorage |
| Gráfico de actividad | Barras animadas de 7 días |

**Sistema de tracking:** `PlaylistContext.js` → `trackActivity()`, `activityLog`, `getActivityByDay()`

### 🎲 Generación de Canción Individual

**Ubicación:** Dashboard → Botón "Generar Canción"

**Funcionalidad:** `PlaylistContext.js` → `generateSingleTrack()`

**Modal resultante:**
- Fondo con blur de la carátula del álbum
- Información detallada: año, duración, popularidad
- Barra de popularidad visual
- Botones: favorito, añadir a playlist, generar otra

### ℹ️ Popup de Información de Canción

**Componente:** `src/components/ui/TrackInfoPopup.jsx`

Aparece al mantener el cursor sobre cualquier carátula (~400ms):

| Información | Acciones |
|-------------|----------|
| Imagen grande del álbum | Botón de play (si hay preview) |
| Nombre y artista | Añadir a favoritos |
| Álbum y año | Añadir/quitar de playlist |
| Duración | Abrir en Spotify |
| Barra de popularidad | - |

**Integrado en:**
- `TrackCard.jsx` (playlist)
- `FavoriteTrackCard.jsx` (favoritos)

### 🎧 Reproductor Global

**Archivos:**
- `src/context/AudioContext.js` → `playTrack()`, `togglePlay()`, `seekTo()`, etc.
- `src/components/ui/GlobalPlayer.jsx` → Componente visual

**Características:**
| Elemento | Funcionalidad |
|----------|---------------|
| Barra de progreso | Clickeable para navegar |
| Control de volumen | Slider + mute |
| Info de canción | Carátula, nombre, artista |
| Favorito rápido | Toggle directo |
| Badge "Preview 30s" | Indica que es preview |

---

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── page.js                   # Landing page con login
│   ├── dashboard/page.js         # Dashboard principal con widgets
│   ├── favorites/page.js         # Gestión de favoritos
│   ├── stats/page.js             # Panel de estadísticas
│   ├── wrapped/page.js           # Wrapped personal
│   ├── about/page.js             # Página informativa
│   └── api/                      # API Routes (server-side)
│       ├── spotify-token/        # OAuth token exchange
│       ├── refresh-token/        # Token refresh
│       └── save-playlist/        # Guardar en Spotify
│
├── components/
│   ├── widgets/                  # 6 widgets de preferencias
│   ├── playlist/                 # PlaylistDisplay, TrackCard, etc.
│   ├── ui/                       # Componentes reutilizables
│   └── layout/                   # Header, Footer
│
├── context/                      # React Context API
│   ├── AuthContext.js            # Autenticación
│   ├── PlaylistContext.js        # Playlist + Favoritos + Stats
│   ├── AudioContext.js           # Reproductor global
│   ├── ThemeContext.js           # Tema claro/oscuro
│   └── ToastContext.js           # Notificaciones
│
├── hooks/                        # Custom Hooks
│   ├── useSpotifyApi.js          # Llamadas a Spotify API
│   ├── useDebounce.js            # Debounce para búsquedas
│   └── useLocalStorage.js        # Persistencia local
│
└── lib/                          # Utilidades
    ├── auth.js                   # Funciones OAuth
    ├── spotify.js                # Wrapper de Spotify API
    ├── requestQueue.js           # Rate limiting (150 req/min)
    └── constants.js              # Géneros, décadas, etc.
```

---

## 🧠 Gestión de Estado

### PlaylistContext (Estado Principal)

```javascript
// Estados
playlist          // Array de canciones actuales
favorites         // Array de favoritos (persistido)
history           // Historial de playlists
preferences       // Configuración de widgets
stats             // Estadísticas de uso
activityLog       // Log de actividad para gráficos

// Funciones principales
generatePlaylist()      // Genera playlist basada en preferencias
generateSingleTrack()   // Genera una canción individual
toggleFavorite()        // Añade/quita de favoritos
trackActivity()         // Registra actividad para stats
getActivityByDay()      // Datos para gráfico de 7 días
```

### AudioContext (Reproductor)

```javascript
currentTrack      // Canción actual
isPlaying         // Estado de reproducción
progress          // Progreso (0-100)
volume            // Volumen (0-1)

playTrack(track)  // Reproduce una canción
togglePlay()      // Play/Pause
seekTo(percent)   // Navegar en la canción
```

---

## 👨‍💻 Autor

<div align="center">
  
### José Antonio Mota Lucas

**Ingeniería del Software + Título Propio en Videojuegos**

Universidad U-tad · Madrid, España

*Proyecto Final - Programación Web 1*

</div>

---

## 📄 Licencia

Proyecto desarrollado con fines educativos. Los datos musicales pertenecen a **Spotify AB**.

---

<div align="center">
  
<sub>Hecho con ❤️ por José Antonio Mota Lucas</sub>

</div>

