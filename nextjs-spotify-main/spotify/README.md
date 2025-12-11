# 🎵 Motafy - Generador de Playlists Personalizado

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Spotify_API-Web_API-1DB954?style=for-the-badge&logo=spotify" alt="Spotify" />
</p>

Aplicación web que genera playlists personalizadas de Spotify basándose en las preferencias musicales del usuario mediante widgets configurables.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración de Spotify](#-configuración-de-spotify)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Funcionalidades](#-funcionalidades)
- [Autor](#-autor)

---

## ✨ Características

### Funcionalidades Obligatorias ✅
- ✅ Autenticación OAuth 2.0 con Spotify
- ✅ Token refresh automático
- ✅ 6 widgets funcionales (Artistas, Canciones, Géneros, Décadas, Mood, Popularidad)
- ✅ Generación de playlist basada en preferencias
- ✅ Eliminar tracks de playlist
- ✅ Marcar tracks como favoritos (localStorage)
- ✅ Refrescar playlist
- ✅ Añadir más canciones
- ✅ Diseño responsive

### Funcionalidades Opcionales 🎯
- ✅ Guardar playlist en Spotify
- ✅ Drag & drop para reordenar
- ✅ Guardar preferencias de widgets
- ✅ Historial de playlists
- ✅ Preview de canciones (30s)
- ✅ Exportar playlist como JSON
- ✅ Compartir playlist
- ✅ Sistema de notificaciones toast
- ✅ Tema claro/oscuro
- ✅ Estadísticas de playlist

---

## 🎬 Demo

1. Inicia sesión con tu cuenta de Spotify
2. Configura tus preferencias en los 6 widgets:
   - 🎤 **Artistas**: Busca y selecciona hasta 5 artistas
   - 🎵 **Canciones**: Añade canciones específicas
   - 🎸 **Géneros**: Elige entre 100+ géneros disponibles
   - 📅 **Décadas**: Selecciona tus épocas favoritas
   - 😊 **Mood**: Ajusta energía, positividad, bailabilidad
   - 📊 **Popularidad**: Hits mainstream o joyas ocultas
3. Genera tu playlist personalizada
4. Escucha previews de 30 segundos
5. Guarda en Spotify o exporta como JSON

---

## 📦 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Spotify (gratuita o premium)
- Aplicación registrada en [Spotify for Developers](https://developer.spotify.com/dashboard)

---

## 🚀 Instalación

1. **Clona el repositorio**
```bash
git clone <url-del-repositorio>
cd spotify
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp .env.local.example .env.local
```

4. **Edita `.env.local`** con tus credenciales de Spotify:
```env
SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_aqui
NEXT_PUBLIC_REDIRECT_URI=http://127.0.0.1:3000/auth/callback
```

5. **Ejecuta el servidor de desarrollo**
```bash
npm run dev
```

6. Abre [http://127.0.0.1:3000](http://127.0.0.1:3000) en tu navegador

---

## 🎵 Configuración de Spotify

1. Ve a [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard)
2. Inicia sesión con tu cuenta de Spotify
3. Haz clic en **"Create app"**
4. Completa el formulario:
   - **App name**: Motafy
   - **App description**: Generador de playlists personalizadas
   - **Redirect URI**: `http://127.0.0.1:3000/auth/callback`
   - **API/SDKs**: Web API
5. Guarda tu **Client ID** y **Client Secret**
6. Añádelos a tu archivo `.env.local`

> ⚠️ **Importante**: La Redirect URI debe coincidir EXACTAMENTE con la configurada en `.env.local`

---

## 💻 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## 📁 Estructura del Proyecto

```
spotify/
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── page.js               # Página de inicio/login
│   │   ├── layout.js             # Layout principal
│   │   ├── globals.css           # Estilos globales
│   │   ├── error.js              # Página de error
│   │   ├── not-found.js          # Página 404
│   │   ├── about/                # Página Acerca de
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── auth/callback/        # Callback OAuth
│   │   └── api/                  # API Routes
│   │       ├── spotify-token/    # Intercambio de tokens
│   │       ├── refresh-token/    # Refresh token
│   │       └── save-playlist/    # Guardar playlist
│   │
│   ├── components/               # Componentes React
│   │   ├── layout/               # Header, Footer
│   │   ├── playlist/             # Componentes de playlist
│   │   │   ├── PlaylistDisplay.jsx
│   │   │   ├── TrackCard.jsx
│   │   │   ├── SavePlaylistModal.jsx
│   │   │   ├── HistoryPanel.jsx
│   │   │   └── StatsPanel.jsx
│   │   ├── ui/                   # Componentes UI reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Chip.jsx
│   │   │   ├── Slider.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   └── AudioPlayer.jsx
│   │   ├── widgets/              # Widgets de preferencias
│   │   │   ├── ArtistWidget.jsx
│   │   │   ├── TrackWidget.jsx
│   │   │   ├── GenreWidget.jsx
│   │   │   ├── DecadeWidget.jsx
│   │   │   ├── MoodWidget.jsx
│   │   │   └── PopularityWidget.jsx
│   │   └── Providers.jsx         # Context providers
│   │
│   ├── context/                  # React Context
│   │   ├── AuthContext.js        # Autenticación
│   │   ├── PlaylistContext.js    # Estado de playlist
│   │   ├── ThemeContext.js       # Tema claro/oscuro
│   │   └── ToastContext.js       # Notificaciones
│   │
│   ├── hooks/                    # Custom Hooks
│   │   ├── useSpotifyApi.js      # API de Spotify
│   │   ├── useDebounce.js        # Debounce para búsquedas
│   │   ├── useLocalStorage.js    # Persistencia local
│   │   └── useAudioPlayer.js     # Reproductor de audio
│   │
│   └── lib/                      # Utilidades
│       ├── auth.js               # Funciones de autenticación
│       ├── spotify.js            # Funciones API Spotify
│       ├── constants.js          # Constantes de la app
│       └── utils.js              # Utilidades generales
│
├── public/                       # Archivos estáticos
├── .env.local                    # Variables de entorno (no incluido)
├── .env.local.example            # Ejemplo de variables
├── package.json
└── README.md
```

---

## 🛠 Tecnologías

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Next.js | 16.0.1 | Framework React para producción |
| React | 19.2.0 | Biblioteca de UI |
| Tailwind CSS | 4.0 | Framework CSS utility-first |
| @dnd-kit | 6.3.1 | Drag & drop accesible |
| react-icons | 5.5.0 | Iconos para React |
| Spotify Web API | - | API para acceder a Spotify |

---

## 🎯 Funcionalidades Detalladas

### 🔐 Autenticación
- OAuth 2.0 con Spotify
- Validación CSRF con parámetro state
- Token refresh automático antes de expirar
- Logout seguro

### 🎨 Widgets
- **ArtistWidget**: Búsqueda con debounce, selección múltiple, preview de imagen
- **TrackWidget**: Búsqueda de canciones, preview de audio, duración
- **GenreWidget**: 100+ géneros, filtrado por búsqueda
- **DecadeWidget**: Selector visual con emojis
- **MoodWidget**: Sliders para energía, positividad, bailabilidad, acústico
- **PopularityWidget**: Presets y rango personalizado

### 📀 Playlist
- Generación inteligente combinando preferencias
- Drag & drop para reordenar
- Eliminar canciones individuales
- Preview de 30 segundos
- Guardar en Spotify
- Exportar como JSON
- Historial de playlists anteriores

### ❤️ Favoritos
- Marcar/desmarcar canciones
- Persistencia en localStorage
- Vista dedicada de favoritos

### 📊 Estadísticas
- Popularidad promedio
- Artistas únicos
- Década dominante
- Duración total
- Géneros más presentes

---

## 👨‍💻 Autor

**Proyecto Final - Programación Web 1**  
Universidad U-tad  
Grado en Desarrollo de Productos Interactivos

---

## 📄 Licencia

Este proyecto es para fines educativos. Los datos y contenido musical pertenecen a Spotify AB.

---

## 🙏 Agradecimientos

- [Spotify Web API](https://developer.spotify.com/documentation/web-api) por proporcionar acceso a datos musicales
- [Next.js](https://nextjs.org) por el excelente framework
- [Tailwind CSS](https://tailwindcss.com) por el sistema de estilos
- [React Icons](https://react-icons.github.io/react-icons/) por los iconos

