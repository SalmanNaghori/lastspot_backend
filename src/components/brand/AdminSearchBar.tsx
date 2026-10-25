import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  isLoading = false,
  className = '',
  autoFocus = false,
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative flex items-center min-w-[240px] ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-[var(--kb-muted)] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--kb-surface)] border border-[var(--kb-border)] text-[var(--kb-text)] placeholder-[var(--kb-muted)] transition-all focus:outline-none focus:border-[#F46A35] focus:ring-2 focus:ring-[#F46A35]/20 shadow-sm"
      />
      {isLoading ? (
        <Loader2 className="absolute right-3.5 w-4 h-4 text-[#F46A35] animate-spin" />
      ) : value ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-lg text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface-subtle)] transition-colors"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
};
