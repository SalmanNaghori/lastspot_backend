import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Layers, Users, Smartphone, Settings, LogOut, FileText, 
  UserPlus, Tag, Bell, History, Flag, ShieldAlert, MapPin, X
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRBAC } from '@/app/providers/useRBAC';
import { useToast } from '@/app/providers/ToastProvider';
import { AppStrings } from '@/core/constants/app_strings';
import { KhelBhaiLogo } from './KhelBhaiLogo';
import { AdminStatusBadge } from './AdminStatusBadge';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, signOut } = useAuth();
  const { can, role } = useRBAC();
  const { showToast } = useToast();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    showToast('Logged out of KhelBhai Admin successfully.', 'info');
  };

  const sections = [
    {
      title: AppStrings.Navigation.groups.main,
      items: [
        { name: AppStrings.Navigation.items.dashboard, href: '/dashboard', icon: Layers, permission: 'view_dashboard' },
        { name: AppStrings.Navigation.items.users, href: '/users', icon: Users, permission: 'manage_users' },
        { name: AppStrings.Navigation.items.requests, href: '/requests', icon: FileText, permission: 'manage_activities' },
        { name: AppStrings.Navigation.items.joinRequests, href: '/join-requests', icon: UserPlus, permission: 'manage_join_requests' },
        { name: AppStrings.Navigation.items.categories, href: '/categories', icon: Tag, permission: 'manage_categories' },
      ],
    },
    {
      title: AppStrings.Navigation.groups.communication,
      items: [
        { name: AppStrings.Navigation.items.notifications, href: '/notifications', icon: Bell, permission: 'manage_notifications' },
        { name: AppStrings.Navigation.items.notificationsHistory, href: '/notifications-history', icon: History, permission: 'manage_notifications' },
      ],
    },
    {
      title: AppStrings.Navigation.groups.moderation,
      items: [
        { name: AppStrings.Navigation.items.reports, href: '/reports', icon: Flag, permission: 'manage_reports' },
      ],
    },
    {
      title: AppStrings.Navigation.groups.system,
      items: [
        { name: AppStrings.Navigation.items.devices, href: '/devices', icon: Smartphone, permission: 'manage_devices' },
        { name: 'Admin Roles', href: '/roles', icon: ShieldAlert, permission: 'manage_admin_roles' },
        { name: AppStrings.Navigation.items.cities, href: '/cities', icon: MapPin, permission: 'manage_cities' },
        { name: AppStrings.Navigation.items.settings, href: '/app-settings', icon: Settings, permission: 'manage_settings' },
      ],
    },
  ]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => can(item.permission as any)),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--kb-surface)] border-r border-[var(--kb-border)] select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--kb-border)]">
        <Link to="/dashboard" onClick={onCloseMobile} className="focus:outline-none">
          <KhelBhaiLogo size="md" badgeText="V2" />
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface-subtle)]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-[var(--kb-muted)]/80">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#F46A35]/12 text-[#F46A35] font-bold shadow-sm border border-[#F46A35]/30'
                        : 'text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-[#F46A35]' : 'text-[var(--kb-muted)] group-hover:text-[var(--kb-text)]'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F46A35] shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer User Info & Controls */}
      <div className="p-3 border-t border-[var(--kb-border)] bg-[var(--kb-surface-subtle)]/40">
        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-[var(--kb-surface)] border border-[var(--kb-border)] flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F46A35]/15 border border-[#F46A35]/30 flex items-center justify-center font-bold text-[#F46A35] text-xs shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--kb-text)] truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Administrator'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <AdminStatusBadge status={role || 'admin'} size="sm" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={AppStrings.Navigation.logout}
            className="p-1.5 rounded-lg text-[var(--kb-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
