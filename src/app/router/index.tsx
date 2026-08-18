import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { UserDetailsPage } from '@/features/users/pages/UserDetailsPage'
import { DevicesPage } from '@/features/devices/pages/DevicesPage'
import { AppSettingsPage } from '@/features/settings/pages/AppSettingsPage'
import { AdminRolesPage } from '@/features/roles/pages/AdminRolesPage'

import { RequestsPage } from '@/features/requests/pages/RequestsPage'
import { RequestDetailsPage } from '@/features/requests/pages/RequestDetailsPage'
import { JoinRequestsPage } from '@/features/requests/pages/JoinRequestsPage'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { NotificationHistoryPage } from '@/features/notifications/pages/NotificationHistoryPage'
import { ReportsPage } from '@/features/moderation/pages/ReportsPage'

import { ProtectedRoute } from './ProtectedRoute'
import { AdminLayout } from '@/components/common/AdminLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/users/:id', element: <UserDetailsPage /> },
          
          { path: '/requests', element: <RequestsPage /> },
          { path: '/requests/:id', element: <RequestDetailsPage /> },
          { path: '/join-requests', element: <JoinRequestsPage /> },
          
          { path: '/categories', element: <CategoriesPage /> },
          
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/notifications-history', element: <NotificationHistoryPage /> },
          
          { path: '/reports', element: <ReportsPage /> },
          
          { path: '/devices', element: <DevicesPage /> },
          { path: '/roles', element: <AdminRolesPage /> },
          { path: '/app-settings', element: <AppSettingsPage /> },
        ]
      }
    ],
  },
])
