-- Manual admin user creation (bypasses the trigger issues)
-- Run this in Supabase SQL Editor

-- Step 1: First, create the user in the Supabase Dashboard:
-- Go to: https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/auth/users
-- Click "Add user" -> "Create new user"
-- Email: markdlarson@me.com
-- Password: [your choice]
-- Auto Confirm User: ✅ CHECK THIS
-- Click "Create user"

-- Step 2: Get the user ID from auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'markdlarson@me.com';

-- Step 3: Copy the ID from above and insert into public.users manually
-- Replace 'USER_ID_HERE' with the actual UUID from step 2
INSERT INTO public.users (id, email, role, full_name, is_active)
VALUES (
  'USER_ID_HERE',  -- Replace with actual UUID from step 2
  'markdlarson@me.com',
  'admin',
  'Mark Larson',
  true
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Step 4: Verify it worked
SELECT id, email, role, full_name, is_active, created_at 
FROM public.users 
WHERE email = 'markdlarson@me.com';
