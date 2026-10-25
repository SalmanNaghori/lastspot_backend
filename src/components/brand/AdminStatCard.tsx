import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#F46A35]',
  badge,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative group bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-2xl p-5 transition-all duration-200 ${
        isClickable 
          ? 'cursor-pointer hover:border-[#F46A35]/50 hover:shadow-lg hover:shadow-[#F46A35]/5 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#F46A35]/40' 
          : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--kb-muted)] truncate">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-extrabold text-[var(--kb-text)] tracking-tight">
          {value ?? 0}
        </div>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F46A35]/15 text-[#F46A35] border border-[#F46A35]/30">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs font-medium text-[var(--kb-muted)] mt-1.5 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
