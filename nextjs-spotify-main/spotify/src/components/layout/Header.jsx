'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiMenu, FiX, FiMusic, FiUser, FiHeart, FiList, FiInfo } from 'react-icons/fi';
import { usePlaylist } from '@/context/PlaylistContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { favorites } = usePlaylist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <FiMusic className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Mota<span className="text-spotify-green">fy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
              >
                <FiList className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/about"
                className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
              >
                <FiInfo className="h-4 w-4" />
                Acerca de
              </Link>
              <div className="flex items-center gap-2 text-white/70">
                <FiHeart className="h-4 w-4 text-spotify-green" />
                <span>{favorites.length} favoritos</span>
              </div>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun className="h-5 w-5" />
              ) : (
                <FiMoon className="h-5 w-5" />
              )}
            </button>

            {isAuthenticated && user && (
              <>
                {/* User Info */}
                <div className="hidden sm:flex items-center gap-3">
                  {user.images?.[0]?.url ? (
                    <img
                      src={user.images[0].url}
                      alt={user.display_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-spotify-green/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-spotify-green/20 flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-spotify-green" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-white hidden lg:block">
                    {user.display_name}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/70 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                  aria-label="Cerrar sesión"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              {mobileMenuOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiList className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiInfo className="h-5 w-5" />
                Acerca de
              </Link>
              <div className="flex items-center gap-3 px-4 py-3 text-white/70">
                <FiHeart className="h-5 w-5 text-spotify-green" />
                {favorites.length} canciones favoritas
              </div>
              {user && (
                <div className="flex items-center gap-3 px-4 py-3 text-white/70 border-t border-white/10 mt-2">
                  {user.images?.[0]?.url ? (
                    <img
                      src={user.images[0].url}
                      alt={user.display_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-spotify-green/20 flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-spotify-green" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {user.display_name}
                  </span>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

