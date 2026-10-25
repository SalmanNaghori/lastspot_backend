import React from 'react';
import { SportsIllustration, type SportsIllustrationType } from './SportsIllustration';

interface AdminEmptyStateProps {
  type?: SportsIllustrationType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  className?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  type = 'empty_general',
  title,
  description,
  action,
  className = '',
}) => {
  const ActionIcon = action?.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] ${className}`}>
      <div className="mb-4">
        <SportsIllustration type={type} size={140} />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[var(--kb-text)] tracking-tight mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-[var(--kb-muted)] max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};
