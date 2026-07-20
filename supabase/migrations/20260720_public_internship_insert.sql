-- =====================================================================
-- Allow public (anonymous) visitors to submit internship applications.
--
-- The admin RLS migration added SELECT/UPDATE policies for admins but no
-- INSERT policy, so RLS blocked every public submission with error 42501
-- ("new row violates row-level security policy"). This adds a permissive
-- INSERT policy for the public form. Reads stay admin-only.
-- =====================================================================

-- Ensure RLS is on (idempotent) so the policies below are the access rules.
alter table public.internship_applications enable row level security;

-- Public form submissions: anyone may insert an application row.
drop policy if exists "Anyone can submit an internship application" on public.internship_applications;
create policy "Anyone can submit an internship application"
    on public.internship_applications
    for insert
    to anon, authenticated
    with check (true);

-- Table-level privilege (RLS gates the rows; this grants the verb).
grant insert on public.internship_applications to anon, authenticated;
