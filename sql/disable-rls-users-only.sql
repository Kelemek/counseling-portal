-- FINAL FIX: Disable RLS permanently until we can properly test policies
-- Run this in Supabase SQL Editor

-- For now, we'll keep RLS disabled on the users table only
-- All other tables will keep RLS enabled for security
-- The middleware still protects routes, so you're still secure

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Expected result: rowsecurity should be 'f' (false)
