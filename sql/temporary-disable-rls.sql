-- TEMPORARY FIX: Disable RLS to get you access immediately
-- Run this in Supabase SQL Editor

-- Step 1: Temporarily disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Insert admin user profile (if not exists)
INSERT INTO public.users (id, email, role, full_name, is_active)
VALUES (
  '81569629-4af7-4dab-9c48-f8aea433319f',
  'markdlarson@me.com',
  'admin',
  'Mark Larson',
  true
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_active = true;

-- Step 3: Verify it worked
SELECT 
  'SUCCESS: RLS disabled, admin user created' as status,
  id, 
  email, 
  role, 
  full_name, 
  is_active
FROM public.users 
WHERE email = 'markdlarson@me.com';

-- NOTE: This disables security temporarily. 
-- After you confirm access works, we'll re-enable RLS with fixed policies.
