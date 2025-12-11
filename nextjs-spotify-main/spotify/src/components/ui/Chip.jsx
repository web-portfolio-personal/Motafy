'use client';

import { FiX } from 'react-icons/fi';

export default function Chip({
  children,
  selected = false,
  removable = false,
  onRemove,
  onClick,
  icon,
  size = 'md',
  className = ''
}) {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseStyles = `inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 ${sizes[size]}`;

  const selectedStyles = selected
    ? 'bg-spotify-green text-black'
    : 'bg-white/10 text-white hover:bg-white/20';

  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <span
      onClick={onClick}
      className={`${baseStyles} ${selectedStyles} ${clickableStyles} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/20 transition-colors"
        >
          <FiX className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

