## Multi-Role System Refactoring

### Why This is Better

**Before (Single Role):**
```typescript
// Complex role checks everywhere
if (user.role !== 'counselor' && user.role !== 'admin') {
  redirect('/unauthorized')
}

// Had to maintain separate counselor_profiles table just for access control
// Admin couldn't be a counselor without complex workarounds
```

**After (Multi-Role):**
```typescript
// Clean, readable role checks
if (!hasAnyRole(user, ['counselor', 'admin'])) {
  redirect('/unauthorized')
}

// Anyone can have any combination of roles
// An admin is automatically a counselor if they have both roles
```

### Benefits

1. **Flexibility**: Users can have multiple roles simultaneously
   - Admin can also be a counselor
   - Counselor can also be a counselee (getting counseling themselves)
   - Easy to add new roles in the future

2. **Simpler Code**: No more complex dual-role checks
   ```typescript
   // Old way
   if (user.role !== 'counselor' && user.role !== 'admin') { ... }
   
   // New way
   if (!hasAnyRole(user, ['counselor', 'admin'])) { ... }
   ```

3. **Better Database Design**:
   - `user_roles` table handles access control
   - `counselor_profiles` and `counselee_profiles` only store role-specific data
   - Clear separation of concerns

4. **Easier Testing**: Can easily add test roles or temporary permissions

5. **Future-Proof**: Easy to add new roles like 'supervisor', 'billing', etc.

### Database Structure

```sql
-- User can have multiple roles
user_roles:
  - user_id (FK to auth.users)
  - role (admin | counselor | counselee)
  - UNIQUE(user_id, role)

-- Role-specific data only
counselor_profiles:
  - user_id (user must have 'counselor' role)
  - specializations, bio, etc.

counselee_profiles:
  - user_id (user must have 'counselee' role)
  - intake_form_id, emergency_contact, etc.
```

### Helper Functions

```typescript
// Check single role
hasRole(user, 'admin')  // → boolean

// Check if user has ANY of these roles
hasAnyRole(user, ['counselor', 'admin'])  // → boolean

// Check if user has ALL of these roles
hasAllRoles(user, ['admin', 'counselor'])  // → boolean

// Convenience functions
isAdmin(user)
isCounselor(user)
isCounselee(user)
```

### Migration Steps

1. **Run SQL migration**: Creates `user_roles` table and migrates existing data
2. **Update auth types**: Change `role` to `roles` array
3. **Update all page checks**: Use `hasAnyRole()` instead of direct role comparisons
4. **Update API routes**: Same pattern - use role helpers
5. **Update RLS policies**: Use `user_roles` table for access control
6. **Remove old `role` column** from users table (after all code updated)

### Code Changes Needed

Search and replace patterns:

```typescript
// Pattern 1: Simple role check
// OLD: user.role === 'counselor'
// NEW: hasRole(user, 'counselor')

// Pattern 2: OR role check
// OLD: user.role === 'counselor' || user.role === 'admin'
// NEW: hasAnyRole(user, ['counselor', 'admin'])

// Pattern 3: Negative check
// OLD: user.role !== 'counselor' && user.role !== 'admin'
// NEW: !hasAnyRole(user, ['counselor', 'admin'])
```

### Example Page Updates

**Before:**
```typescript
export default async function CounselorPage() {
  const user = await authServer.getCurrentUser()
  
  if (!user || (user.role !== 'counselor' && user.role !== 'admin')) {
    redirect('/unauthorized')
  }
  
  // ... rest of page
}
```

**After:**
```typescript
import { hasAnyRole } from '@/lib/auth/roles'

export default async function CounselorPage() {
  const user = await authServer.getCurrentUser()
  
  if (!user || !hasAnyRole(user, ['counselor', 'admin'])) {
    redirect('/unauthorized')
  }
  
  // ... rest of page
}
```

### Files to Update

1. All `/app/src/app/counselor/**` pages
2. All `/app/src/app/admin/**` pages
3. All `/app/src/app/counselee/**` pages
4. All API routes in `/app/src/app/api/**`
5. Login redirect logic in `/app/src/app/login/page.tsx`
6. Middleware if it checks roles

### Benefits in Your Case

For your specific use case (admin wanting to be a counselor):

**Before:**
- Had to create `counselor_profiles` record
- Had to check for both `user.role === 'admin'` AND counselor_profiles existence
- Complex queries with joins

**After:**
- Just add 'counselor' to user's roles: `INSERT INTO user_roles VALUES (user_id, 'counselor')`
- All counselor pages automatically work
- Simple role check: `hasRole(user, 'counselor')`

This is a MUCH better design! Want me to run the migration and update all the pages?
