import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, UserPlus, Smartphone, MonitorSmartphone, TabletSmartphone, 
  ArrowRight, Activity
} from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';
import { 
  AdminPageHeader, AdminStatCard, AdminLoadingSkeleton, 
  AdminStatusBadge 
} from '@/components/brand';

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentDevices, setRecentDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      adminRepo.getDashboardStats(),
      adminRepo.getRecentRequests(5),
      adminRepo.getRecentUsers(5),
      adminRepo.getRecentDevices(5),
    ]).then(([statsData, reqsData, usersData, devicesData]) => {
      setStats(statsData);
      setRecentRequests(reqsData);
      setRecentUsers(usersData);
      setRecentDevices(devicesData);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title={AppStrings.Dashboard.title}
          subtitle={AppStrings.Dashboard.subtitle}
        />
        <AdminLoadingSkeleton variant="cards" />
        <AdminLoadingSkeleton variant="table" rows={4} columns={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <AdminPageHeader
        title={AppStrings.Dashboard.title}
        subtitle={AppStrings.Dashboard.subtitle}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F46A35]/12 border border-[#F46A35]/30 text-[#F46A35] text-xs font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Platform</span>
          </span>
        }
      />

      {/* USER METRICS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-[var(--kb-muted)]">
            {AppStrings.Dashboard.sections.userAnalytics}
          </h2>
          <button
            onClick={() => navigate('/users')}
            className="text-xs font-bold text-[#F46A35] hover:text-[#DC5425] flex items-center gap-1 transition-colors"
          >
            <span>Manage All Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard
            title={AppStrings.Dashboard.cards.users.title}
            value={stats.users.total}
            subtitle={AppStrings.Dashboard.cards.users.subtext}
            icon={Users}
            iconColor="text-[#F46A35]"
            onClick={() => navigate('/users')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.activeUsers.title}
            value={stats.users.active}
            subtitle={AppStrings.Dashboard.cards.activeUsers.subtext}
            icon={Users}
            iconColor="text-emerald-500"
            onClick={() => navigate('/users?status=active')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.suspendedUsers.title}
            value={stats.users.suspended}
            subtitle={AppStrings.Dashboard.cards.suspendedUsers.subtext}
            icon={Users}
            iconColor="text-amber-500"
            onClick={() => navigate('/users?status=suspended')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.bannedUsers.title}
            value={stats.users.banned}
            subtitle={AppStrings.Dashboard.cards.bannedUsers.subtext}
            icon={Users}
            iconColor="text-rose-500"
            onClick={() => navigate('/users?status=banned')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.deletedUsers.title}
            value={stats.users.deleted}
            subtitle={AppStrings.Dashboard.cards.deletedUsers.subtext}
            icon={Users}
            iconColor="text-slate-400"
            onClick={() => navigate('/users?deleted=true')}
          />
        </div>
      </section>

      {/* PLATFORM & ACTIVITY METRICS */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-[var(--kb-muted)]">
          {AppStrings.Dashboard.sections.activityAnalytics}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <AdminStatCard
            title={AppStrings.Dashboard.cards.requests.title}
            value={stats.requests.total}
            subtitle={`${stats.requests.active} Open`}
            icon={FileText}
            iconColor="text-[#F46A35]"
            onClick={() => navigate('/requests')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.joinRequests.title}
            value={stats.joinRequests.pending}
            subtitle="Awaiting Review"
            icon={UserPlus}
            iconColor="text-amber-500"
            onClick={() => navigate('/join-requests?status=pending')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.devices.title}
            value={stats.devices.total}
            subtitle="Registered"
            icon={Smartphone}
            iconColor="text-indigo-500"
            onClick={() => navigate('/devices')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.androidDevices.title}
            value={stats.devices.android}
            subtitle="Android Active"
            icon={TabletSmartphone}
            iconColor="text-emerald-500"
            onClick={() => navigate('/devices?platform=Android')}
          />
          <AdminStatCard
            title={AppStrings.Dashboard.cards.iosDevices.title}
            value={stats.devices.ios}
            subtitle="iOS Active"
            icon={MonitorSmartphone}
            iconColor="text-sky-500"
            onClick={() => navigate('/devices?platform=iOS')}
          />
          <AdminStatCard
            title="Web Platforms"
            value={stats.devices.web}
            subtitle="Web Active"
            icon={MonitorSmartphone}
            iconColor="text-violet-500"
            onClick={() => navigate('/devices?platform=Web')}
          />
        </div>
      </section>

      {/* RECENT ACTIVITY FEEDS (3-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT USERS */}
        <div className="rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--kb-border)]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--kb-text)]">
                {AppStrings.Dashboard.sections.newRegistrations}
              </h3>
              <button
                onClick={() => navigate('/users')}
                className="text-[11px] font-bold text-[#F46A35] hover:underline"
              >
                {AppStrings.Dashboard.sections.viewAll}
              </button>
            </div>

            <div className="divide-y divide-[var(--kb-border)]/50 pt-1">
              {recentUsers.length === 0 ? (
                <p className="text-xs text-[var(--kb-muted)] py-6 text-center">
                  {AppStrings.Dashboard.sections.noRecentUsers}
                </p>
              ) : (
                recentUsers.map((u: any) => (
                  <div
                    key={u.id}
                    onClick={() => navigate(`/users/${u.id}`)}
                    className="py-3 flex items-center gap-3 cursor-pointer hover:bg-[var(--kb-surface-subtle)] px-2 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center font-bold text-xs text-[#F46A35] shrink-0">
                      {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--kb-text)] truncate">
                        {u.full_name || u.email || 'Unknown User'}
                      </p>
                      <p className="text-[11px] text-[var(--kb-muted)] truncate">
                        {u.email || 'No email provided'}
                      </p>
                    </div>
                    <AdminStatusBadge status={u.status || 'active'} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY POSTS */}
        <div className="rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--kb-border)]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--kb-text)]">
                {AppStrings.Dashboard.sections.recentPosts}
              </h3>
              <button
                onClick={() => navigate('/requests')}
                className="text-[11px] font-bold text-[#F46A35] hover:underline"
              >
                {AppStrings.Dashboard.sections.viewAll}
              </button>
            </div>

            <div className="divide-y divide-[var(--kb-border)]/50 pt-1">
              {recentRequests.length === 0 ? (
                <p className="text-xs text-[var(--kb-muted)] py-6 text-center">
                  {AppStrings.Dashboard.sections.noRecentPosts}
                </p>
              ) : (
                recentRequests.map((r: any) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/requests/${r.id}`)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--kb-surface-subtle)] px-2 rounded-xl transition-colors gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--kb-text)] truncate">
                        {r.categories?.icon && <span className="mr-1">{r.categories.icon}</span>}
                        {r.title || 'Untitled Activity Post'}
                      </p>
                      <p className="text-[11px] text-[var(--kb-muted)] truncate mt-0.5">
                        {r.location_name || 'Venue TBD'} • {r.profiles?.full_name || 'Member'}
                      </p>
                    </div>
                    <AdminStatusBadge status={r.status || 'open'} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RECENT DEVICES */}
        <div className="rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--kb-border)]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--kb-text)]">
                {AppStrings.Dashboard.sections.recentDevices}
              </h3>
              <button
                onClick={() => navigate('/devices')}
                className="text-[11px] font-bold text-[#F46A35] hover:underline"
              >
                {AppStrings.Dashboard.sections.viewAll}
              </button>
            </div>

            <div className="divide-y divide-[var(--kb-border)]/50 pt-1">
              {recentDevices.length === 0 ? (
                <p className="text-xs text-[var(--kb-muted)] py-6 text-center">
                  {AppStrings.Dashboard.sections.noRecentDevices}
                </p>
              ) : (
                recentDevices.map((d: any) => (
                  <div
                    key={d.id}
                    onClick={() => navigate(`/users/${d.user_id}`)}
                    className="py-3 flex flex-col justify-center cursor-pointer hover:bg-[var(--kb-surface-subtle)] px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[var(--kb-text)] truncate">
                        {d.device_model || 'Unknown Device'}
                      </p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] text-[var(--kb-text)]">
                        {d.platform || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--kb-muted)] truncate mt-1">
                      {AppStrings.Dashboard.sections.userLabel}
                      <span className="font-semibold text-[var(--kb-text)]">
                        {d.profiles?.full_name || d.profiles?.email || d.user_id?.substring(0, 8)}
                      </span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
