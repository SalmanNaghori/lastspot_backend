-- ============================================================================
-- Migration: Fix Connected Devices RPC & Admin Authorization
-- Target: KhelBhai Production Supabase Database
-- Description:
-- 1. Helper function `public.is_admin()` supporting 'admin' and 'super_admin' roles.
-- 2. Secure RPC function `public.get_user_devices_for_admin(target_user_id uuid)`
--    enforcing server-side admin check and returning strictly sanitized device
--    metadata (derived has_fcm_token boolean, no raw FCM tokens or hardware identifiers).
-- 3. Row Level Security policy allowing administrators to view user_devices table.
-- 4. PostgREST schema cache reload notification.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HELPER FUNCTION: public.is_admin()
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- 2. SECURE RPC FUNCTION: public.get_user_devices_for_admin(target_user_id uuid)
-- ----------------------------------------------------------------------------
-- Drop existing function first to resolve ERROR 42P13 (return type change)
DROP FUNCTION IF EXISTS public.get_user_devices_for_admin(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_devices_for_admin(target_user_id uuid)
returns table (
  id uuid,
  user_id uuid,
  device_identifier text,
  platform text,
  device_model text,
  os_version text,
  app_version text,
  build_number text,
  is_active boolean,
  last_active_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  logged_out_at timestamptz,
  last_token_synced_at timestamptz,
  has_fcm_token boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  -- 1. Enforce admin / super_admin role authorization
  if not public.is_admin() then
    raise exception 'Unauthorized: Administrator privileges required to view device history' using errcode = '42501';
  end if;

  -- 2. Return strictly sanitized device records for target_user_id
  -- Sensitive raw fcm_token is never exposed; derived has_fcm_token boolean is returned
  return query
  select
    d.id,
    d.user_id,
    d.device_identifier,
    coalesce(d.platform, 'Unknown') as platform,
    d.device_model,
    d.os_version,
    d.app_version,
    d.build_number::text,
    coalesce(d.is_active, false) as is_active,
    d.last_active_at,
    d.created_at,
    d.updated_at,
    d.logged_out_at,
    d.last_token_synced_at,
    (d.fcm_token is not null and length(trim(d.fcm_token)) > 0) as has_fcm_token
  from public.user_devices d
  where d.user_id = target_user_id
  order by d.last_active_at desc nulls last;
end;
$$;

revoke all on function public.get_user_devices_for_admin(uuid) from public;
grant execute on function public.get_user_devices_for_admin(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 3. RLS POLICY: Admins can view all user devices
-- ----------------------------------------------------------------------------
alter table public.user_devices enable row level security;

drop policy if exists "Admins can view all user devices" on public.user_devices;
create policy "Admins can view all user devices"
on public.user_devices
for select
to authenticated
using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. RELOAD SCHEMA CACHE IMMEDIATELY
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';

