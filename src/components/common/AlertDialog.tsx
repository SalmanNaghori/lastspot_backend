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
      bgIcon: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500'
    },
    warning: {
      bgIcon: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500'
    },
    success: {
      bgIcon: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500'
    },
    info: {
      bgIcon: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      confirmBtn: 'bg-cyan-600 hover:bg-cyan-500 text-white focus:ring-cyan-500'
    }
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4 transform transition-all duration-300 animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ${style.bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-slate-100 leading-tight">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${style.confirmBtn}`}
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
