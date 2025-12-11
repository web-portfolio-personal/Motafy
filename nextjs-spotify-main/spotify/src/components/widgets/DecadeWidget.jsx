'use client';

import { FiCalendar } from 'react-icons/fi';
import Chip from '@/components/ui/Chip';

const DECADES = [
  { value: '1950', label: '1950s', emoji: '🎷' },
  { value: '1960', label: '1960s', emoji: '🎸' },
  { value: '1970', label: '1970s', emoji: '🕺' },
  { value: '1980', label: '1980s', emoji: '📼' },
  { value: '1990', label: '1990s', emoji: '💿' },
  { value: '2000', label: '2000s', emoji: '📱' },
  { value: '2010', label: '2010s', emoji: '🎧' },
  { value: '2020', label: '2020s', emoji: '🎤' },
];

export default function DecadeWidget({ selectedDecades = [], onSelect }) {
  const handleToggle = (decade) => {
    if (selectedDecades.includes(decade)) {
      onSelect?.(selectedDecades.filter(d => d !== decade));
    } else {
      onSelect?.([...selectedDecades, decade]);
    }
  };

  const selectAll = () => {
    onSelect?.(DECADES.map(d => d.value));
  };

  const clearAll = () => {
    onSelect?.([]);
  };

  return (
    <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 rounded-2xl p-5 border border-orange-500/20 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <FiCalendar className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Décadas</h3>
            <p className="text-xs text-white/50">Elige tus épocas favoritas</p>
          </div>
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={selectAll}
          className="text-xs text-white/60 hover:text-white transition-colors"
        >
          Seleccionar todas
        </button>
        <span className="text-white/30">|</span>
        <button
          onClick={clearAll}
          className="text-xs text-white/60 hover:text-white transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Grid de décadas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DECADES.map(decade => {
          const isSelected = selectedDecades.includes(decade.value);
          return (
            <button
              key={decade.value}
              onClick={() => handleToggle(decade.value)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl transition-all
                ${isSelected 
                  ? 'bg-spotify-green text-black scale-105' 
                  : 'bg-white/5 text-white hover:bg-white/10 hover:scale-102'
                }
              `}
            >
              <span className="text-xl mb-1">{decade.emoji}</span>
              <span className="text-sm font-medium">{decade.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contador */}
      <p className="text-xs text-white/40 mt-4 text-center">
        {selectedDecades.length} de {DECADES.length} décadas seleccionadas
      </p>
    </div>
  );
}

