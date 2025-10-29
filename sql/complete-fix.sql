-- COMPLETE FIX: RLS Recursion + Insert Admin User
-- Run this ENTIRE script in Supabase SQL Editor in ONE GO

-- Step 1: Create helper function to bypass RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Step 2: Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Counselors can view their counselees" ON public.users;
DROP POLICY IF EXISTS "Admins can insert/update users" ON public.users;
DROP POLICY IF EXISTS "Allow user creation via auth trigger" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Step 3: Create new policies WITHOUT recursion
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Counselors can view their counselees"
  ON public.users FOR SELECT
  USING (
    role = 'counselee' AND
    EXISTS (
      SELECT 1 FROM public.counselee_profiles
      WHERE counselee_profiles.user_id = users.id
      AND counselee_profiles.assigned_counselor_id = auth.uid()
    )
  );

CREATE POLICY "Allow user creation via auth trigger"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Step 4: Insert admin user profile (if not exists)
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

-- Step 5: Verify it worked
SELECT 
  'SUCCESS: Admin user profile created/updated' as status,
  id, 
  email, 
  role, 
  full_name, 
  is_active, 
  created_at
FROM public.users 
WHERE email = 'markdlarson@me.com';
