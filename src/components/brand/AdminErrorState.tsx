import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface AdminErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  diagnosticId?: string;
  className?: string;
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title = 'Failed to load data',
  message,
  onRetry,
  onBack,
  diagnosticId,
  className = '',
}) => {
  return (
    <div className={`p-8 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-rose-500" />
      </div>

      <h3 className="text-base font-bold text-[var(--kb-text)] mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium mb-4 max-w-md">
        {message}
      </p>

      {diagnosticId && (
        <p className="text-[10px] font-mono text-[var(--kb-muted)] mb-5 bg-[var(--kb-surface-subtle)] px-2.5 py-1 rounded-md border border-[var(--kb-border)]">
          Ref ID: {diagnosticId}
        </p>
      )}

      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[var(--kb-border)] bg-[var(--kb-surface)] text-[var(--kb-text)] hover:bg-[var(--kb-surface-subtle)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
