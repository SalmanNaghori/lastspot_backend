import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/core/supabase/client'
import { useAuth } from '@/app/providers/AuthProvider'
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { AppStrings } from '@/core/constants/app_strings'
import { useToast } from '@/app/providers/ToastProvider'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validateEmail = (value: string): string | null => {
  if (!value) return AppStrings.Auth.errors.emailRequired
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return AppStrings.Auth.errors.emailInvalid
  return null
}

const validatePassword = (value: string): string | null => {
  if (!value) return AppStrings.Auth.errors.passwordRequired
  if (value.length < 6) return AppStrings.Auth.errors.passwordShort
  return null
}

const friendlyAuthError = (message: string): string => {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
    return AppStrings.Auth.errors.invalidCredentials
  }
  return message || AppStrings.Auth.errors.unexpected
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [rememberMe, setRememberMe] = useState(true)

  const { showToast } = useToast()

  const navigate = useNavigate()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, loading, navigate])

  const handleEmailBlur = () => {
    setTouched(t => ({ ...t, email: true }))
    setEmailError(validateEmail(email))
  }

  const handlePasswordBlur = () => {
    setTouched(t => ({ ...t, password: true }))
    setPasswordError(validatePassword(password))
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(passwordErr)
    setTouched({ email: true, password: true })

    if (emailErr || passwordErr) return

    setIsSubmitting(true)
    
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      const userId = signInData.user?.id
      if (!userId) throw new Error('Authentication failed. No user ID returned.')

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (roleError || !roleData || !['admin', 'moderator'].includes(roleData.role)) {
        await supabase.auth.signOut()
        showToast('Access Denied: Your account does not have Admin or Moderator privileges.', 'error')
        return
      }

      // 3. Persistent Session Storage Handling based on "Remember Me"
      const sessionPayload = {
        user: signInData.user,
        role: roleData.role,
        rememberMe
      }

      if (rememberMe) {
        localStorage.setItem('activity_admin_session', JSON.stringify(sessionPayload))
        sessionStorage.removeItem('activity_admin_session')
      } else {
        sessionStorage.setItem('activity_admin_session', JSON.stringify(sessionPayload))
        localStorage.removeItem('activity_admin_session')
      }

      showToast(`Welcome back, ${signInData.user.user_metadata?.full_name || 'Admin'}!`, 'success')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      showToast(`Access Denied: ${friendlyAuthError(err.message || '')}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-[#0B1121] text-slate-100 px-4">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#0B1121] border border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center mb-6">
          <Shield className="w-6 h-6 text-emerald-400 stroke-[1.5]" />
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-2">
          {AppStrings.Auth.title}
        </h1>
        <p className="text-[#8B95A5] text-[15px]">
          {AppStrings.Auth.subtitle}
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[440px] bg-[#151C2C] rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <form onSubmit={handleLogin} noValidate className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">{AppStrings.Auth.adminEmailLabel}</label>
            <input
              type="email"
              autoFocus
              required
              disabled={isSubmitting}
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (touched.email) setEmailError(validateEmail(e.target.value))
              }}
              onBlur={handleEmailBlur}
              placeholder={AppStrings.Auth.emailPlaceholder}
              className={`w-full bg-[#050B14] border ${
                emailError && touched.email ? 'border-rose-500' : 'border-slate-800 focus:border-slate-600'
              } rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors text-[15px]`}
            />
            {emailError && touched.email && (
              <p className="text-xs text-rose-400 mt-1.5">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">{AppStrings.Auth.passwordLabel}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (touched.password) setPasswordError(validatePassword(e.target.value))
                }}
                onBlur={handlePasswordBlur}
                placeholder="••••••••••"
                className={`w-full bg-[#050B14] border ${
                  passwordError && touched.password ? 'border-rose-500' : 'border-slate-800 focus:border-slate-600'
                } rounded-xl px-4 py-3.5 pr-12 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors text-[15px] tracking-widest`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
            {passwordError && touched.password && (
              <p className="text-xs text-rose-400 mt-1.5">{passwordError}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#050B14] border-slate-800 text-emerald-500 accent-emerald-500"
              />
              <span>Remember me</span>
            </label>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2">
              <p className="text-sm text-rose-400 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              AppStrings.Auth.signInButton
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
