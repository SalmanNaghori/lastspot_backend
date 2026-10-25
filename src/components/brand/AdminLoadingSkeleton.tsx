import React from 'react';

interface AdminLoadingSkeletonProps {
  variant?: 'table' | 'cards' | 'detail' | 'list';
  rows?: number;
  columns?: number;
  className?: string;
}

export const AdminLoadingSkeleton: React.FC<AdminLoadingSkeletonProps> = ({
  variant = 'table',
  rows = 5,
  columns = 4,
  className = '',
}) => {
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-[var(--kb-surface-subtle)] rounded" />
              <div className="w-8 h-8 rounded-xl bg-[var(--kb-surface-subtle)]" />
            </div>
            <div className="h-7 w-20 bg-[var(--kb-surface-subtle)] rounded-lg" />
            <div className="h-2.5 w-32 bg-[var(--kb-surface-subtle)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="p-6 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--kb-surface-subtle)]" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-[var(--kb-surface-subtle)] rounded" />
              <div className="h-3 w-64 bg-[var(--kb-surface-subtle)] rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] animate-pulse space-y-3">
            <div className="h-4 w-32 bg-[var(--kb-surface-subtle)] rounded" />
            <div className="h-3 w-full bg-[var(--kb-surface-subtle)] rounded" />
            <div className="h-3 w-3/4 bg-[var(--kb-surface-subtle)] rounded" />
          </div>
          <div className="p-6 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] animate-pulse space-y-3">
            <div className="h-4 w-32 bg-[var(--kb-surface-subtle)] rounded" />
            <div className="h-3 w-full bg-[var(--kb-surface-subtle)] rounded" />
            <div className="h-3 w-3/4 bg-[var(--kb-surface-subtle)] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-[var(--kb-surface)] border border-[var(--kb-border)] animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-full bg-[var(--kb-surface-subtle)]" />
              <div className="space-y-1.5 flex-1 max-w-xs">
                <div className="h-3.5 w-full bg-[var(--kb-surface-subtle)] rounded" />
                <div className="h-2.5 w-2/3 bg-[var(--kb-surface-subtle)] rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-[var(--kb-surface-subtle)] rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Default: table skeleton
  return (
    <div className={`w-full rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] overflow-hidden shadow-sm ${className}`}>
      {/* Table Header */}
      <div className="p-4 border-b border-[var(--kb-border)] bg-[var(--kb-surface-subtle)] flex gap-4">
        {Array.from({ length: columns }).map((_, col) => (
          <div key={col} className="h-3.5 flex-1 bg-[var(--kb-border)] rounded animate-pulse" />
        ))}
      </div>
      {/* Table Body Rows */}
      <div className="divide-y divide-[var(--kb-border)]/50">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="p-4 flex gap-4 items-center animate-pulse">
            {Array.from({ length: columns }).map((_, col) => (
              <div
                key={col}
                className="h-3 flex-1 bg-[var(--kb-surface-subtle)] rounded"
                style={{ width: `${60 + ((row * 17 + col * 23) % 35)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
