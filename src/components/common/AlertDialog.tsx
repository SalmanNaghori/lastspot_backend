import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  icon?: React.ElementType;
  isLoading?: boolean;
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon: Icon = AlertTriangle,
  isLoading = false
}: AlertDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bgIcon: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
      confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500'
    },
    warning: {
      bgIcon: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
      confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500'
    },
    success: {
      bgIcon: 'bg-[#F46A35]/10 border-[#F46A35]/30 text-[#F46A35]',
      confirmBtn: 'bg-gradient-to-r from-[#F46A35] to-[#FFB45E] hover:opacity-95 text-white'
    },
    info: {
      bgIcon: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
      confirmBtn: 'bg-blue-600 hover:bg-blue-500 text-white'
    }
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl text-[var(--kb-text)] space-y-4 transform transition-all duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${style.bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-[var(--kb-text)] leading-tight">{title}</h3>
            <p className="text-xs text-[var(--kb-muted)] leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--kb-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-[var(--kb-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] border border-[var(--kb-border)] text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${style.confirmBtn}`}
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
