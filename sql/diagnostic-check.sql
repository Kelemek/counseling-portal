-- Quick diagnostic query to check current state
-- Run this in Supabase SQL Editor

-- 1. Check if helper function exists
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_role';

-- 2. Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'markdlarson@me.com';

-- 3. Check if user exists in public.users (using SECURITY DEFINER to bypass RLS)
SELECT id, email, role, full_name, is_active, created_at
FROM public.users 
WHERE email = 'markdlarson@me.com';

-- If the third query returns nothing or errors, the profile doesn't exist
-- If it returns the infinite recursion error, the RLS fix wasn't applied
