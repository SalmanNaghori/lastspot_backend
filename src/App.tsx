import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { AuthProvider } from './app/providers/AuthProvider'
import { ToastProvider } from './app/providers/ToastProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <React.Suspense fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-[var(--kb-bg)] text-[var(--kb-text)]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-3 border-[#F46A35]/20 border-t-[#F46A35] animate-spin" />
                <p className="text-xs text-[var(--kb-muted)] font-bold tracking-wider uppercase">KhelBhai Admin</p>
              </div>
            </div>
          }>
            <RouterProvider router={router} />
          </React.Suspense>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
