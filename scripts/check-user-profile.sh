#!/bin/bash

# Check if user exists in public.users table
# This uses the Supabase REST API

SUPABASE_URL="https://eaxtfgicqoaowvyogpic.supabase.co"
USER_ID="81569629-4af7-4dab-9c48-f8aea433319f"

echo "Checking for user in public.users table..."
echo "User ID: $USER_ID"
echo ""

# Read the anon key from .env.local
cd /Users/marklarson/Documents/GitHub/counseling-portal/app
ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)

curl -s "${SUPABASE_URL}/rest/v1/users?id=eq.${USER_ID}&select=*" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" | jq .

echo ""
echo "If the result is an empty array [], the user profile does NOT exist in public.users"
echo "If you see user data, the profile exists"
