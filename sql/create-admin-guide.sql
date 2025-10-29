-- Step-by-step guide to create admin user

-- OPTION 1: Create via Supabase Dashboard (RECOMMENDED)
-- 1. Go to https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/auth/users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter:
--    Email: markdlarson@me.com
--    Password: [choose a secure password]
--    Auto Confirm User: YES (check this box)
-- 4. Click "Create user"
-- 5. Then run the SQL below in the SQL Editor to make them admin

-- OPTION 2: Create via API (run this in your terminal)
-- You'll need your Supabase service role key from .env.local

-- After creating the user via Dashboard, run this SQL to promote to admin:
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'markdlarson@me.com';

-- Verify it worked:
SELECT id, email, role, full_name, is_active, created_at 
FROM public.users 
WHERE email = 'markdlarson@me.com';

-- If no rows are returned, the user doesn't exist in the users table yet
-- This can happen if the database trigger didn't fire
-- In that case, manually insert:

-- First, get the auth user ID from the auth.users table:
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'markdlarson@me.com';

-- Then insert into public.users table (replace USER_ID with the ID from above):
-- INSERT INTO public.users (id, email, role, full_name, is_active)
-- VALUES ('USER_ID_HERE', 'markdlarson@me.com', 'admin', 'Mark Larson', true);
