'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiMenu, FiX, FiMusic, FiUser, FiHeart, FiList, FiInfo, FiBarChart2, FiGift } from 'react-icons/fi';
import { usePlaylist } from '@/context/PlaylistContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { favorites } = usePlaylist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isActive = (path) => pathname === path;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: FiList },
    { href: '/favorites', label: 'Favoritos', icon: FiHeart, badge: favorites.length > 0 ? favorites.length : null },
    { href: '/wrapped', label: 'Wrapped', icon: FiGift, special: true },
    { href: '/stats', label: 'Stats', icon: FiBarChart2 },
    { href: '/about', label: 'Acerca de', icon: FiInfo },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <FiMusic className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)] hidden sm:block">
              Mota<span className="text-spotify-green">fy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-spotify-green text-black'
                      : link.special
                        ? 'text-[var(--foreground)] hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20'
                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-highlight)]'
                  }`}
                >
                  <link.icon className={`h-4 w-4 ${link.special && !isActive(link.href) ? 'text-purple-400' : ''}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                      isActive(link.href) ? 'bg-black/20 text-black' : 'bg-spotify-green/20 text-spotify-green'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                  {link.special && !isActive(link.href) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
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
          <div className="md:hidden py-4 border-t border-[var(--border-color)] animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-spotify-green text-black'
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-highlight)]'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                  {link.badge && (
                    <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive(link.href) ? 'bg-black/20' : 'bg-spotify-green/20 text-spotify-green'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              {user && (
                <div className="flex items-center gap-3 px-4 py-3 text-[var(--foreground-secondary)] border-t border-[var(--border-color)] mt-2 pt-4">
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
                  <span className="text-sm font-medium text-[var(--foreground)]">
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

