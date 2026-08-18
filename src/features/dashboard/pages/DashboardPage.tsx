import React, { useState, useEffect } from 'react';
import { Users, FileText, UserPlus, Flag, MapPin, RefreshCw, Smartphone, MonitorSmartphone, TabletSmartphone, Search } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';

const DashboardStatCard = ({ title, value, subtitle, icon: Icon, iconColor, onClick }: any) => {
  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 cursor-pointer hover:bg-slate-800/60 hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 outline-none"
    >
      <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
        <span>{title}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <p className={`text-[10px] font-medium ${iconColor}`}>{subtitle}</p>
    </div>
  )
}

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
      adminRepo.getRequests({ page: 1, pageSize: 3 }),
      adminRepo.getRecentUsers(3),
      adminRepo.getRecentDevices(3)
    ]).then(([statsData, reqsData, usersData, devicesData]) => {
      setStats(statsData);
      setRecentRequests(reqsData.requests);
      setRecentUsers(usersData);
      setRecentDevices(devicesData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> {AppStrings.Dashboard.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Dashboard.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Dashboard.subtitle}</p>
      </div>

      {/* USER METRICS GRID */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{AppStrings.Dashboard.sections.userAnalytics}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.users.title} 
            value={stats.users.total} 
            subtitle={AppStrings.Dashboard.cards.users.subtext}
            icon={Users} 
            iconColor="text-emerald-400" 
            onClick={() => navigate('/users')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.activeUsers.title} 
            value={stats.users.active} 
            subtitle={AppStrings.Dashboard.cards.activeUsers.subtext}
            icon={Users} 
            iconColor="text-emerald-500" 
            onClick={() => navigate('/users?status=active')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.suspendedUsers.title} 
            value={stats.users.suspended} 
            subtitle={AppStrings.Dashboard.cards.suspendedUsers.subtext}
            icon={Users} 
            iconColor="text-amber-400" 
            onClick={() => navigate('/users?status=suspended')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.bannedUsers.title} 
            value={stats.users.banned} 
            subtitle={AppStrings.Dashboard.cards.bannedUsers.subtext}
            icon={Users} 
            iconColor="text-rose-400" 
            onClick={() => navigate('/users?status=banned')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.deletedUsers.title} 
            value={stats.users.deleted} 
            subtitle={AppStrings.Dashboard.cards.deletedUsers.subtext}
            icon={Users} 
            iconColor="text-slate-400" 
            onClick={() => navigate('/users?deleted=true')}
          />
        </div>
      </div>

      {/* PLATFORM METRICS GRID */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{AppStrings.Dashboard.sections.activityAnalytics}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.requests.title} 
            value={stats.requests.total} 
            subtitle={`${stats.requests.active} ${AppStrings.Dashboard.cards.requests.subtext}`}
            icon={FileText} 
            iconColor="text-cyan-400" 
            onClick={() => navigate('/requests')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.joinRequests.title} 
            value={stats.joinRequests.pending} 
            subtitle={AppStrings.Dashboard.cards.joinRequests.subtext}
            icon={UserPlus} 
            iconColor="text-amber-400" 
            onClick={() => navigate('/join-requests?status=pending')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.devices.title} 
            value={stats.devices.total} 
            subtitle={AppStrings.Dashboard.cards.devices.subtext}
            icon={Smartphone} 
            iconColor="text-indigo-400" 
            onClick={() => navigate('/devices')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.androidDevices.title} 
            value={stats.devices.android} 
            subtitle={AppStrings.Dashboard.cards.androidDevices.subtext}
            icon={TabletSmartphone} 
            iconColor="text-emerald-400" 
            onClick={() => navigate('/devices?platform=Android')}
          />
          <DashboardStatCard 
            title={AppStrings.Dashboard.cards.iosDevices.title} 
            value={stats.devices.ios} 
            subtitle={AppStrings.Dashboard.cards.iosDevices.subtext}
            icon={MonitorSmartphone} 
            iconColor="text-slate-300" 
            onClick={() => navigate('/devices?platform=iOS')}
          />
        </div>
      </div>

      {/* SECONDARY METRICS: RECENT LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT USERS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">{AppStrings.Dashboard.sections.newRegistrations}</h3>
            <button onClick={() => navigate('/users')} className="text-[10px] font-bold text-emerald-400 hover:underline">{AppStrings.Dashboard.sections.viewAll}</button>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recentUsers.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">{AppStrings.Dashboard.sections.noRecentUsers}</p>
            )}
            {recentUsers.map((u: any) => (
              <div key={u.id} onClick={() => navigate(`/users/${u.id}`)} className="py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <img src={u.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-7 h-7 rounded-full bg-slate-800 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{u.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT REQUESTS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">{AppStrings.Dashboard.sections.recentPosts}</h3>
            <button onClick={() => navigate('/requests')} className="text-[10px] font-bold text-emerald-400 hover:underline">{AppStrings.Dashboard.sections.viewAll}</button>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recentRequests.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">{AppStrings.Dashboard.sections.noRecentPosts}</p>
            )}
            {recentRequests.map((r: any) => (
              <div key={r.id} onClick={() => navigate(`/requests/${r.id}`)} className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-xs font-semibold text-slate-200 truncate">{r.title}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{r.location}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT DEVICES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">{AppStrings.Dashboard.sections.recentDevices}</h3>
            <button onClick={() => navigate('/devices')} className="text-[10px] font-bold text-emerald-400 hover:underline">{AppStrings.Dashboard.sections.viewAll}</button>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recentDevices.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">{AppStrings.Dashboard.sections.noRecentDevices}</p>
            )}
            {recentDevices.map((d: any) => (
              <div key={d.id} onClick={() => navigate(`/users/${d.user_id}`)} className="py-2.5 flex flex-col justify-center cursor-pointer hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-200">{d.device_model}</p>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{d.platform}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{AppStrings.Dashboard.sections.userLabel}{d.user_name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
