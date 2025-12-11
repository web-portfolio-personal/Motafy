'use client';

import Link from 'next/link';
import { FiGithub, FiHeart, FiExternalLink, FiInfo } from 'react-icons/fi';
import { FaSpotify } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                <FaSpotify className="h-4 w-4 text-black" />
              </div>
              <span className="text-lg font-bold text-white">
                Mota<span className="text-spotify-green">fy</span>
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Genera playlists personalizadas de Spotify basándose en tus preferencias musicales
              mediante widgets configurables.
            </p>
          </div>

          {/* Enlaces útiles */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Enlaces Útiles</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://developer.spotify.com/documentation/web-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-spotify-green transition-colors text-sm flex items-center gap-2"
                >
                  <FaSpotify className="h-4 w-4" />
                  Spotify Web API
                  <FiExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://nextjs.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-spotify-green transition-colors text-sm flex items-center gap-2"
                >
                  Next.js Docs
                  <FiExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-spotify-green transition-colors text-sm flex items-center gap-2"
                >
                  <FiGithub className="h-4 w-4" />
                  GitHub
                  <FiExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Información del proyecto */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Sobre el Proyecto</h3>
            <p className="text-white/60 text-sm">
              Proyecto Final de Programación Web 1
            </p>
            <p className="text-white/60 text-sm">
              Universidad U-tad
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-white/60 hover:text-spotify-green transition-colors text-sm"
            >
              <FiInfo className="h-4 w-4" />
              Más información
            </Link>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>Hecho con</span>
              <FiHeart className="h-4 w-4 text-red-500" />
              <span>usando React y Next.js</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} Motafy. Todos los derechos reservados.
          </p>
          <p className="text-white/40 text-sm">
            Los datos y contenido musical pertenecen a Spotify AB.
          </p>
        </div>
      </div>
    </footer>
  );
}

