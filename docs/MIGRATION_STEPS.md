# Multi-Role System Migration Guide

## Step-by-Step Instructions

### Step 1: Run SQL in Supabase (REQUIRED FIRST)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/sql/new
2. Copy and paste the SQL from `/sql/refactor-to-multi-role-system.sql`
3. Click "Run" to create the table, indexes, functions, and RLS policies

### Step 2: Migrate the Data

1. Navigate to http://localhost:3000/admin/migrate in your browser
2. Click "Run Data Migration" button
3. This will:
   - Copy all existing user roles from `users.role` to `user_roles` table
   - Add 'counselor' role for all users with counselor_profiles
   - Show you how many records were migrated

### Step 3: Update the Code

The following files have already been updated with the new multi-role system:

✅ `/app/src/lib/auth/types.ts` - Changed `role` to `roles: UserRole[]`
✅ `/app/src/lib/auth/server.ts` - Fetches roles from `user_roles` table
✅ `/app/src/lib/auth/roles.ts` - Helper functions for role checks
✅ `/app/src/app/counselor/forms/[id]/page.tsx` - Example using `hasAnyRole()`

### Step 4: Update Remaining Pages

After the migration runs successfully, we need to update all pages to use the new role system.

Search for these patterns and replace:

#### Pattern 1: Simple role check
```typescript
// OLD
if (user.role === 'counselor')

// NEW
import { hasRole } from '@/lib/auth/roles';
if (hasRole(user, 'counselor'))
```

#### Pattern 2: OR role check
```typescript
// OLD
if (user.role === 'counselor' || user.role === 'admin')

// NEW
import { hasAnyRole } from '@/lib/auth/roles';
if (hasAnyRole(user, ['counselor', 'admin']))
```

#### Pattern 3: Negative check
```typescript
// OLD
if (user.role !== 'counselor' && user.role !== 'admin')

// NEW
import { hasAnyRole } from '@/lib/auth/roles';
if (!hasAnyRole(user, ['counselor', 'admin']))
```

### Files That Need Updating

Run this command to find all files that reference `user.role`:

```bash
cd /Users/marklarson/Documents/GitHub/counseling-portal/app/src
grep -r "user\.role" --include="*.tsx" --include="*.ts" .
```

Key files to update:
- `/app/src/app/admin/**/*.tsx` pages
- `/app/src/app/counselor/**/*.tsx` pages  
- `/app/src/app/counselee/**/*.tsx` pages
- `/app/src/app/login/page.tsx` - login redirect logic
- `/app/src/app/api/**/*.ts` - API route guards
- `/app/src/middleware.ts` - if it checks roles

### Step 5: Test the New System

1. Log in as admin
2. Verify you have both 'admin' and 'counselor' roles
3. Test access to both admin and counselor pages
4. Verify form assignments still work
5. Test creating new users with multiple roles

### Step 6: Clean Up (Optional - Do Later)

After everything is working:

```sql
-- Remove the old role column from users table
ALTER TABLE public.users DROP COLUMN role;

-- Drop counselor_profiles if you only need it for role tracking
-- (Keep it if you have counselor-specific data like bio, specializations, etc.)
```

## Benefits of the New System

- ✅ **One user, multiple roles**: Admin can be counselor and/or counselee
- ✅ **Cleaner code**: `hasAnyRole(user, ['counselor', 'admin'])` vs complex conditionals
- ✅ **Better separation**: `user_roles` = access control, `counselor_profiles` = data storage
- ✅ **Future-proof**: Easy to add new roles like 'supervisor', 'billing', etc.
- ✅ **Flexible**: Can grant temporary roles or test permissions easily

## Need Help?

If you encounter errors:
1. Check the migration page at `/admin/migrate` for error details
2. Verify the SQL ran successfully in Supabase
3. Check browser console for client-side errors
4. Check server logs for API errors
