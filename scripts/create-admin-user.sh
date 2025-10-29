#!/bin/bash

# Script to create admin user via Supabase Admin API
# Make sure you have your SUPABASE_SERVICE_ROLE_KEY in .env.local

# Load environment variables
source app/.env.local

SUPABASE_URL="https://eaxtfgicqoaowvyogpic.supabase.co"
EMAIL="markdlarson@me.com"
PASSWORD="ChangeMe123!" # Change this to a secure password

echo "Creating admin user: $EMAIL"

# Create user via Admin API
curl -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'${EMAIL}'",
    "password": "'${PASSWORD}'",
    "email_confirm": true,
    "user_metadata": {
      "role": "admin",
      "full_name": "Mark Larson"
    }
  }'

echo ""
echo "User created! Now promoting to admin role..."
echo "Go to Supabase SQL Editor and run:"
echo "UPDATE public.users SET role = 'admin' WHERE email = '${EMAIL}';"
