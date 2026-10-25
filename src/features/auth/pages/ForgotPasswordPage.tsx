import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/core/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { KhelBhaiLogo } from '@/components/brand/KhelBhaiLogo';
import { AdminThemeToggle } from '@/components/brand/AdminThemeToggle';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      showToast(AppStrings.Auth.errors.emailRequired, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const resetUrl = `${window.location.origin}${import.meta.env.BASE_URL}reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (error) throw error;

      showToast(AppStrings.Auth.forgotPassword.success, 'success');
      setEmail('');
    } catch (err: any) {
      showToast(err.message || AppStrings.Auth.errors.unexpected, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between font-sans bg-[var(--kb-bg)] text-[var(--kb-text)] px-4 transition-colors">
      <header className="w-full flex items-center justify-between px-6 py-5 z-20">
        <KhelBhaiLogo size="md" badgeText="RECOVERY" />
        <AdminThemeToggle variant="segmented" />
      </header>

      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-[460px] bg-[var(--kb-surface)] rounded-3xl border border-[var(--kb-border)] p-6 sm:p-10 shadow-xl shadow-[#F46A35]/5 space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-black text-[var(--kb-text)] tracking-tight">
              {AppStrings.Auth.forgotPassword.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--kb-muted)]">
              {AppStrings.Auth.forgotPassword.subtitle}
            </p>
          </div>

          <form onSubmit={handleReset} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--kb-text)]">
                {AppStrings.Auth.adminEmailLabel}
              </label>
              <input
                type="email"
                autoFocus
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={AppStrings.Auth.emailPlaceholder}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-3 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35] focus:ring-2 focus:ring-[#F46A35]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-lg shadow-[#F46A35]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                AppStrings.Auth.forgotPassword.submitBtn
              )}
            </button>

            <div className="flex justify-center pt-2">
              <Link
                to="/login"
                className="text-[#F46A35] hover:text-[#DC5425] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {AppStrings.Auth.forgotPassword.backToLogin}
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-[var(--kb-muted)]">
        &copy; {new Date().getFullYear()} KhelBhai Sports
      </footer>
    </div>
  );
};
