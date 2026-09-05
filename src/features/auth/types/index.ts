export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user'

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  status: 'active' | 'suspended' | 'banned'
  status_reason: string | null
  status_message: string | null
  status_expires_at: string | null
  is_profile_completed: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}
