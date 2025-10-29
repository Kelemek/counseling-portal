-- Run this SQL in Supabase SQL Editor to make your first user an admin
-- Replace 'your-email@example.com' with your actual email

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'markdlarson@me.com';

-- Verify the update worked:
SELECT id, email, role, full_name, created_at 
FROM public.users 
WHERE email = 'markdlarson@me.com';
