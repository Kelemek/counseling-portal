-- Refactor to Multi-Role System
-- This migration changes from single role per user to multiple roles per user

-- Step 1: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'counselor', 'counselee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Step 2: Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Step 3: Migrate existing data from users.role to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role 
FROM public.users 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Migrate existing counselor_profiles to user_roles
-- Any user with a counselor_profile should have the 'counselor' role
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'counselor'
FROM public.counselor_profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Update counselee_profiles to reference user_id directly
-- (No change needed - it already uses user_id)

-- Step 6: Add helper function to check if user has a role
CREATE OR REPLACE FUNCTION public.user_has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add helper function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = check_user_id
    ORDER BY role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update RLS policies (example for counselor_profiles)
-- You can keep counselor_profiles table for additional counselor-specific data
-- but use user_roles for access control

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only admins can insert roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 9: Drop the role column from users table (optional - do this after updating all code)
-- ALTER TABLE public.users DROP COLUMN role;

-- Step 10: Keep counselor_profiles and counselee_profiles for role-specific data
-- But change foreign key relationship for counselor_profiles:
-- Currently: counselor_profiles.user_id references users
-- Keep it as is, but use user_roles to determine if someone is a counselor

COMMENT ON TABLE public.user_roles IS 'Many-to-many relationship between users and roles. A user can have multiple roles (admin, counselor, counselee).';
COMMENT ON TABLE public.counselor_profiles IS 'Additional profile data specific to counselors. User must have counselor role in user_roles.';
COMMENT ON TABLE public.counselee_profiles IS 'Additional profile data specific to counselees. User must have counselee role in user_roles.';
