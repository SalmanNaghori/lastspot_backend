import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/core/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { KhelBhaiLogo } from '@/components/brand/KhelBhaiLogo';
import { SportsIllustration } from '@/components/brand/SportsIllustration';
import { AdminThemeToggle } from '@/components/brand/AdminThemeToggle';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validateEmail = (value: string): string | null => {
  if (!value) return AppStrings.Auth.errors.emailRequired;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return AppStrings.Auth.errors.emailInvalid;
  return null;
};

const validatePassword = (value: string): string | null => {
  if (!value) return AppStrings.Auth.errors.passwordRequired;
  if (value.length < 6) return AppStrings.Auth.errors.passwordShort;
  return null;
};

const friendlyAuthError = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
    return AppStrings.Auth.errors.invalidCredentials;
  }
  return message || AppStrings.Auth.errors.unexpected;
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [rememberMe, setRememberMe] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate]);

  const handleEmailBlur = () => {
    setTouched((t) => ({ ...t, email: true }));
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setTouched((t) => ({ ...t, password: true }));
    setPasswordError(validatePassword(password));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setTouched({ email: true, password: true });

    if (emailErr || passwordErr) return;

    setIsSubmitting(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const userId = signInData.user?.id;
      if (!userId) throw new Error('Authentication failed. No user ID returned.');

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError || !roleData || !['super_admin', 'admin', 'moderator'].includes(roleData.role)) {
        await supabase.auth.signOut();
        showToast('Access Denied: Your account does not have Admin or Moderator privileges.', 'error');
        return;
      }

      // Persistent Session Storage Handling based on "Remember Me"
      const sessionPayload = {
        user: signInData.user,
        role: roleData.role,
        rememberMe,
      };

      if (rememberMe) {
        localStorage.setItem('khelbhai_admin_session', JSON.stringify(sessionPayload));
        sessionStorage.removeItem('khelbhai_admin_session');
        localStorage.removeItem('activity_admin_session');
        sessionStorage.removeItem('activity_admin_session');
      } else {
        sessionStorage.setItem('khelbhai_admin_session', JSON.stringify(sessionPayload));
        localStorage.removeItem('khelbhai_admin_session');
        localStorage.removeItem('activity_admin_session');
        sessionStorage.removeItem('activity_admin_session');
      }

      showToast(`Welcome back, ${signInData.user.user_metadata?.full_name || 'Admin'}!`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      showToast(`Access Denied: ${friendlyAuthError(err.message || '')}`, 'error');
      setError(friendlyAuthError(err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between font-sans bg-[var(--kb-bg)] text-[var(--kb-text)] transition-colors relative overflow-x-hidden">
      {/* Top Header with Brand Logo & Theme Toggle */}
      <header className="w-full flex items-center justify-between px-6 py-5 z-20">
        <KhelBhaiLogo size="md" badgeText="CONTROL CENTER" />
        <AdminThemeToggle variant="segmented" />
      </header>

      {/* Main Centered Authentication Stage */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: 3D Sports Brand Artwork & Platform Value */}
          <div className="hidden lg:flex lg:col-span-6 flex-col items-center text-center space-y-4">
            <SportsIllustration type="login_hero" size={380} />
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--kb-text)]">
                Sports & Community Management
              </h2>
              <p className="text-sm text-[var(--kb-muted)] leading-relaxed">
                Coordinate activities, verify players, manage tournament feeds, and broadcast real-time sports announcements across Android & iOS devices.
              </p>
            </div>
          </div>

          {/* Right Column: Branded Login Form Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[460px] bg-[var(--kb-surface)] rounded-3xl border border-[var(--kb-border)] p-6 sm:p-10 shadow-xl shadow-[#F46A35]/5 space-y-7">
              
              {/* Card Header */}
              <div className="space-y-1.5">
                <div className="lg:hidden mb-4">
                  <KhelBhaiLogo size="lg" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--kb-text)] tracking-tight">
                  Admin Sign In
                </h1>
                <p className="text-xs sm:text-sm text-[var(--kb-muted)]">
                  Enter your authorized backoffice credentials to continue.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} noValidate className="space-y-5">
                
                {/* Email Field */}
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) setEmailError(validateEmail(e.target.value));
                    }}
                    onBlur={handleEmailBlur}
                    placeholder={AppStrings.Auth.emailPlaceholder}
                    className={`w-full bg-[var(--kb-surface-subtle)] border ${
                      emailError && touched.email ? 'border-rose-500' : 'border-[var(--kb-border)]'
                    } rounded-xl px-4 py-3 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35] focus:ring-2 focus:ring-[#F46A35]/20 transition-all`}
                  />
                  {emailError && touched.email && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--kb-text)]">
                    {AppStrings.Auth.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isSubmitting}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (touched.password) setPasswordError(validatePassword(e.target.value));
                      }}
                      onBlur={handlePasswordBlur}
                      placeholder="••••••••••••"
                      className={`w-full bg-[var(--kb-surface-subtle)] border ${
                        passwordError && touched.password ? 'border-rose-500' : 'border-[var(--kb-border)]'
                      } rounded-xl px-4 py-3 pr-11 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35] focus:ring-2 focus:ring-[#F46A35]/20 transition-all`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--kb-muted)] hover:text-[var(--kb-text)] transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && touched.password && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-[var(--kb-text)] cursor-pointer select-none font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--kb-border)] text-[#F46A35] accent-[#F46A35] focus:ring-[#F46A35]"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[#F46A35] hover:text-[#DC5425] font-bold transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-lg shadow-[#F46A35]/25 hover:shadow-xl hover:shadow-[#F46A35]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{AppStrings.Auth.signingIn}</span>
                    </>
                  ) : (
                    <span>{AppStrings.Auth.signInButton}</span>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[var(--kb-muted)]">
        &copy; {new Date().getFullYear()} KhelBhai Sports. All rights reserved.
      </footer>
    </div>
  );
};
