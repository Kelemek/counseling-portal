-- Fix RLS policies to allow user creation
-- Run this in Supabase SQL Editor

-- Add policy to allow service role to insert users
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to insert their own user record (for the trigger)
CREATE POLICY "Allow user creation via trigger"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
