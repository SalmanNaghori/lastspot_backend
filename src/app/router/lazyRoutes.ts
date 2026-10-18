import { lazy } from 'react';

export const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
export const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
export const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
export const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
export const UsersPage = lazy(() => import('@/features/users/pages/UsersPage').then(m => ({ default: m.UsersPage })));
export const UserDetailsPage = lazy(() => import('@/features/users/pages/UserDetailsPage').then(m => ({ default: m.UserDetailsPage })));
export const DevicesPage = lazy(() => import('@/features/devices/pages/DevicesPage').then(m => ({ default: m.DevicesPage })));
export const AppSettingsPage = lazy(() => import('@/features/settings/pages/AppSettingsPage').then(m => ({ default: m.AppSettingsPage })));
export const AdminRolesPage = lazy(() => import('@/features/roles/pages/AdminRolesPage').then(m => ({ default: m.AdminRolesPage })));
export const RequestsPage = lazy(() => import('@/features/requests/pages/RequestsPage').then(m => ({ default: m.RequestsPage })));
export const RequestDetailsPage = lazy(() => import('@/features/requests/pages/RequestDetailsPage').then(m => ({ default: m.RequestDetailsPage })));
export const JoinRequestsPage = lazy(() => import('@/features/requests/pages/JoinRequestsPage').then(m => ({ default: m.JoinRequestsPage })));
export const CategoriesPage = lazy(() => import('@/features/categories/pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
export const CitiesPage = lazy(() => import('@/features/cities/pages/CitiesPage').then(m => ({ default: m.CitiesPage })));
export const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
export const NotificationHistoryPage = lazy(() => import('@/features/notifications/pages/NotificationHistoryPage').then(m => ({ default: m.NotificationHistoryPage })));
export const ReportsPage = lazy(() => import('@/features/moderation/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
