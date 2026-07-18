-- =====================================================================
-- Program settings and self-service admin profile updates
-- =====================================================================

-- Seed configurable internship programs for the public form and admin panel.
insert into public.admin_settings (key, value)
values (
    'program_options',
    '["Networking & Security (NWS, CSN, etc)", "Cyber Security (pro interns)", "Telecommunications", "Computer Graphics and Web Development", "Electrical Power Systems", "Software Engineering (BTech & HND)"]'::jsonb
)
on conflict (key) do nothing;

-- Add editable profile fields for each admin user.
alter table public.admin_profiles
    add column if not exists full_name text,
    add column if not exists phone text,
    add column if not exists updated_at timestamptz not null default now();

update public.admin_profiles
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

drop policy if exists "Admins can update their own profile" on public.admin_profiles;

create policy "Admins can update their own profile"
    on public.admin_profiles
    for update
    to authenticated
    using (
        (select auth.uid()) is not null
        and (select auth.uid()) = id
    )
    with check (
        (select auth.uid()) is not null
        and (select auth.uid()) = id
    );

grant update on public.admin_profiles to authenticated;