import React from 'react';
import { Check, XCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export function ToastNotification({ message, type = 'success' }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all duration-300 animate-toast-slide ${
        type === 'error'
          ? 'bg-rose-950/90 text-rose-200 border-rose-800/80 shadow-rose-950/50'
          : type === 'warning'
          ? 'bg-amber-950/90 text-amber-200 border-amber-800/80 shadow-amber-950/50'
          : type === 'success'
          ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80 shadow-emerald-950/50'
          : 'bg-slate-900/90 text-slate-100 border-slate-700/80 shadow-slate-950/50'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
          type === 'error'
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            : type === 'warning'
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            : type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
        }`}
      >
        {type === 'error' ? (
          <XCircle className="w-4 h-4" />
        ) : type === 'warning' ? (
          <AlertTriangle className="w-4 h-4" />
        ) : type === 'success' ? (
          <Check className="w-4 h-4 stroke-[3]" />
        ) : (
          <Info className="w-4 h-4" />
        )}
      </div>
      <span className="pr-1 tracking-wide">{message}</span>
    </div>
  );
}
