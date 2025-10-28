-- SQL schema for storing JotForm submissions in Supabase

create extension if not exists pgcrypto;

create table if not exists jotform_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id text,
  submission_id text,
  submitted_at timestamptz default now(),
  data jsonb not null,
  parsed jsonb,
  files jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_jotform_form_id on jotform_submissions(form_id);
create index if not exists idx_jotform_submitted_at on jotform_submissions(submitted_at desc);

-- Example Row Level Security (RLS) policy if you want to restrict reads.
-- By default, public (anon) cannot read. Uncomment and adjust if you want public read access.

-- enable rls if you'd like to create policies
-- alter table jotform_submissions enable row level security;

-- allow the service_role or a specific authenticated role to insert (service role used by Edge Function)
-- create policy "service_role_insert" on jotform_submissions
--   for insert
--   using (true)
--   with check (auth.role() = 'service_role');

-- Example public read policy (ONLY do this if you want anyone with the anon key to read submissions):
-- create policy "public_select" on jotform_submissions
--   for select
--   using (true);

-- If you prefer authenticated users only, write a policy allowing selects for auth.role() = 'authenticated'.
-- create policy "auth_select" on jotform_submissions
--   for select
--   using (auth.role() = 'authenticated');

-- NOTE: Adjust policies to match your security requirements. Keep SUPABASE_SERVICE_ROLE_KEY private and only use it server-side.
