import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Layers, Users, Smartphone, Settings, LogOut, Activity, Menu, X, FileText, UserPlus, Tag, Bell, History, Flag, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useToast } from '@/app/providers/ToastProvider'
import { AppStrings } from '@/core/constants/app_strings'

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    showToast('Logged out successfully.', 'info')
  }

  const sections = [
    {
      title: AppStrings.Navigation.groups.main,
      items: [
        { name: AppStrings.Navigation.items.dashboard, href: '/dashboard', icon: Layers },
        { name: AppStrings.Navigation.items.users, href: '/users', icon: Users },
        { name: AppStrings.Navigation.items.requests, href: '/requests', icon: FileText },
        { name: AppStrings.Navigation.items.joinRequests, href: '/join-requests', icon: UserPlus },
        { name: AppStrings.Navigation.items.categories, href: '/categories', icon: Tag },
      ]
    },
    {
      title: AppStrings.Navigation.groups.communication,
      items: [
        { name: AppStrings.Navigation.items.notifications, href: '/notifications', icon: Bell },
        { name: AppStrings.Navigation.items.notificationsHistory, href: '/notifications-history', icon: History },
      ]
    },
    {
      title: AppStrings.Navigation.groups.moderation,
      items: [
        { name: AppStrings.Navigation.items.reports, href: '/reports', icon: Flag },
      ]
    },
    {
      title: AppStrings.Navigation.groups.system,
      items: [
        { name: AppStrings.Navigation.items.devices, href: '/devices', icon: Smartphone },
        { name: 'Admin Roles', href: '/roles', icon: ShieldAlert },
        { name: AppStrings.Navigation.items.settings, href: '/app-settings', icon: Settings },
      ]
    }
  ]

  const NavContent = () => (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h3 className="px-4 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B1121] text-slate-100 font-sans antialiased selection:bg-emerald-500/30 flex-col md:flex-row">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 h-full overflow-y-auto border-r border-slate-800 bg-[#111827] pt-6 pb-4 space-y-8">
        
        {/* Brand */}
        <div className="flex items-center gap-3 px-6">
          <div className="w-10 h-10 rounded-xl bg-transparent border-2 border-emerald-500/80 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">{AppStrings.Navigation.brand}</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-0.5 font-bold">{AppStrings.Navigation.portalType}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <NavContent />
        </nav>

        {/* User + Logout (Bottom) */}
        <div className="px-6 mt-auto">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center font-bold text-emerald-500 text-xs shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.email || AppStrings.Navigation.adminFallbackName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title={AppStrings.Navigation.logout}
              className="p-2 shrink-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER ───────────────────────────────────────────────── */}
      <header className="md:hidden border-b border-slate-800 bg-[#111827] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border-2 border-emerald-500/80 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-extrabold text-sm text-white">{AppStrings.Navigation.brand}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── MOBILE DRAWER ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 pt-16 bg-[#111827] flex flex-col overflow-y-auto">
          <nav className="flex-1 py-6">
            <NavContent />
          </nav>
          <div className="p-4 border-t border-slate-800">
             <button
              onClick={() => { handleLogout(); setMobileOpen(false) }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-rose-500/10 text-rose-400 py-3 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" /> {AppStrings.Navigation.logout}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
