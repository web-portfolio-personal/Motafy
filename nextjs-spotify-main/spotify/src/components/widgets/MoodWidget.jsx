'use client';

import { FiSmile, FiZap, FiHeart, FiHeadphones, FiVolume2 } from 'react-icons/fi';
import Slider from '@/components/ui/Slider';

const MOOD_PRESETS = [
  {
    name: 'Feliz',
    emoji: '😊',
    values: { energy: 75, valence: 85, danceability: 70, acousticness: 30 }
  },
  {
    name: 'Triste',
    emoji: '😢',
    values: { energy: 30, valence: 20, danceability: 35, acousticness: 65 }
  },
  {
    name: 'Energético',
    emoji: '⚡',
    values: { energy: 95, valence: 70, danceability: 85, acousticness: 15 }
  },
  {
    name: 'Relajado',
    emoji: '😌',
    values: { energy: 25, valence: 50, danceability: 30, acousticness: 75 }
  },
  {
    name: 'Fiesta',
    emoji: '🎉',
    values: { energy: 90, valence: 80, danceability: 95, acousticness: 10 }
  },
  {
    name: 'Focus',
    emoji: '🎯',
    values: { energy: 40, valence: 45, danceability: 40, acousticness: 55 }
  },
];

export default function MoodWidget({
  mood = { energy: 50, valence: 50, danceability: 50, acousticness: 50 },
  onSelect
}) {
  const handleSliderChange = (key, value) => {
    onSelect?.({ ...mood, [key]: value });
  };

  const applyPreset = (preset) => {
    onSelect?.(preset.values);
  };

  return (
    <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 rounded-2xl p-5 border border-pink-500/20 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
          <FiSmile className="h-5 w-5 text-pink-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Mood</h3>
          <p className="text-xs text-white/50">Define el ambiente de la música</p>
        </div>
      </div>

      {/* Presets de mood */}
      <div className="flex flex-wrap gap-2 mb-5">
        {MOOD_PRESETS.map(preset => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium text-white transition-all hover:scale-105"
          >
            <span>{preset.emoji}</span>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiZap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-white">Energía</span>
          </div>
          <Slider
            value={mood.energy}
            onChange={(value) => handleSliderChange('energy', value)}
            labelLeft="Calmado"
            labelRight="Energético"
            showValue
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiHeart className="h-4 w-4 text-red-400" />
            <span className="text-sm text-white">Positividad</span>
          </div>
          <Slider
            value={mood.valence}
            onChange={(value) => handleSliderChange('valence', value)}
            labelLeft="Melancólico"
            labelRight="Alegre"
            showValue
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiHeadphones className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-white">Bailabilidad</span>
          </div>
          <Slider
            value={mood.danceability}
            onChange={(value) => handleSliderChange('danceability', value)}
            labelLeft="Para escuchar"
            labelRight="Para bailar"
            showValue
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiVolume2 className="h-4 w-4 text-green-400" />
            <span className="text-sm text-white">Acústico</span>
          </div>
          <Slider
            value={mood.acousticness}
            onChange={(value) => handleSliderChange('acousticness', value)}
            labelLeft="Electrónico"
            labelRight="Acústico"
            showValue
          />
        </div>
      </div>
    </div>
  );
}

