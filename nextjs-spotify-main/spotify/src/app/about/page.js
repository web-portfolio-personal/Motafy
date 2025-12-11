'use client';

import Link from 'next/link';
import {
  FiArrowLeft, FiMusic, FiHeart, FiZap, FiSliders,
  FiSave, FiShare2, FiGithub, FiExternalLink, FiCode
} from 'react-icons/fi';
import { FaSpotify, FaReact } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss } from 'react-icons/si';
import Button from '@/components/ui/Button';

const TECH_STACK = [
  {
    name: 'Next.js 14',
    description: 'Framework de React para producción',
    icon: SiNextdotjs,
    color: 'text-white'
  },
  {
    name: 'React 19',
    description: 'Biblioteca de interfaz de usuario',
    icon: FaReact,
    color: 'text-cyan-400'
  },
  {
    name: 'Tailwind CSS',
    description: 'Framework CSS utility-first',
    icon: SiTailwindcss,
    color: 'text-cyan-500'
  },
  {
    name: 'Spotify Web API',
    description: 'API para acceder a datos de Spotify',
    icon: FaSpotify,
    color: 'text-spotify-green'
  }
];

const FEATURES = [
  {
    icon: FiSliders,
    title: '6 Widgets Configurables',
    description: 'Artistas, Canciones, Géneros, Décadas, Mood y Popularidad para personalizar tu experiencia.'
  },
  {
    icon: FiZap,
    title: 'Generación Inteligente',
    description: 'Algoritmo que combina tus preferencias para crear playlists únicas.'
  },
  {
    icon: FiHeart,
    title: 'Sistema de Favoritos',
    description: 'Guarda tus canciones favoritas con persistencia en localStorage.'
  },
  {
    icon: FiSave,
    title: 'Guardar en Spotify',
    description: 'Exporta tus playlists directamente a tu cuenta de Spotify.'
  },
  {
    icon: FiMusic,
    title: 'Preview de 30s',
    description: 'Escucha un adelanto de cada canción antes de añadirla.'
  },
  {
    icon: FiShare2,
    title: 'Compartir y Exportar',
    description: 'Comparte tus playlists o expórtalas en formato JSON.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-spotify-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-12"
        >
          <FiArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <header className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-spotify-green to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-spotify-green/30">
            <FiMusic className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Sobre <span className="text-spotify-green">Motafy</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Un generador de playlists personalizado que conecta con Spotify
            para crear la banda sonora perfecta basada en tus gustos musicales.
          </p>
        </header>

        {/* About */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FiCode className="h-6 w-6 text-spotify-green" />
            Sobre el Proyecto
          </h2>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-white/70 leading-relaxed mb-4">
              <strong className="text-white">Motafy</strong> es el proyecto final de la asignatura
              <strong className="text-spotify-green"> Programación Web 1</strong> del grado en
              Desarrollo de Productos Interactivos de la Universidad U-tad.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              El objetivo del proyecto es desarrollar una aplicación web profesional utilizando
              React y Next.js, implementando autenticación OAuth 2.0 con Spotify y trabajando
              con APIs externas para crear una experiencia de usuario fluida y atractiva.
            </p>
            <p className="text-white/70 leading-relaxed">
              La aplicación permite a los usuarios configurar sus preferencias musicales a través
              de 6 widgets diferentes y generar playlists personalizadas que pueden guardar
              directamente en su cuenta de Spotify.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 hover:bg-white/10 rounded-xl p-5 border border-white/10 transition-all hover:scale-105"
                >
                  <div className="w-10 h-10 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-spotify-green" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-white/50">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Tecnologías Utilizadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TECH_STACK.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-5 border border-white/10 text-center hover:bg-white/10 transition-colors"
                >
                  <Icon className={`h-10 w-10 ${tech.color} mx-auto mb-3`} />
                  <h3 className="font-semibold text-white text-sm">{tech.name}</h3>
                  <p className="text-xs text-white/50 mt-1">{tech.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Links */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Enlaces de Interés
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://developer.spotify.com/documentation/web-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-colors"
            >
              <FaSpotify className="h-5 w-5 text-spotify-green" />
              Spotify Web API
              <FiExternalLink className="h-4 w-4 text-white/50" />
            </a>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-colors"
            >
              <SiNextdotjs className="h-5 w-5" />
              Next.js Docs
              <FiExternalLink className="h-4 w-4 text-white/50" />
            </a>
            <a
              href="https://u-tad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-colors"
            >
              🎓 U-tad
              <FiExternalLink className="h-4 w-4 text-white/50" />
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 bg-gradient-to-r from-spotify-green/10 to-green-600/10 rounded-2xl border border-spotify-green/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            ¿Listo para crear tu playlist perfecta?
          </h2>
          <p className="text-white/60 mb-6">
            Conecta tu cuenta de Spotify y empieza a generar playlists personalizadas
          </p>
          <Link href="/">
            <Button size="lg" icon={<FaSpotify className="h-5 w-5" />}>
              Empezar ahora
            </Button>
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Motafy • Proyecto Final Programación Web 1 • U-tad
          </p>
          <p className="text-white/30 text-xs mt-2">
            Los datos y contenido musical pertenecen a Spotify AB
          </p>
        </footer>
      </div>
    </div>
  );
}

