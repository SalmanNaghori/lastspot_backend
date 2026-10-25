import React from 'react';

interface AdminFormFieldProps {
  label: string;
  error?: string | null;
  helperText?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminFormField: React.FC<AdminFormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  htmlFor,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-xs sm:text-sm font-bold text-[var(--kb-text)]"
      >
        {label}
        {required && <span className="text-[#F46A35] ml-1">*</span>}
      </label>

      {children}

      {error ? (
        <p className="text-xs text-rose-500 font-medium tracking-wide mt-1 animate-fade-in">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[var(--kb-muted)] mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
