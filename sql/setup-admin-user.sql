-- Step 1: Add the missing RLS policy to allow user creation
-- This allows the handle_new_user() trigger to insert into the users table

-- Drop if exists (to avoid errors)
DROP POLICY IF EXISTS "Allow user creation via auth trigger" ON public.users;

-- Create the policy
CREATE POLICY "Allow user creation via auth trigger"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 2: Verify the policy was created
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Allow user creation via auth trigger';

-- Now you can create users via the Supabase Dashboard:
-- 1. Go to: Authentication -> Users
-- 2. Click "Add user" -> "Create new user"
-- 3. Email: markdlarson@me.com
-- 4. Password: [your choice]
-- 5. Check "Auto Confirm User"
-- 6. Click "Create user"

-- Step 3: After creating the user via Dashboard, run this to make them admin:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE email = 'markdlarson@me.com';

-- Step 4: Verify the admin user was created:
-- SELECT id, email, role, is_active, created_at 
-- FROM public.users 
-- WHERE email = 'markdlarson@me.com';
