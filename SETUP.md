# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account with project created
- Git installed

## Setup Steps

### 1. Apply Database Schema

**Go to Supabase Dashboard:**
```
https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/sql/new
```

**Copy and run the SQL from:**
```
sql/auth-schema.sql
```

**Verify tables were created** in the Table Editor.

### 2. Create First Admin User

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. After user is created, run this SQL:
```sql
UPDATE public.users SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Option B: Via Signup (after implementing Phase 3)**
1. Sign up through the app
2. Run the SQL above to promote to admin

### 3. Run the Next.js App

```bash
cd app
npm install
npm run dev
```

Visit: http://localhost:3000

### 4. Test the Flow

1. **Admin Dashboard** (http://localhost:3000/admin)
   - View all intake forms from JotForm
   - Assign forms to counselors
   - Create counselor accounts

2. **Counselor Dashboard** (http://localhost:3000/counselor)
   - View assigned forms
   - Create counselee logins
   - Assign homework
   - Chat with counselees

3. **Counselee Portal** (http://localhost:3000/counselee)
   - View intake form
   - Complete homework
   - Chat with counselor

### 5. Current Working Features

✅ JotForm submissions saving to database  
✅ Netlify viewer showing clean form data  
✅ Next.js app with routing  
✅ Database schema with RLS  
✅ Type-safe database queries  

### 6. Next Steps (Phase 3)

- [ ] Build login page
- [ ] Build signup page  
- [ ] Create dashboard redirects based on role
- [ ] Implement session management
- [ ] Add logout functionality

---

## Troubleshooting

**Database Connection Issues:**
- Check `.env.local` has correct Supabase URL and keys
- Verify Supabase project is active

**Schema Application Errors:**
- Tables may already exist - check Table Editor
- Run schema in parts if needed
- Check for foreign key dependency order

**Next.js App Not Starting:**
```bash
cd app
rm -rf .next
npm install
npm run dev
```

---

## Development Workflow

1. Make changes to code
2. App auto-reloads (Hot Module Replacement)
3. Test in browser
4. Commit changes:
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

---

## Important Files

- **Database Schema**: `sql/auth-schema.sql`
- **Environment Variables**: `app/.env.local`
- **Supabase Client**: `app/src/lib/supabase/`
- **Type Definitions**: `app/src/lib/types/database.types.ts`
- **Middleware (Auth)**: `app/src/middleware.ts`

---

## Support

See `IMPLEMENTATION_GUIDE.md` for detailed phase-by-phase instructions.
See `PROGRESS.md` for current status and what's been completed.
