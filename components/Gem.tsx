'use client';

import { GemType } from '@/types/game';

interface GemProps {
  type: GemType;
  isSelected: boolean;
  isMatched?: boolean;
  isInvalid?: boolean;
  onClick: () => void;
  size: number;
}

const GEM_COLORS: Record<GemType, { bg: string; shadow: string; gradient: string }> = {
  red: {
    bg: 'bg-red-500',
    shadow: 'shadow-red-500/50',
    gradient: 'from-red-400 to-red-600',
  },
  blue: {
    bg: 'bg-blue-500',
    shadow: 'shadow-blue-500/50',
    gradient: 'from-blue-400 to-blue-600',
  },
  green: {
    bg: 'bg-green-500',
    shadow: 'shadow-green-500/50',
    gradient: 'from-green-400 to-green-600',
  },
  yellow: {
    bg: 'bg-yellow-500',
    shadow: 'shadow-yellow-500/50',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  purple: {
    bg: 'bg-purple-500',
    shadow: 'shadow-purple-500/50',
    gradient: 'from-purple-400 to-purple-600',
  },
  orange: {
    bg: 'bg-orange-500',
    shadow: 'shadow-orange-500/50',
    gradient: 'from-orange-400 to-orange-600',
  },
};

const GEM_SHAPES: Record<GemType, string> = {
  red: '◆',
  blue: '●',
  green: '▲',
  yellow: '★',
  purple: '■',
  orange: '♦',
};

export default function Gem({ type, isSelected, isMatched, isInvalid, onClick, size }: GemProps) {
  const colors = GEM_COLORS[type];
  const shape = GEM_SHAPES[type];

  return (
    <button
      onClick={onClick}
      className={`
        relative transition-all duration-200 rounded-lg
        ${isMatched ? 'animate-pop opacity-0' : 'opacity-100'}
        ${isSelected ? 'scale-110 ring-4 ring-white' : 'scale-100'}
        ${isInvalid ? 'animate-shake ring-4 ring-red-500' : ''}
        hover:scale-105 active:scale-95
        bg-gradient-to-br ${colors.gradient}
        shadow-lg ${colors.shadow}
        no-select
      `}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-label={`${type} gem`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-white font-bold drop-shadow-lg"
          style={{ fontSize: `${size * 0.5}px` }}
        >
          {shape}
        </span>
      </div>

      {/* Shine effect */}
      <div className="absolute top-1 left-1 w-1/3 h-1/3 bg-white/30 rounded-full blur-sm" />
    </button>
  );
}
