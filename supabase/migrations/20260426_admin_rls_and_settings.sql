-- =====================================================================
-- Admin RLS policies, settings table, and admin profiles
-- =====================================================================

-- Helper function: returns true if the current JWT belongs to an admin.
-- Uses app_metadata (server-set, not user-editable) as required by security best practices.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
        false
    )
$$;

-- Revoke direct calls from regular roles; only internal/RLS use.
revoke all on function public.is_admin from anon;

-- -----------------------------------------------------------------------
-- Internship applications: admin read + update policies
-- -----------------------------------------------------------------------

drop policy if exists "Admins can read all internship applications" on public.internship_applications;
create policy "Admins can read all internship applications"
    on public.internship_applications
    for select
    to authenticated
    using (public.is_admin());

drop policy if exists "Admins can update internship applications" on public.internship_applications;
create policy "Admins can update internship applications"
    on public.internship_applications
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Add notes column for admin internal notes
alter table public.internship_applications
    add column if not exists notes text;

-- -----------------------------------------------------------------------
-- Admin settings table (fee structures, etc.)
-- -----------------------------------------------------------------------

create table if not exists public.admin_settings (
    key text primary key,
    value jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    updated_by uuid references auth.users(id)
);

alter table public.admin_settings enable row level security;
alter table public.admin_settings force row level security;

-- Public can read settings (fee structures are displayed on the public form)
drop policy if exists "Anyone can read admin settings" on public.admin_settings;
create policy "Anyone can read admin settings"
    on public.admin_settings
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Admins can insert settings" on public.admin_settings;
create policy "Admins can insert settings"
    on public.admin_settings
    for insert
    to authenticated
    with check (public.is_admin());

drop policy if exists "Admins can update settings" on public.admin_settings;
create policy "Admins can update settings"
    on public.admin_settings
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Seed default fee structures (no-op if already present)
insert into public.admin_settings (key, value)
values (
    'fee_structures',
    '["1 Month (15,000 XAF)", "2 Months (20,000 XAF)", "3-4 Months (25,000 XAF)", "5-6 Months (30,000 XAF)"]'::jsonb
)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------
-- Admin profiles table (mirrors auth.users for admin-role accounts)
-- -----------------------------------------------------------------------

create table if not exists public.admin_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    created_at timestamptz not null default now(),
    created_by uuid references auth.users(id)
);

alter table public.admin_profiles enable row level security;
alter table public.admin_profiles force row level security;

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
    on public.admin_profiles
    for select
    to authenticated
    using (public.is_admin());

drop policy if exists "Admins can insert admin profiles" on public.admin_profiles;
create policy "Admins can insert admin profiles"
    on public.admin_profiles
    for insert
    to authenticated
    with check (public.is_admin());

drop policy if exists "Admins can delete admin profiles" on public.admin_profiles;
create policy "Admins can delete admin profiles"
    on public.admin_profiles
    for delete
    to authenticated
    using (public.is_admin());

-- Grant table access to authenticated role
grant select, insert, update on public.admin_settings to authenticated;
grant select, insert, delete on public.admin_profiles to authenticated;

-- -----------------------------------------------------------------------
-- promote_to_admin: one-time setup helper
-- Run this in the Supabase SQL editor to make the first admin:
--   SELECT public.promote_to_admin('admin@example.com');
-- -----------------------------------------------------------------------

create or replace function public.promote_to_admin(user_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid;
begin
    select id into v_user_id from auth.users where email = user_email;
    if v_user_id is null then
        return 'User not found: ' || user_email;
    end if;

    update auth.users
        set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
        where id = v_user_id;

    -- Also ensure an admin_profiles row exists
    insert into public.admin_profiles (id, email)
        values (v_user_id, user_email)
        on conflict (id) do nothing;

    return 'Promoted ' || user_email || ' to admin successfully.';
end;
$$;

-- Prevent regular roles from calling promote_to_admin via the API
revoke all on function public.promote_to_admin from anon, authenticated;
