-- ============================================================================
-- Migration: User Data & Device Consistency Suite
-- Description:
-- 1. Adds RLS policy permitting authenticated admins/moderators to view user devices.
-- 2. Adds RLS policy permitting authenticated admins/moderators to view user profiles.
-- 3. Adds secure RPC function `get_user_devices_for_admin(target_user_id uuid)`.
-- 4. Adds secure RPC function `get_user_details_for_admin(target_user_id uuid)`
--    which safely resolves email/phone fallbacks from auth.users and city/state
--    from public.cities for older/existing users.
-- ============================================================================

-- 1. Admin RLS policy on public.user_devices
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public'
      and tablename = 'user_devices' 
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

-- 2. Admin RLS policy on public.profiles
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public'
      and tablename = 'profiles' 
      and policyname = 'Admins can view all profiles'
  ) then
    create policy "Admins can view all profiles"
    on public.profiles
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

-- 3. Secure RPC function for User Devices
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

-- 4. Secure RPC function for User Details (with older user email/phone/city resolution)
create or replace function public.get_user_details_for_admin(target_user_id uuid)
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  status text,
  status_reason text,
  status_message text,
  status_expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  city_id uuid,
  city text,
  state text,
  country text,
  is_profile_completed boolean,
  bio text,
  rating numeric,
  role text
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
    raise exception 'Unauthorized: Admin privileges required to view user details';
  end if;

  return query
  select
    p.id,
    p.full_name,
    -- Email fallback priority: profiles.email -> auth.users.email
    coalesce(nullif(trim(p.email), ''), u.email) as email,
    -- Phone fallback priority: profiles.phone -> auth.users.phone
    coalesce(nullif(trim(p.phone), ''), u.phone) as phone,
    p.avatar_url,
    p.status,
    p.status_reason,
    p.status_message,
    p.status_expires_at,
    p.deleted_at,
    p.created_at,
    p.updated_at,
    p.city_id,
    -- City fallback priority: cities.name -> profiles.city
    coalesce(c.name, p.city) as city,
    c.state,
    'India'::text as country,
    coalesce(p.is_profile_completed, false) as is_profile_completed,
    p.bio,
    p.rating,
    coalesce(r.role, 'user'::text) as role
  from public.profiles p
  left join auth.users u on u.id = p.id
  left join public.cities c on c.id = p.city_id
  left join public.user_roles r on r.user_id = p.id
  where p.id = target_user_id;
end;
$$;
