import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'

export const ProtectedRoute: React.FC = () => {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin') {
    // If authenticated but not an admin, we can show an unauthorized page or redirect
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">You do not have permission to access the Admin Panel.</p>
        <button 
          onClick={() => { /* sign out logic handles in component, or we provide a button here */ }}
          className="text-blue-500 hover:underline"
        >
           Please sign out and use an admin account.
        </button>
      </div>
    )
  }

  return <Outlet />
}
