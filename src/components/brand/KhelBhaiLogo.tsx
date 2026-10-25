import React from 'react';

interface KhelBhaiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  iconOnly?: boolean;
  className?: string;
}

export const KhelBhaiLogo: React.FC<KhelBhaiLogoProps> = ({
  size = 'md',
  showBadge = true,
  badgeText = 'ADMIN',
  iconOnly = false,
  className = '',
}) => {
  // Dimensions
  const iconSize = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  }[size];

  const fontSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const badgeFontSize = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-0.5',
    xl: 'text-xs px-3 py-1',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official 3D-Gradient Sports Icon Emblem */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-2xl shadow-md transition-transform hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg 
          viewBox="0 0 64 64" 
          width={iconSize} 
          height={iconSize} 
          className="w-full h-full drop-shadow-sm"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-kb-orange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFB45E" />
              <stop offset="50%" stop-color="#F46A35" />
              <stop offset="100%" stop-color="#DC5425" />
            </linearGradient>
            <linearGradient id="logo-kb-wing" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#F46A35" />
              <stop offset="100%" stop-color="#FFD8A8" />
            </linearGradient>
            <linearGradient id="logo-kb-bg-tile" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#242B38" />
              <stop offset="100%" stop-color="#141822" />
            </linearGradient>
            <filter id="logo-kb-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#F46A35" flood-opacity="0.35" />
            </filter>
          </defs>

          {/* Rounded Base Shield */}
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logo-kb-bg-tile)" stroke="#374151" stroke-width="1.5" />
          
          {/* Subtle Sports Energy Ring */}
          <circle cx="32" cy="32" r="22" stroke="#FFB45E" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="3 3" />

          {/* Kinetic 'K' Sports Athlete Pillar */}
          <rect x="18" y="15" width="7" height="34" rx="3.5" fill="url(#logo-kb-orange)" filter="url(#logo-kb-shadow)" />

          {/* Upper Ascent Wing */}
          <path 
            d="M25 31 L39 17 C40.5 15.5 43.5 16.5 43.5 18.8 L43.5 21.5 C43.5 22.8 42.8 24 41.5 25.2 L32 34 Z" 
            fill="url(#logo-kb-wing)" 
          />

          {/* Lower Sprint Wing */}
          <path 
            d="M26.5 32.5 L41.5 46.5 C42.8 47.8 45 47.2 45.2 45.2 L45.2 42.8 C45.2 41.5 44.5 40.2 43.5 39.2 L34.5 29.5 Z" 
            fill="url(#logo-kb-orange)" 
          />

          {/* Central Sports Spark */}
          <circle cx="36" cy="32" r="3.2" fill="#FFFFFF" />
          <circle cx="36" cy="32" r="1.8" fill="#F46A35" />
        </svg>
      </div>

      {/* Brand Typography */}
      {!iconOnly && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className={`font-black tracking-tight text-[var(--kb-text)] ${fontSize}`}>
              Khel
            </span>
            <span className={`font-black tracking-tight text-[#F46A35] ${fontSize}`}>
              Bhai
            </span>
          </div>

          {showBadge && (
            <span className={`font-mono font-bold tracking-wider rounded-md border border-[#F46A35]/30 bg-[#F46A35]/10 text-[#F46A35] uppercase ${badgeFontSize}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
