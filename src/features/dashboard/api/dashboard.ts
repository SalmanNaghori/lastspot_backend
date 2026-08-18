import { supabase } from '@/core/supabase/client'

export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  bannedUsers: number
  deletedUsers: number
  totalDevices: number
  androidDevices: number
  iosDevices: number
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // We can perform concurrent requests using Promise.all to fetch metrics

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: suspendedUsers },
    { count: bannedUsers },
    { count: deletedUsers },
    { count: totalDevices },
    { count: androidDevices },
    { count: iosDevices },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'suspended').is('deleted_at', null),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'banned').is('deleted_at', null),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).not('deleted_at', 'is', null),
    supabase.from('user_devices').select('id', { count: 'exact', head: true }),
    supabase.from('user_devices').select('id', { count: 'exact', head: true }).ilike('platform', '%android%'),
    supabase.from('user_devices').select('id', { count: 'exact', head: true }).ilike('platform', '%ios%'),
  ])

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    suspendedUsers: suspendedUsers || 0,
    bannedUsers: bannedUsers || 0,
    deletedUsers: deletedUsers || 0,
    totalDevices: totalDevices || 0,
    androidDevices: androidDevices || 0,
    iosDevices: iosDevices || 0,
  }
}
