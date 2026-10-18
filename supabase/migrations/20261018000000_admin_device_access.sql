-- ============================================================================
-- Migration: Secure Admin Access for user_devices
-- Description:
-- 1. Adds RLS policy permitting authenticated admins/moderators to view user devices.
-- 2. Adds secure RPC function `get_user_devices_for_admin` with SECURITY DEFINER
--    to return strictly sanitized device metadata (derived has_fcm_token boolean,
--    no raw tokens, no raw hardware identifiers).
-- ============================================================================

-- 1. Admin RLS policy on public.user_devices
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'user_devices' 
      and policyname = 'Admins can view all user devices'
  ) then
    create policy "Admins can view all user devices"
    on public.user_devices
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.user_roles
        where user_roles.user_id = auth.uid()
          and user_roles.role in ('admin', 'super_admin', 'moderator')
      )
    );
  end if;
end $$;

-- 2. Secure RPC function for Admin Portal
create or replace function public.get_user_devices_for_admin(target_user_id uuid)
returns table (
  id uuid,
  user_id uuid,
  platform text,
  device_model text,
  os_version text,
  app_version text,
  build_number text,
  last_active_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  is_active boolean,
  logged_out_at timestamptz,
  last_token_synced_at timestamptz,
  has_fcm_token boolean
)
language plpgsql
security definer
as $$
begin
  -- Enforce server-side admin check
  if not exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role in ('admin', 'super_admin', 'moderator')
  ) then
    raise exception 'Unauthorized: Admin privileges required to view device history';
  end if;

  return query
  select
    d.id,
    d.user_id,
    d.platform,
    d.device_model,
    d.os_version,
    d.app_version,
    d.build_number,
    d.last_active_at,
    d.created_at,
    d.updated_at,
    coalesce(d.is_active, false) as is_active,
    d.logged_out_at,
    d.last_token_synced_at,
    (d.fcm_token is not null and length(trim(d.fcm_token)) > 0) as has_fcm_token
  from public.user_devices d
  where d.user_id = target_user_id
  order by d.last_active_at desc nulls last;
end;
$$;
