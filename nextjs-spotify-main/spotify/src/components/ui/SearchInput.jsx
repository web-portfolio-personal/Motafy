'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  loading = false,
  disabled = false,
  autoFocus = false,
  className = ''
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {loading ? (
          <FiLoader className="h-5 w-5 text-white/50 animate-spin" />
        ) : (
          <FiSearch className="h-5 w-5 text-white/50" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/10 border border-white/10 rounded-lg py-2.5 pl-10 pr-10
                 text-white placeholder-white/50
                 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200"
      />

      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

