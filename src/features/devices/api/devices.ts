import { supabase } from '@/core/supabase/client'

export interface UserDevice {
  id: string
  user_id: string
  device_identifier: string
  platform: string
  device_model: string
  os_version: string
  app_version: string
  build_number: string
  push_token: string | null
  last_active_at: string | null
  created_at: string
  updated_at: string
}

export const fetchUserDevices = async (userId: string): Promise<UserDevice[]> => {
  const { data, error } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false })

  if (error) throw error
  return data as UserDevice[]
}

export interface FetchAllDevicesParams {
  page: number
  perPage: number
  platform?: string
}

export const fetchAllDevices = async ({ page, perPage, platform }: FetchAllDevicesParams) => {
  let query = supabase.from('user_devices').select('*, profiles(full_name, avatar_url)', { count: 'exact' })
  
  if (platform && platform !== 'all') {
    query = query.ilike('platform', `%${platform}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  
  query = query.range(from, to).order('last_active_at', { ascending: false })

  const { data, count, error } = await query

  if (error) throw error
  return { data, count: count || 0 }
}
