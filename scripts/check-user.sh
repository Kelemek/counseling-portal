#!/bin/bash

# Check if user exists in Supabase Auth

# Load environment variables
source app/.env.local

SUPABASE_URL="https://eaxtfgicqoaowvyogpic.supabase.co"
EMAIL="markdlarson@me.com"

echo "Checking for existing user: $EMAIL"

# List users via Admin API
curl -X GET "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  | python3 -m json.tool | grep -A 5 "${EMAIL}"

echo ""
echo "If you see the user above, they already exist."
echo "You can reset their password in the Supabase Dashboard."
