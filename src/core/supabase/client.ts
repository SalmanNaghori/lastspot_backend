import { createClient } from '@supabase/supabase-js'

const env: Record<string, string | undefined> = (import.meta as any).env || {}
const globalEnv: Record<string, string | undefined> = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) || {}

const supabaseUrl = env.VITE_SUPABASE_URL || globalEnv.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || globalEnv.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
