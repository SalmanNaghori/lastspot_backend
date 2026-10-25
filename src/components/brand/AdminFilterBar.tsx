import React from 'react';

export interface FilterOption<T = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ElementType;
}

interface AdminFilterBarProps<T = string> {
  options: FilterOption<T>[];
  selected: T;
  onSelect: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function AdminFilterBar<T extends string = string>({
  options,
  selected,
  onSelect,
  className = '',
  size = 'md',
}: AdminFilterBarProps<T>) {
  const paddingClass = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm';

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] ${className}`}>
      {options.map((opt) => {
        const isActive = selected === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={String(opt.id)}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`flex items-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-all ${paddingClass} ${
              isActive
                ? 'bg-[#F46A35] text-white shadow-sm'
                : 'text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface)]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--kb-border)] text-[var(--kb-muted)]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
