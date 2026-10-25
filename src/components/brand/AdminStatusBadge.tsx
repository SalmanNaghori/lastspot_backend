import React from 'react';

export type StatusBadgeVariant = 
  | 'active'
  | 'suspended'
  | 'banned'
  | 'deleted'
  | 'open'
  | 'closed'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'resolved'
  | 'dismissed'
  | 'admin'
  | 'super_admin'
  | 'moderator'
  | 'user'
  | 'neutral';

interface AdminStatusBadgeProps {
  status: string | StatusBadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const normalized = (status || '').toString().toLowerCase().trim();

  let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  let dotColor = 'bg-slate-400';

  if (['active', 'enabled', 'verified', 'success'].includes(normalized)) {
    styles = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-500';
  } else if (['open', 'published'].includes(normalized)) {
    styles = 'bg-[#F46A35]/15 text-[#DC5425] dark:text-[#FF8A58] border-[#F46A35]/30';
    dotColor = 'bg-[#F46A35]';
  } else if (['suspended', 'pending', 'awaiting', 'warning'].includes(normalized)) {
    styles = 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-500';
  } else if (['banned', 'rejected', 'failed', 'error', 'danger'].includes(normalized)) {
    styles = 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-500';
  } else if (['deleted', 'soft_deleted'].includes(normalized)) {
    styles = 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    dotColor = 'bg-slate-400';
  } else if (['resolved', 'closed', 'completed'].includes(normalized)) {
    styles = 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30';
    dotColor = 'bg-teal-500';
  } else if (['admin', 'super_admin'].includes(normalized)) {
    styles = 'bg-[#F46A35]/15 text-[#C2410C] dark:text-[#FF8A58] border-[#F46A35]/40 font-bold';
    dotColor = 'bg-[#F46A35]';
  } else if (['moderator'].includes(normalized)) {
    styles = 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold';
    dotColor = 'bg-amber-500';
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const displayLabel = label || normalized.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide capitalize ${paddingClass} ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{displayLabel}</span>
    </span>
  );
};
