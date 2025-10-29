-- Insert admin user profile into public.users table
-- Run this in Supabase SQL Editor

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

-- Verify the user was created
SELECT id, email, role, full_name, is_active, created_at
FROM public.users 
WHERE email = 'markdlarson@me.com';
