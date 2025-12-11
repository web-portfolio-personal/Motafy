'use client';

import { useState, useRef, useEffect } from 'react';

export default function Slider({
  min = 0,
  max = 100,
  value = 50,
  onChange,
  label,
  labelLeft,
  labelRight,
  showValue = true,
  disabled = false,
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    onChange?.(newValue);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">{label}</span>
          {showValue && (
            <span className="text-sm text-white/70 bg-white/10 px-2 py-0.5 rounded">
              {value}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/20
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-spotify-green
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-transform
                   [&::-webkit-slider-thumb]:hover:scale-110
                   [&::-webkit-slider-thumb]:shadow-lg
                   [&::-moz-range-thumb]:w-4
                   [&::-moz-range-thumb]:h-4
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-spotify-green
                   [&::-moz-range-thumb]:border-0
                   [&::-moz-range-thumb]:cursor-pointer
                   disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${percentage}%, rgba(255,255,255,0.2) ${percentage}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
      </div>

      {(labelLeft || labelRight) && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/50">{labelLeft}</span>
          <span className="text-xs text-white/50">{labelRight}</span>
        </div>
      )}
    </div>
  );
}

