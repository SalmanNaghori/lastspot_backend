import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { AuthProvider } from './app/providers/AuthProvider'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
