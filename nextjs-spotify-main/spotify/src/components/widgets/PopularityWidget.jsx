'use client';

import { FiTrendingUp, FiStar, FiEye, FiEyeOff } from 'react-icons/fi';
import Slider from '@/components/ui/Slider';

const POPULARITY_PRESETS = [
  {
    name: 'Top Hits',
    icon: FiStar,
    description: 'Los más escuchados',
    values: { min: 70, max: 100 },
    color: 'text-yellow-400'
  },
  {
    name: 'Popular',
    icon: FiTrendingUp,
    description: 'Canciones conocidas',
    values: { min: 40, max: 70 },
    color: 'text-green-400'
  },
  {
    name: 'Underground',
    icon: FiEyeOff,
    description: 'Joyas ocultas',
    values: { min: 0, max: 40 },
    color: 'text-purple-400'
  },
  {
    name: 'Todo',
    icon: FiEye,
    description: 'Sin restricciones',
    values: { min: 0, max: 100 },
    color: 'text-white'
  },
];

export default function PopularityWidget({
  popularity = { min: 0, max: 100 },
  onSelect
}) {
  const handleMinChange = (value) => {
    onSelect?.({ ...popularity, min: Math.min(value, popularity.max) });
  };

  const handleMaxChange = (value) => {
    onSelect?.({ ...popularity, max: Math.max(value, popularity.min) });
  };

  const applyPreset = (preset) => {
    onSelect?.(preset.values);
  };

  const getPopularityLabel = () => {
    const { min, max } = popularity;
    if (min >= 70) return 'Top Hits';
    if (max <= 40) return 'Underground';
    if (min >= 40 && max <= 70) return 'Popular';
    return 'Mixto';
  };

  return (
    <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-2xl p-5 border border-yellow-500/20 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
          <FiTrendingUp className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Popularidad</h3>
          <p className="text-xs text-white/50">¿Hits o joyas ocultas?</p>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {POPULARITY_PRESETS.map(preset => {
          const Icon = preset.icon;
          const isActive = popularity.min === preset.values.min && popularity.max === preset.values.max;
          return (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`
                flex flex-col items-center p-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-spotify-green text-black' 
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-black' : preset.color}`} />
              <span className="text-xs font-medium">{preset.name}</span>
              <span className="text-[10px] opacity-60">{preset.description}</span>
            </button>
          );
        })}
      </div>

      {/* Rango personalizado */}
      <div className="space-y-4 p-4 bg-white/5 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Rango personalizado</span>
          <span className="text-sm font-medium text-spotify-green">{getPopularityLabel()}</span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Mínimo: {popularity.min}</span>
          </div>
          <Slider
            value={popularity.min}
            onChange={handleMinChange}
            min={0}
            max={100}
            showValue={false}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Máximo: {popularity.max}</span>
          </div>
          <Slider
            value={popularity.max}
            onChange={handleMaxChange}
            min={0}
            max={100}
            showValue={false}
          />
        </div>

        {/* Visualización del rango */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-purple-500 via-green-500 to-yellow-500"
            style={{
              left: `${popularity.min}%`,
              width: `${popularity.max - popularity.min}%`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40">
          <span>Underground</span>
          <span>Mainstream</span>
        </div>
      </div>
    </div>
  );
}

