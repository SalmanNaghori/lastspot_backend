import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { AuthProvider } from './app/providers/AuthProvider'
import { ToastProvider } from './app/providers/ToastProvider'

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <React.Suspense fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-[#0B1121] text-slate-100">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <p className="text-xs text-slate-400 font-semibold tracking-wider">KhelBhai Admin</p>
            </div>
          </div>
        }>
          <RouterProvider router={router} />
        </React.Suspense>
      </AuthProvider>
    </ToastProvider>
  )
}
