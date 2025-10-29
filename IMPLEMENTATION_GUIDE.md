# Counseling Portal - Implementation Guide

A comprehensive church counseling ministry portal with role-based access for Admins, Counselors, and Counselees.

## System Overview

### User Roles & Capabilities

**Admin** (Counselor with admin privileges)
- View all intake forms from JotForm
- Assign intake forms to counselors
- Create counselor accounts
- Manage all users
- View activity logs
- Has all counselor capabilities

**Counselor**
- View only assigned intake forms
- Generate login credentials for counselees
- Assign homework and resources
- Chat with assigned counselees
- Track counselee progress

**Counselee**
- View their own intake form
- Access assigned homework/resources
- Chat with their assigned counselor
- Submit homework assignments

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Deployment**: Vercel (frontend), Supabase (backend)
- **Auth**: Supabase Auth with abstraction layer for future migration

## 10-Phase Implementation Plan

### Phase 1: Database Schema & Auth Setup ✅
**Goal**: Set up Supabase database with proper tables, RLS policies, and authentication.

**Steps**:
1. Apply `sql/auth-schema.sql` to Supabase
2. Apply `sql/schema.sql` (existing JotForm submissions table)
3. Test RLS policies
4. Create first admin user

**Deliverable**: Fully configured database with security policies

---

### Phase 2: Next.js Project Setup
**Goal**: Initialize Next.js project with proper structure and dependencies.

**Steps**:
1. Create new Next.js app with TypeScript
2. Install dependencies (Supabase, Tailwind, shadcn/ui)
3. Set up environment variables
4. Create project structure
5. Configure Supabase client

**Deliverable**: Running Next.js app with Supabase connection

---

### Phase 3: Authentication System
**Goal**: Implement login/logout with role-based access control.

**Steps**:
1. Create auth abstraction layer (`lib/auth`)
2. Build login/signup pages
3. Implement session management
4. Create auth middleware for route protection
5. Build role-based access guards

**Deliverable**: Working authentication with role-based routing

---

### Phase 4: Admin Dashboard
**Goal**: Admin interface to manage intake forms and assignments.

**Features**:
1. View all intake forms (table view)
2. View individual intake form details
3. Assign forms to counselors
4. Create/manage counselor accounts
5. View unassigned forms dashboard
6. Activity log viewer

**Deliverable**: Fully functional admin dashboard

---

### Phase 5: Counselor Dashboard
**Goal**: Counselor interface to manage assigned counselees.

**Features**:
1. View assigned intake forms
2. Generate counselee login credentials
3. View counselee list
4. Create/assign homework
5. Access chat interface
6. Track counselee progress

**Deliverable**: Fully functional counselor dashboard

---

### Phase 6: Counselee Portal
**Goal**: Counselee interface to access their information.

**Features**:
1. View their intake form (read-only)
2. View assigned homework
3. Submit homework assignments
4. Access chat with counselor
5. View counselor contact info

**Deliverable**: Fully functional counselee portal

---

### Phase 7: Real-time Chat System
**Goal**: Bidirectional messaging between counselor and counselee.

**Features**:
1. Real-time message delivery (Supabase Realtime)
2. Message history
3. Read receipts
4. File attachments (optional)
5. Typing indicators

**Deliverable**: Working chat system with real-time updates

---

### Phase 8: Homework & Resources
**Goal**: System for assigning and tracking homework.

**Features**:
1. Create homework assignments
2. Set due dates
3. Upload resource files (Supabase Storage)
4. Track submission status
5. Provide feedback
6. Progress tracking

**Deliverable**: Complete homework management system

---

### Phase 9: Testing & Security Audit
**Goal**: Ensure security and proper access control.

**Steps**:
1. Test all user flows (admin, counselor, counselee)
2. Verify RLS policies work correctly
3. Test authorization logic
4. Security audit (data isolation)
5. Performance testing
6. Mobile responsiveness

**Deliverable**: Tested and secure application

---

### Phase 10: Deployment & Documentation
**Goal**: Deploy to production and create documentation.

**Steps**:
1. Deploy to Vercel
2. Configure production Supabase
3. Set up environment variables
4. Create admin user guide
5. Create counselor user guide
6. Create counselee user guide
7. Document deployment process

**Deliverable**: Production-ready application with documentation

---

## Project Structure (Next.js)

```
counseling-portal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   ├── assignments/
│   │   └── counselors/
│   ├── (counselor)/
│   │   ├── dashboard/
│   │   ├── counselees/
│   │   ├── homework/
│   │   └── chat/
│   ├── (counselee)/
│   │   ├── dashboard/
│   │   ├── my-form/
│   │   ├── homework/
│   │   └── chat/
│   ├── api/
│   │   ├── auth/
│   │   └── webhooks/
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── forms/
│   ├── chat/
│   └── shared/
├── lib/
│   ├── auth/ (auth abstraction)
│   ├── supabase/ (client config)
│   ├── utils/
│   └── types/
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── useRealtime.ts
├── sql/
│   ├── schema.sql (JotForm submissions)
│   └── auth-schema.sql (users, roles, RLS)
└── public/
```

## Database Tables

1. **users** - User accounts with roles
2. **counselor_profiles** - Additional counselor info
3. **counselee_profiles** - Counselee info + intake form link
4. **form_assignments** - Links forms to counselors
5. **homework** - Homework assignments and submissions
6. **messages** - Chat messages
7. **activity_log** - Audit trail
8. **jotform_submissions** - Intake forms from JotForm (existing)

## Authentication Flow

1. **Initial Setup**: Admin creates counselor accounts manually
2. **Counselor Login**: Counselor logs in with email/password
3. **Counselee Creation**: Counselor generates credentials for counselee
4. **Counselee Login**: Counselee receives login credentials via email/SMS
5. **Session Management**: JWT tokens with role claims
6. **Route Protection**: Middleware checks role before rendering

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control (RBAC)
- Data isolation (counselors only see assigned counselees)
- Activity logging
- Secure credential generation
- Auth abstraction for future migration

## Next Steps

Start with Phase 2 by creating the Next.js project. Would you like me to proceed?
