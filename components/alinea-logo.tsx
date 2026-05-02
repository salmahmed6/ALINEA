'use client';

/**
 * ALINEA Triangle Logo with Animation
 * The triangle represents the peak of aligned decision-making
 */
export function AlineaLogo({ className = '', animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} ${animated ? 'animate-float' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {/* Outer triangle */}
      <path d="M 32 8 L 56 56 L 8 56 Z" />
      
      {/* Inner circle at peak (the goal) */}
      <circle cx="32" cy="12" r="3" fill="currentColor" />
      
      {/* Vertical line through center (alignment) */}
      <line x1="32" y1="8" x2="32" y2="56" opacity="0.5" />
    </svg>
  );
}
