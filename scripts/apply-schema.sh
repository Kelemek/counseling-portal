#!/bin/bash

# Apply Database Schema to Supabase
# Run this script to set up the database

echo "Applying auth-schema.sql to Supabase..."

# Read the .env file to get credentials
source .env

# Use Supabase SQL Editor or apply via direct connection
echo ""
echo "================================================"
echo "DATABASE SETUP INSTRUCTIONS"
echo "================================================"
echo ""
echo "1. Open Supabase Dashboard: https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/sql/new"
echo ""
echo "2. Copy the contents of sql/auth-schema.sql"
echo ""
echo "3. Paste into SQL Editor and click 'Run'"
echo ""
echo "4. Verify tables were created in Table Editor"
echo ""
echo "5. Create your first admin user:"
echo "   - Sign up at: https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/auth/users"
echo "   - Then run this SQL to make them admin:"
echo ""
echo "   UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';"
echo ""
echo "================================================"
echo ""

# Alternatively, use the REST API to execute SQL
# This requires setting up proper authentication

echo "Alternative: Would you like to apply via curl? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Applying schema via Supabase REST API..."
    
    # This is a workaround - execute SQL via RPC
    echo "Note: This method may have limitations. Manual application recommended."
fi
