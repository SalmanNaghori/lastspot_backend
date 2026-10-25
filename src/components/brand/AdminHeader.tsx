import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { KhelBhaiLogo } from './KhelBhaiLogo';
import { AdminThemeToggle } from './AdminThemeToggle';
import { useAuth } from '@/app/providers/AuthProvider';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileMenu,
  title,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-[var(--kb-surface)] border-b border-[var(--kb-border)] shadow-xs">
      {/* Mobile Branding and Hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface-subtle)] transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <KhelBhaiLogo size="sm" showBadge={false} />
      </div>

      {/* Desktop Context Title & Live Indicator */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Production Core Active</span>
        </div>
        {title && (
          <span className="text-xs font-semibold text-[var(--kb-muted)]">
            / {title}
          </span>
        )}
      </div>

      {/* Right Quick Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Theme Toggle */}
        <AdminThemeToggle variant="segmented" className="hidden sm:inline-flex" />
        <AdminThemeToggle variant="icon-only" className="sm:hidden" />

        {/* Admin Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] text-xs font-semibold text-[var(--kb-text)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F46A35]" />
          <span className="truncate max-w-[140px]">
            {user?.email?.split('@')[0] || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};
