import React from 'react';

export type SportsIllustrationType = 
  | 'login_hero'
  | 'empty_users'
  | 'empty_activities'
  | 'empty_devices'
  | 'empty_notifications'
  | 'empty_reports'
  | 'empty_general';

interface SportsIllustrationProps {
  type: SportsIllustrationType;
  className?: string;
  size?: number | string;
}

export const SportsIllustration: React.FC<SportsIllustrationProps> = ({
  type,
  className = '',
  size = 180,
}) => {
  if (type === 'login_hero') {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 420 340"
          className="w-full max-w-[420px] drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hero-stadium-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFB45E" stop-opacity="0.35" />
              <stop offset="50%" stop-color="#F46A35" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#DC5425" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="hero-orange-3d" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFC078" />
              <stop offset="40%" stop-color="#F46A35" />
              <stop offset="100%" stop-color="#C2410C" />
            </linearGradient>
            <linearGradient id="hero-amber-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFE8B2" />
              <stop offset="50%" stop-color="#FFB45E" />
              <stop offset="100%" stop-color="#D97706" />
            </linearGradient>
            <linearGradient id="hero-wood-bat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F5D0A9" />
              <stop offset="60%" stop-color="#D99B5C" />
              <stop offset="100%" stop-color="#9C5A24" />
            </linearGradient>
            <linearGradient id="hero-leather-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FF6B6B" />
              <stop offset="50%" stop-color="#DC2626" />
              <stop offset="100%" stop-color="#7F1D1D" />
            </linearGradient>
            <radialGradient id="hero-ball-shine" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
              <stop offset="40%" stop-color="#F87171" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0.5" />
            </radialGradient>
            <filter id="hero-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#F46A35" flood-opacity="0.25" />
            </filter>
            <filter id="hero-ball-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.3" />
            </filter>
          </defs>

          {/* Background Ambient Aura */}
          <ellipse cx="210" cy="180" rx="180" ry="120" fill="url(#hero-stadium-glow)" />

          {/* Stadium Platform Rings */}
          <ellipse cx="210" cy="270" rx="160" ry="42" fill="#F46A35" fill-opacity="0.08" />
          <ellipse cx="210" cy="265" rx="135" ry="32" fill="#F46A35" fill-opacity="0.12" stroke="#FFB45E" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="6 4" />
          <ellipse cx="210" cy="260" rx="100" ry="22" fill="#F46A35" fill-opacity="0.18" />

          {/* Golden Sports Trophy (Center Back) */}
          <g filter="url(#hero-soft-shadow)">
            {/* Trophy Pedestal */}
            <rect x="188" y="195" width="44" height="18" rx="4" fill="#334155" />
            <rect x="194" y="185" width="32" height="12" rx="3" fill="#475569" />
            {/* Stem */}
            <path d="M205 185 L205 160 L215 160 L215 185 Z" fill="url(#hero-amber-gold)" />
            {/* Cup Body */}
            <path d="M182 105 C182 152 238 152 238 105 L238 95 L182 95 Z" fill="url(#hero-amber-gold)" />
            {/* Cup Handles */}
            <path d="M182 105 C164 105 164 135 185 135" stroke="url(#hero-amber-gold)" stroke-width="5" stroke-linecap="round" fill="none" />
            <path d="M238 105 C256 105 256 135 235 135" stroke="url(#hero-amber-gold)" stroke-width="5" stroke-linecap="round" fill="none" />
            {/* Trophy Star */}
            <polygon points="210,110 213,118 221,118 215,123 217,131 210,126 203,131 205,123 199,118 207,118" fill="#FFFFFF" />
          </g>

          {/* 3D Cricket Bat (Left Lean) */}
          <g transform="rotate(-28 140 220)" filter="url(#hero-ball-shadow)">
            {/* Grip handle */}
            <rect x="136" y="70" width="8" height="48" rx="4" fill="#F46A35" stroke="#FFFFFF" stroke-width="1.5" />
            <line x1="136" y1="80" x2="144" y2="80" stroke="#FFFFFF" stroke-width="1.5" />
            <line x1="136" y1="92" x2="144" y2="92" stroke="#FFFFFF" stroke-width="1.5" />
            <line x1="136" y1="104" x2="144" y2="104" stroke="#FFFFFF" stroke-width="1.5" />
            {/* Shoulder and Blade */}
            <path d="M134 116 C134 112 146 112 146 116 L148 225 C148 230 132 230 132 225 Z" fill="url(#hero-wood-bat)" />
            {/* Curved spine highlight */}
            <path d="M140 120 L140 226" stroke="#FFE4C7" stroke-width="2" stroke-linecap="round" />
            {/* Orange Brand Badge on Blade */}
            <rect x="134" y="145" width="12" height="24" rx="2" fill="#F46A35" />
          </g>

          {/* 3D Cricket Leather Ball (Front Left) */}
          <g transform="translate(105, 225)" filter="url(#hero-ball-shadow)">
            <circle cx="22" cy="22" r="20" fill="url(#hero-leather-red)" />
            <circle cx="22" cy="22" r="20" fill="url(#hero-ball-shine)" />
            {/* Cricket Seam with white cross stitches */}
            <path d="M7 14 C16 18 26 26 34 32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3" />
            <path d="M6 13 C15 17 25 25 33 31" stroke="#FEE2E2" stroke-width="1" stroke-linecap="round" />
          </g>

          {/* 3D Soccer Football (Center Right) */}
          <g transform="translate(255, 185)" filter="url(#hero-ball-shadow)">
            <circle cx="40" cy="40" r="36" fill="#F8FAFC" />
            <circle cx="40" cy="40" r="36" fill="url(#hero-ball-shine)" />
            {/* Classic 3D Pentagons with Orange Accents */}
            <polygon points="40,24 51,32 47,44 33,44 29,32" fill="#171D2A" />
            <polygon points="40,8 48,16 43,24 37,24 32,16" fill="#F46A35" />
            <polygon points="62,28 70,36 67,46 56,43 54,34" fill="#171D2A" />
            <polygon points="56,60 52,70 41,72 38,62 47,56" fill="#171D2A" />
            <polygon points="18,34 26,43 23,55 12,52 10,41" fill="#F46A35" />
            <polygon points="26,65 37,63 41,72 33,76 25,74" fill="#171D2A" />
            {/* Seams */}
            <line x1="40" y1="24" x2="40" y2="8" stroke="#94A3B8" stroke-width="1.5" />
            <line x1="51" y1="32" x2="62" y2="28" stroke="#94A3B8" stroke-width="1.5" />
            <line x1="47" y1="44" x2="47" y2="56" stroke="#94A3B8" stroke-width="1.5" />
            <line x1="33" y1="44" x2="26" y2="43" stroke="#94A3B8" stroke-width="1.5" />
            <line x1="29" y1="32" x2="18" y2="34" stroke="#94A3B8" stroke-width="1.5" />
          </g>

          {/* 3D Badminton Shuttlecock (Floating Right Top) */}
          <g transform="translate(295, 95) rotate(24 24 24)" filter="url(#hero-ball-shadow)">
            {/* Cork Base (Orange Rubber Cork) */}
            <circle cx="24" cy="42" r="8" fill="#F46A35" />
            <ellipse cx="24" cy="42" rx="7" ry="4" fill="#FFB45E" />
            {/* Feather Skirt Cone */}
            <path d="M10 14 L20 38 L28 38 L38 14 Z" fill="#F8FAFC" fill-opacity="0.9" stroke="#E2E8F0" stroke-width="1" />
            {/* Feather Ribs */}
            <line x1="14" y1="16" x2="21" y2="38" stroke="#CBD5E1" stroke-width="1.5" />
            <line x1="20" y1="14" x2="23" y2="38" stroke="#CBD5E1" stroke-width="1.5" />
            <line x1="28" y1="14" x2="25" y2="38" stroke="#CBD5E1" stroke-width="1.5" />
            <line x1="34" y1="16" x2="27" y2="38" stroke="#CBD5E1" stroke-width="1.5" />
            {/* Skirt Threads */}
            <path d="M12 20 Q24 24 36 20" stroke="#F46A35" stroke-width="1.5" fill="none" />
            <path d="M15 28 Q24 31 33 28" stroke="#FFB45E" stroke-width="1.5" fill="none" />
          </g>

          {/* Dynamic Energy Sparks / Activity Particles */}
          <circle cx="85" cy="140" r="3" fill="#FFB45E" />
          <circle cx="160" cy="70" r="4" fill="#F46A35" />
          <circle cx="340" cy="170" r="3.5" fill="#FFB45E" />
          <polygon points="360,80 363,88 371,88 365,93 367,101 360,96 353,101 355,93 349,88 357,88" fill="#F46A35" />
          <polygon points="80,195 82,201 88,201 83,205 85,211 80,207 75,211 77,205 72,201 78,201" fill="#FFB45E" />
        </svg>
      </div>
    );
  }

  if (type === 'empty_users') {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
        <defs>
          <linearGradient id="eu-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFB45E" />
            <stop offset="100%" stop-color="#F46A35" />
          </linearGradient>
          <radialGradient id="eu-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F46A35" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#F46A35" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="70" fill="url(#eu-bg)" />
        <circle cx="80" cy="80" r="54" fill="var(--kb-surface)" stroke="var(--kb-border)" stroke-width="2" />
        {/* User Jersey Emblem */}
        <circle cx="80" cy="58" r="16" fill="url(#eu-grad)" />
        <path d="M52 104 C52 86 64 82 80 82 C96 82 108 86 108 104" fill="url(#eu-grad)" />
        {/* Star Badge */}
        <polygon points="80,50 82,55 87,55 83,58 85,63 80,60 75,63 77,58 73,55 78,55" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === 'empty_activities') {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
        <defs>
          <linearGradient id="ea-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFB45E" />
            <stop offset="100%" stop-color="#F46A35" />
          </linearGradient>
          <radialGradient id="ea-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F46A35" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#F46A35" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="70" fill="url(#ea-bg)" />
        <circle cx="80" cy="80" r="54" fill="var(--kb-surface)" stroke="var(--kb-border)" stroke-width="2" />
        {/* Playground / Cricket & Football Composite */}
        <ellipse cx="80" cy="105" rx="36" ry="12" fill="#F46A35" fill-opacity="0.15" />
        {/* Cricket Wickets */}
        <rect x="62" y="55" width="4" height="42" rx="2" fill="#D99B5C" />
        <rect x="70" y="55" width="4" height="42" rx="2" fill="#D99B5C" />
        <rect x="78" y="55" width="4" height="42" rx="2" fill="#D99B5C" />
        <rect x="60" y="52" width="24" height="3" rx="1.5" fill="#D99B5C" />
        {/* Football */}
        <circle cx="98" cy="86" r="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
        <polygon points="98,78 103,83 100,89 95,89 93,83" fill="#F46A35" />
      </svg>
    );
  }

  if (type === 'empty_devices') {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
        <defs>
          <linearGradient id="ed-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFB45E" />
            <stop offset="100%" stop-color="#F46A35" />
          </linearGradient>
          <radialGradient id="ed-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F46A35" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#F46A35" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="70" fill="url(#ed-bg)" />
        <circle cx="80" cy="80" r="54" fill="var(--kb-surface)" stroke="var(--kb-border)" stroke-width="2" />
        {/* Phone Frame */}
        <rect x="62" y="44" width="36" height="66" rx="8" fill="#171D2A" stroke="url(#ed-grad)" stroke-width="2.5" />
        <rect x="67" y="54" width="26" height="44" rx="3" fill="var(--kb-bg)" />
        {/* Device Pulse */}
        <path d="M72 76 L76 76 L78 70 L82 82 L85 76 L89 76" stroke="#F46A35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="80" cy="104" r="2.5" fill="#94A3B8" />
      </svg>
    );
  }

  if (type === 'empty_notifications') {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
        <defs>
          <linearGradient id="en-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFB45E" />
            <stop offset="100%" stop-color="#F46A35" />
          </linearGradient>
          <radialGradient id="en-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F46A35" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#F46A35" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="70" fill="url(#en-bg)" />
        <circle cx="80" cy="80" r="54" fill="var(--kb-surface)" stroke="var(--kb-border)" stroke-width="2" />
        {/* Sports Megaphone / Bell */}
        <path d="M60 74 L78 64 L78 96 L60 86 Z" fill="url(#en-grad)" />
        <rect x="52" y="74" width="10" height="12" rx="2" fill="#171D2A" />
        <path d="M78 68 C88 68 96 74 96 80 C96 86 88 92 78 92" stroke="#FFB45E" stroke-width="2.5" stroke-linecap="round" fill="none" />
        {/* Sound Waves */}
        <path d="M102 70 C108 73 112 76 112 80 C112 84 108 87 102 90" stroke="#F46A35" stroke-width="2" stroke-linecap="round" fill="none" />
      </svg>
    );
  }

  if (type === 'empty_reports') {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
        <defs>
          <linearGradient id="er-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34D399" />
            <stop offset="100%" stop-color="#059669" />
          </linearGradient>
          <radialGradient id="er-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#10B981" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#10B981" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="70" fill="url(#er-bg)" />
        <circle cx="80" cy="80" r="54" fill="var(--kb-surface)" stroke="var(--kb-border)" stroke-width="2" />
        {/* Clean Fair Play Shield */}
        <path d="M80 48 L104 58 C104 82 92 98 80 108 C68 98 56 82 56 58 Z" fill="url(#er-grad)" />
        <path d="M72 78 L78 84 L90 70" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    );
  }

  // Default empty_general
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
      <defs>
        <linearGradient id="eg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFB45E" />
          <stop offset="100%" stop-color="#F46A35" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="54" fill="var(--kb-surface)" stroke="var(--kb-border)" stroke-width="2" />
      <polygon points="80,50 87,68 106,68 91,79 96,98 80,86 64,98 69,79 54,68 73,68" fill="url(#eg-grad)" />
    </svg>
  );
};
