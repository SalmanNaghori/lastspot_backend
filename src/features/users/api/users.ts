import { supabase } from '@/core/supabase/client'
import type { UserProfile } from '@/features/auth/types'

export interface FetchUsersParams {
  page: number
  perPage: number
  search?: string
  statusFilter?: 'all' | 'active' | 'suspended' | 'banned' | 'deleted'
}

export const fetchUsers = async ({ page, perPage, search, statusFilter }: FetchUsersParams) => {
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('full_name', `%${search}%`)
  }

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'deleted') {
      query = query.not('deleted_at', 'is', null)
    } else {
      query = query.eq('status', statusFilter).is('deleted_at', null)
    }
  }

  // Pagination
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  
  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, count, error } = await query

  if (error) throw error

  return { data: data as UserProfile[], count: count || 0 }
}

export const fetchUserById = async (id: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as UserProfile
}

export const updateUserStatus = async (
  id: string, 
  status: 'active' | 'suspended' | 'banned', 
  reason: string | null = null, 
  message: string | null = null,
  expiresAt: string | null = null
) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      status,
      status_reason: reason,
      status_message: message,
      status_expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error
}

export const reactivateUser = async (id: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error
}
