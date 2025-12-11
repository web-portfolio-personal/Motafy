'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

// Get initial theme from localStorage (client-side only)
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('motafy_theme') || 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize on mount - using layout effect pattern
  useEffect(() => {
    const savedTheme = getInitialTheme();
    setTheme(savedTheme);
    setMounted(true);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('motafy_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    });
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

