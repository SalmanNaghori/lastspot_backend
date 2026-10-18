import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminLayout } from '@/components/common/AdminLayout'
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  UsersPage,
  UserDetailsPage,
  DevicesPage,
  AppSettingsPage,
  AdminRolesPage,
  RequestsPage,
  RequestDetailsPage,
  JoinRequestsPage,
  CategoriesPage,
  CitiesPage,
  NotificationsPage,
  NotificationHistoryPage,
  ReportsPage,
} from './lazyRoutes'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: '/reset-password',
      element: <ResetPasswordPage />,
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
            { path: '/cities', element: <CitiesPage /> },

            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/notifications-history', element: <NotificationHistoryPage /> },

            { path: '/reports', element: <ReportsPage /> },

            { path: '/devices', element: <DevicesPage /> },
            { path: '/roles', element: <AdminRolesPage /> },
            { path: '/app-settings', element: <AppSettingsPage /> },
          ],
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
)