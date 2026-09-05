import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/core/supabase/client'
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import { AppStrings } from '@/core/constants/app_strings'
import { useToast } from '@/app/providers/ToastProvider'
import { useAuth } from '@/app/providers/AuthProvider'

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { session, loading } = useAuth()

  // Wait for the session to be established from the recovery link
  useEffect(() => {
    if (!loading && !session) {
      // If no session exists, the recovery link is invalid or expired
      showToast('Invalid or expired recovery link. Please try again.', 'error')
      navigate('/forgot-password')
    }
  }, [session, loading, navigate, showToast])

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (password.length < 6) {
      showToast(AppStrings.Auth.errors.passwordShort, 'error')
      return
    }

    if (password !== confirmPassword) {
      showToast(AppStrings.Auth.resetPassword.passwordMatchError, 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      showToast(AppStrings.Auth.resetPassword.success, 'success')
      navigate('/login', { replace: true })
      
      // Optionally sign out after reset so they have to log in with new credentials
      await supabase.auth.signOut()
    } catch (err: any) {
      showToast(err.message || AppStrings.Auth.errors.unexpected, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1121]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-[#0B1121] text-slate-100 px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#0B1121] border border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center mb-6">
          <Shield className="w-6 h-6 text-emerald-400 stroke-[1.5]" />
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-2">
          {AppStrings.Auth.resetPassword.title}
        </h1>
        <p className="text-[#8B95A5] text-[15px] text-center max-w-sm">
          {AppStrings.Auth.resetPassword.subtitle}
        </p>
      </div>

      <div className="w-full max-w-[440px] bg-[#151C2C] rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <form onSubmit={handleReset} noValidate className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                disabled={isSubmitting}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full bg-[#050B14] border border-slate-800 focus:border-slate-600 rounded-xl px-4 py-3.5 pr-12 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors text-[15px] tracking-widest"
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full bg-[#050B14] border border-slate-800 focus:border-slate-600 rounded-xl px-4 py-3.5 pr-12 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors text-[15px] tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password || !confirmPassword}
            className="w-full py-4 mt-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              AppStrings.Auth.resetPassword.submitBtn
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
