import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { useRBAC, type Permission } from '@/app/providers/useRBAC'

const routePermissions: Record<string, Permission> = {
  '/dashboard': 'view_dashboard',
  '/users': 'manage_users',
  '/requests': 'manage_activities',
  '/join-requests': 'manage_join_requests',
  '/categories': 'manage_categories',
  '/cities': 'manage_cities',
  '/reports': 'manage_reports',
  '/notifications': 'manage_notifications',
  '/notifications-history': 'manage_notifications',
  '/devices': 'manage_devices',
  '/roles': 'manage_admin_roles',
  '/app-settings': 'manage_settings'
};

const getRequiredPermission = (pathname: string): Permission | null => {
  for (const [route, perm] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      return perm;
    }
  }
  return null;
}

export const ProtectedRoute: React.FC = () => {
  const { session, loading, signOut } = useAuth()
  const { role, can } = useRBAC()
  const location = useLocation()

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

  if (role !== 'super_admin' && role !== 'admin' && role !== 'moderator') {
    // If authenticated but not an admin at all
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">You do not have permission to access the Admin Panel.</p>
        <button 
          onClick={async () => { await signOut(); window.location.href = '/login'; }}
          className="text-blue-500 hover:underline"
        >
           Please sign out and use an admin account.
        </button>
      </div>
    )
  }

  const requiredPerm = getRequiredPermission(location.pathname);
  if (requiredPerm && !can(requiredPerm)) {
    // Redirect unauthorized admins to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />
}
