-- Check if counselor profile exists for admin
SELECT 
  u.id,
  u.email,
  u.role,
  cp.id as counselor_profile_id,
  cp.specialties
FROM users u
LEFT JOIN counselor_profiles cp ON u.id = cp.user_id
WHERE u.email = 'markdlarson@me.com';

-- If no counselor profile exists, create one
-- (Run this only if the above query shows null for counselor_profile_id)
INSERT INTO counselor_profiles (
  user_id,
  specialties,
  bio,
  max_counselees
)
SELECT 
  id,
  ARRAY['General Counseling', 'Crisis Intervention'],
  'Admin account serving as counselor for testing and oversight',
  50
FROM users
WHERE email = 'markdlarson@me.com'
  AND NOT EXISTS (
    SELECT 1 FROM counselor_profiles WHERE user_id = users.id
  );

-- Verify the counselor profile was created
SELECT 
  u.id,
  u.email,
  u.role,
  cp.id as counselor_profile_id,
  cp.specialties,
  cp.bio
FROM users u
LEFT JOIN counselor_profiles cp ON u.id = cp.user_id
WHERE u.email = 'markdlarson@me.com';
