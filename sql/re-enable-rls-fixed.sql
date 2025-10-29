-- Re-enable RLS with fixed policies (no infinite recursion)
-- Run this in Supabase SQL Editor

-- Step 1: Create helper function to get user role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Step 2: Re-enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Counselors can view their counselees" ON public.users;
DROP POLICY IF EXISTS "Allow user creation via auth trigger" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Step 4: Create new policies using helper function (no recursion)
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

-- Verify
SELECT 'SUCCESS: RLS re-enabled with fixed policies' as status;
