-- Temporarily disable the trigger, create user, then re-enable
-- Run this in Supabase SQL Editor

-- Step 1: Disable the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Now go to Dashboard and create the user:
-- https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/auth/users
-- Click "Add user" -> "Create new user"
-- Email: markdlarson@me.com
-- Password: [your choice]
-- Auto Confirm User: ✅ CHECK THIS
-- Click "Create user" - should work now!

-- Step 3: After creating the user, get their ID
-- SELECT id FROM auth.users WHERE email = 'markdlarson@me.com';

-- Step 4: Manually insert into public.users (replace USER_ID with actual UUID)
-- INSERT INTO public.users (id, email, role, full_name, is_active)
-- VALUES (
--   'USER_ID_HERE',
--   'markdlarson@me.com',
--   'admin',
--   'Mark Larson',
--   true
-- );

-- Step 5: Re-enable the trigger for future users
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify admin user
-- SELECT id, email, role FROM public.users WHERE email = 'markdlarson@me.com';
