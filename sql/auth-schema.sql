-- Counseling Portal Database Schema
-- This schema supports the complete counseling workflow with proper role-based access

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User roles in the system
CREATE TYPE user_role AS ENUM ('admin', 'counselor', 'counselee');

-- Assignment status tracking
CREATE TYPE assignment_status AS ENUM ('pending', 'active', 'completed', 'archived');

-- Homework/resource status
CREATE TYPE homework_status AS ENUM ('assigned', 'in_progress', 'completed', 'reviewed');

-- Message read status
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'counselee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Counselor profiles (additional info for counselors)
CREATE TABLE public.counselor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialties TEXT[],
  bio TEXT,
  max_counselees INTEGER DEFAULT 10,
  is_accepting_new BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Counselee profiles (linked to intake forms)
CREATE TABLE public.counselee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  intake_form_id UUID REFERENCES public.jotform_submissions(id),
  assigned_counselor_id UUID REFERENCES public.users(id),
  assignment_status assignment_status DEFAULT 'pending',
  assigned_at TIMESTAMPTZ,
  first_session_date TIMESTAMPTZ,
  notes TEXT,
  emergency_contact JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Form assignments (track which counselor is assigned to which intake form)
CREATE TABLE public.form_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_form_id UUID NOT NULL REFERENCES public.jotform_submissions(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES public.users(id),
  counselee_id UUID REFERENCES public.users(id),
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  status assignment_status DEFAULT 'pending',
  notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(intake_form_id, counselor_id)
);

-- Homework and resources
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  due_date TIMESTAMPTZ,
  status homework_status DEFAULT 'assigned',
  file_urls TEXT[],
  submission_text TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  counselor_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages between counselor and counselee
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  read_at TIMESTAMPTZ,
  attachment_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activity log for audit trail
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_counselee_profiles_counselor ON public.counselee_profiles(assigned_counselor_id);
CREATE INDEX idx_counselee_profiles_status ON public.counselee_profiles(assignment_status);
CREATE INDEX idx_form_assignments_counselor ON public.form_assignments(counselor_id);
CREATE INDEX idx_form_assignments_counselee ON public.form_assignments(counselee_id);
CREATE INDEX idx_form_assignments_status ON public.form_assignments(status);
CREATE INDEX idx_homework_counselee ON public.homework(counselee_id);
CREATE INDEX idx_homework_counselor ON public.homework(counselor_id);
CREATE INDEX idx_homework_status ON public.homework(status);
CREATE INDEX idx_messages_counselee ON public.messages(counselee_id);
CREATE INDEX idx_messages_counselor ON public.messages(counselor_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Counselors can view their counselees"
  ON public.users FOR SELECT
  USING (
    role = 'counselee' AND
    EXISTS (
      SELECT 1 FROM public.counselee_profiles
      WHERE counselee_profiles.user_id = users.id
      AND counselee_profiles.assigned_counselor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert/update users"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Counselor profiles policies
CREATE POLICY "Counselors can view their own profile"
  ON public.counselor_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage counselor profiles"
  ON public.counselor_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Counselee profiles policies
CREATE POLICY "Counselees can view their own profile"
  ON public.counselee_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Counselors can view their assigned counselees"
  ON public.counselee_profiles FOR SELECT
  USING (assigned_counselor_id = auth.uid());

CREATE POLICY "Admins can manage all counselee profiles"
  ON public.counselee_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Form assignments policies
CREATE POLICY "Counselors can view their assignments"
  ON public.form_assignments FOR SELECT
  USING (counselor_id = auth.uid());

CREATE POLICY "Admins can manage all assignments"
  ON public.form_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Homework policies
CREATE POLICY "Counselees can view their homework"
  ON public.homework FOR SELECT
  USING (counselee_id = auth.uid());

CREATE POLICY "Counselees can update their homework submissions"
  ON public.homework FOR UPDATE
  USING (counselee_id = auth.uid())
  WITH CHECK (counselee_id = auth.uid());

CREATE POLICY "Counselors can manage homework for their counselees"
  ON public.homework FOR ALL
  USING (counselor_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = counselee_id OR
    auth.uid() = counselor_id
  );

CREATE POLICY "Counselors can send messages to their counselees"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.counselee_profiles
      WHERE user_id = counselee_id
      AND assigned_counselor_id = auth.uid()
    )
  );

CREATE POLICY "Counselees can send messages to their counselor"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.counselee_profiles
      WHERE user_id = auth.uid()
      AND assigned_counselor_id = counselor_id
    )
  );

CREATE POLICY "Users can update their own sent messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Activity log policies
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can insert activity logs"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counselor_profiles_updated_at
  BEFORE UPDATE ON public.counselor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counselee_profiles_updated_at
  BEFORE UPDATE ON public.counselee_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_assignments_updated_at
  BEFORE UPDATE ON public.form_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homework_updated_at
  BEFORE UPDATE ON public.homework
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'counselee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.counselor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.counselee_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.form_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;

-- ============================================================================
-- INITIAL ADMIN USER (Update this with your email)
-- ============================================================================

-- This will be run manually after first user signs up
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
