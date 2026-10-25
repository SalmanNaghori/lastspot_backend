import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/components/brand/AdminSidebar';
import { AdminHeader } from '@/components/brand/AdminHeader';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Derive route title for header
  const getRouteTitle = (path: string): string => {
    if (path.startsWith('/users')) return 'Users';
    if (path.startsWith('/requests')) return 'Activity Posts';
    if (path.startsWith('/join-requests')) return 'Join Applications';
    if (path.startsWith('/categories')) return 'Categories';
    if (path.startsWith('/notifications-history')) return 'Notification History';
    if (path.startsWith('/notifications')) return 'Send Notifications';
    if (path.startsWith('/reports')) return 'Reports & Flagged';
    if (path.startsWith('/devices')) return 'Connected Devices';
    if (path.startsWith('/roles')) return 'Admin Roles';
    if (path.startsWith('/cities')) return 'Cities';
    if (path.startsWith('/app-settings')) return 'App Settings';
    return 'Control Center';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--kb-bg)] text-[var(--kb-text)] font-sans antialiased flex-col md:flex-row transition-colors">
      {/* Branded Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Sticky Header with Theme Switcher and User Info */}
        <AdminHeader
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          title={getRouteTitle(location.pathname)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[350px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-3 border-[#F46A35]/20 border-t-[#F46A35] animate-spin" />
                    <p className="text-xs text-[var(--kb-muted)] font-bold tracking-wider uppercase">
                      Loading KhelBhai Control Center...
                    </p>
                  </div>
                </div>
              }
            >
              <Outlet />
            </React.Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};
