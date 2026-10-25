import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/app/providers/ThemeProvider';

interface AdminThemeToggleProps {
  className?: string;
  variant?: 'segmented' | 'dropdown' | 'icon-only';
}

export const AdminThemeToggle: React.FC<AdminThemeToggleProps> = ({
  className = '',
  variant = 'segmented',
}) => {
  const { theme, setTheme } = useTheme();

  const options: Array<{ mode: ThemeMode; label: string; icon: React.ElementType }> = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Laptop },
  ];

  if (variant === 'icon-only') {
    const nextMode: ThemeMode = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    const CurrentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

    return (
      <button
        onClick={() => setTheme(nextMode)}
        title={`Current: ${theme} theme. Click to switch.`}
        className={`p-2 rounded-xl border border-[var(--kb-border)] bg-[var(--kb-surface)] text-[var(--kb-muted)] hover:text-[#F46A35] hover:border-[#F46A35]/40 transition-colors ${className}`}
        aria-label="Toggle Theme"
      >
        <CurrentIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div 
      className={`inline-flex items-center p-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] ${className}`}
      role="group"
      aria-label="Theme selection"
    >
      {options.map(({ mode, label, icon: Icon }) => {
        const isActive = theme === mode;
        return (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#F46A35] text-white shadow-sm'
                : 'text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface)]'
            }`}
            title={`Switch to ${label} mode`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
