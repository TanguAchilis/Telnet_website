create extension if not exists pgcrypto with schema extensions;

create table if not exists public.internship_applications (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text not null,
    phone text not null,
    it_background text not null,
    laptop_status text not null,
    mode_of_learning text not null,
    school text,
    department_option text,
    academic_level text,
    program_option text not null,
    program_option_other text,
    internship_period text not null,
    internship_period_other text,
    fee_structure text not null,
    payment_method text not null,
    document_submission_method text not null default 'office_drop_off',
    status text not null default 'new',
    source text not null default 'website',
    metadata jsonb not null default '{}'::jsonb,
    submitted_at timestamptz not null default timezone('utc'::text, now()),
    created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.internship_applications enable row level security;
alter table public.internship_applications force row level security;

create index if not exists internship_applications_submitted_at_idx
    on public.internship_applications (submitted_at desc);

create index if not exists internship_applications_status_idx
    on public.internship_applications (status);

create index if not exists internship_applications_email_idx
    on public.internship_applications (email);

grant insert on table public.internship_applications to anon, authenticated;

drop policy if exists "Anyone can submit internship applications" on public.internship_applications;

create policy "Anyone can submit internship applications"
    on public.internship_applications
    for insert
    to anon, authenticated
    with check (
        source = 'website'
        and document_submission_method = 'office_drop_off'
    );