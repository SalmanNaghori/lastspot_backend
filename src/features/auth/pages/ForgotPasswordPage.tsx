import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/core/supabase/client'
import { Loader2, Shield, ArrowLeft } from 'lucide-react'
import { AppStrings } from '@/core/constants/app_strings'
import { useToast } from '@/app/providers/ToastProvider'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) {
      showToast(AppStrings.Auth.errors.emailRequired, 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const resetUrl = `${window.location.origin}${import.meta.env.BASE_URL}reset-password`
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      })

      if (error) throw error

      showToast(AppStrings.Auth.forgotPassword.success, 'success')
      // Clear the form
      setEmail('')
    } catch (err: any) {
      showToast(err.message || AppStrings.Auth.errors.unexpected, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-[#0B1121] text-slate-100 px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#0B1121] border border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center mb-6">
          <Shield className="w-6 h-6 text-emerald-400 stroke-[1.5]" />
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-2">
          {AppStrings.Auth.forgotPassword.title}
        </h1>
        <p className="text-[#8B95A5] text-[15px] text-center max-w-sm">
          {AppStrings.Auth.forgotPassword.subtitle}
        </p>
      </div>

      <div className="w-full max-w-[440px] bg-[#151C2C] rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <form onSubmit={handleReset} noValidate className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">{AppStrings.Auth.adminEmailLabel}</label>
            <input
              type="email"
              autoFocus
              required
              disabled={isSubmitting}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={AppStrings.Auth.emailPlaceholder}
              className={`w-full bg-[#050B14] border border-slate-800 focus:border-slate-600 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors text-[15px]`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-4 mt-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              AppStrings.Auth.forgotPassword.submitBtn
            )}
          </button>
          
          <div className="flex justify-center mt-6">
            <Link 
              to="/login" 
              className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {AppStrings.Auth.forgotPassword.backToLogin}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
