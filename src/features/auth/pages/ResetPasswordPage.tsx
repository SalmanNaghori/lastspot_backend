import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/core/supabase/client';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { KhelBhaiLogo } from '@/components/brand/KhelBhaiLogo';
import { AdminThemeToggle } from '@/components/brand/AdminThemeToggle';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      showToast('Invalid or expired recovery link. Please try again.', 'error');
      navigate('/forgot-password');
    }
  }, [session, loading, navigate, showToast]);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast(AppStrings.Auth.errors.passwordShort, 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast(AppStrings.Auth.resetPassword.passwordMatchError, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      showToast(AppStrings.Auth.resetPassword.success, 'success');
      navigate('/login', { replace: true });
      await supabase.auth.signOut();
    } catch (err: any) {
      showToast(err.message || AppStrings.Auth.errors.unexpected, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--kb-bg)]">
        <Loader2 className="w-8 h-8 text-[#F46A35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between font-sans bg-[var(--kb-bg)] text-[var(--kb-text)] px-4 transition-colors">
      <header className="w-full flex items-center justify-between px-6 py-5 z-20">
        <KhelBhaiLogo size="md" badgeText="SECURITY" />
        <AdminThemeToggle variant="segmented" />
      </header>

      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-[460px] bg-[var(--kb-surface)] rounded-3xl border border-[var(--kb-border)] p-6 sm:p-10 shadow-xl shadow-[#F46A35]/5 space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-black text-[var(--kb-text)] tracking-tight">
              {AppStrings.Auth.resetPassword.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--kb-muted)]">
              {AppStrings.Auth.resetPassword.subtitle}
            </p>
          </div>

          <form onSubmit={handleReset} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--kb-text)]">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-3 pr-11 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35] focus:ring-2 focus:ring-[#F46A35]/20 transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--kb-muted)] hover:text-[var(--kb-text)] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--kb-text)]">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmitting}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-3 pr-11 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35] focus:ring-2 focus:ring-[#F46A35]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-lg shadow-[#F46A35]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                AppStrings.Auth.resetPassword.submitBtn
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-[var(--kb-muted)]">
        &copy; {new Date().getFullYear()} KhelBhai Sports
      </footer>
    </div>
  );
};
