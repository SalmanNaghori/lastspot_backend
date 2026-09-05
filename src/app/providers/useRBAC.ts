import { useAuth } from './AuthProvider';
import type { UserRole } from '@/features/auth/types';

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_activities'
  | 'manage_join_requests'
  | 'manage_reports'
  | 'manage_chat'
  | 'manage_cities'
  | 'manage_categories'
  | 'manage_notifications'
  | 'manage_devices'
  | 'manage_settings'
  | 'manage_admin_roles';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'view_dashboard', 'manage_users', 'manage_activities', 'manage_join_requests',
    'manage_reports', 'manage_chat', 'manage_cities', 'manage_categories',
    'manage_notifications', 'manage_devices', 'manage_settings', 'manage_admin_roles'
  ],
  admin: [
    'view_dashboard', 'manage_users', 'manage_activities', 'manage_join_requests',
    'manage_reports', 'manage_chat', 'manage_cities', 'manage_categories',
    'manage_notifications', 'manage_devices'
  ],
  moderator: [
    'view_dashboard', 'manage_users', 'manage_activities', 'manage_join_requests',
    'manage_reports', 'manage_chat', 'manage_devices'
  ],
  user: []
};

export const useRBAC = () => {
  const { role, user } = useAuth();
  
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';

  const can = (permission: Permission): boolean => {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  };

  return {
    user,
    role,
    isSuperAdmin,
    isAdmin,
    isModerator,
    can
  };
};
