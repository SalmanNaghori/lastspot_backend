import React from 'react';
import { AdminLoadingSkeleton } from './AdminLoadingSkeleton';
import { AdminEmptyState } from './AdminEmptyState';
import type { SportsIllustrationType } from './SportsIllustration';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyType?: SportsIllustrationType;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  className?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display matching your criteria.',
  emptyType = 'empty_general',
  emptyAction,
  pagination,
  onRowClick,
  className = '',
}: AdminDataTableProps<T>) {
  if (loading) {
    return <AdminLoadingSkeleton variant="table" rows={6} columns={columns.length} className={className} />;
  }

  if (!data || data.length === 0) {
    return (
      <AdminEmptyState
        type={emptyType}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={`w-full rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] overflow-hidden shadow-sm flex flex-col ${className}`}>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--kb-border)] bg-[var(--kb-surface-subtle)] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--kb-muted)]">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 sm:px-6 py-3.5 ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--kb-border)]/60 text-xs sm:text-sm text-[var(--kb-text)]">
            {data.map((row, rowIdx) => {
              const rowKey = keyExtractor(row, rowIdx);
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    isClickable
                      ? 'cursor-pointer hover:bg-[#F46A35]/5 dark:hover:bg-[#F46A35]/10'
                      : 'hover:bg-[var(--kb-surface-subtle)]/50'
                  }`}
                >
                  {columns.map((col, colIdx) => {
                    let cellContent: React.ReactNode = null;
                    if (typeof col.accessor === 'function') {
                      cellContent = col.accessor(row);
                    } else if (col.accessor) {
                      cellContent = row[col.accessor] as any;
                    }

                    return (
                      <td key={colIdx} className={`px-4 sm:px-6 py-4 align-middle ${col.className || ''}`}>
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-[var(--kb-border)] bg-[var(--kb-surface-subtle)]/50 text-xs text-[var(--kb-muted)]">
          <div>
            Showing{' '}
            <span className="font-bold text-[var(--kb-text)]">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[var(--kb-text)]">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </span>{' '}
            of{' '}
            <span className="font-bold text-[var(--kb-text)]">
              {pagination.totalItems}
            </span>{' '}
            results
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="p-1.5 rounded-lg border border-[var(--kb-border)] bg-[var(--kb-surface)] text-[var(--kb-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--kb-surface-subtle)] transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-[var(--kb-text)] px-2">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="p-1.5 rounded-lg border border-[var(--kb-border)] bg-[var(--kb-surface)] text-[var(--kb-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--kb-surface-subtle)] transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
