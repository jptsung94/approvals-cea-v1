-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'steward', 'producer');
CREATE TYPE public.asset_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'auto_approved');
CREATE TYPE public.asset_type AS ENUM ('dataset', 'api', 'stream', 'model');
CREATE TYPE public.data_classification AS ENUM ('public', 'internal', 'confidential');
CREATE TYPE public.comment_type AS ENUM ('feedback', 'question', 'approval');
CREATE TYPE public.timeline_event_type AS ENUM ('submitted', 'review_started', 'comment', 'approved', 'rejected', 'escalated', 'reassigned');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Assets/Submissions table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  status asset_status NOT NULL DEFAULT 'pending',
  description TEXT,
  category TEXT,
  producer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Technical metadata
  format TEXT,
  size TEXT,
  endpoint TEXT,
  documentation_url TEXT,
  
  -- Data governance
  has_personal_data BOOLEAN DEFAULT false,
  data_classification data_classification NOT NULL DEFAULT 'internal',
  retention_period TEXT,
  
  -- Approval metadata
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  auto_approval_eligible BOOLEAN DEFAULT false,
  sla_target TEXT DEFAULT '5 business days',
  current_step TEXT,
  governance_checks TEXT,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- Additional metadata as JSONB for flexibility
  metadata JSONB DEFAULT '{}'::jsonb,
  
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Approvers assigned to assets
CREATE TABLE public.asset_approvers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approver_name TEXT NOT NULL,
  approver_role TEXT,
  is_required BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(asset_id, approver_id)
);

-- Comments on assets
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  comment_type comment_type NOT NULL DEFAULT 'feedback',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline events for audit trail
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  event_type timeline_event_type NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delegates for approval authority
CREATE TABLE public.delegates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delegator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegate_name TEXT NOT NULL,
  delegate_email TEXT NOT NULL,
  assigned_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(delegator_id, delegate_id)
);

-- Auto-approval rules
CREATE TABLE public.approval_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  applies_to TEXT[] DEFAULT ARRAY[]::TEXT[],
  criteria JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_assets_producer ON public.assets(producer_id);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_submitted_at ON public.assets(submitted_at);
CREATE INDEX idx_asset_approvers_asset ON public.asset_approvers(asset_id);
CREATE INDEX idx_asset_approvers_approver ON public.asset_approvers(approver_id);
CREATE INDEX idx_comments_asset ON public.comments(asset_id);
CREATE INDEX idx_timeline_events_asset ON public.timeline_events(asset_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_rules ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "User roles are viewable by authenticated users"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for assets
CREATE POLICY "Producers can view their own assets"
  ON public.assets FOR SELECT
  USING (auth.uid() = producer_id);

CREATE POLICY "Stewards and admins can view all assets"
  ON public.assets FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'steward') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Producers can create assets"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = producer_id AND
    (public.has_role(auth.uid(), 'producer') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Producers can update their pending/rejected assets"
  ON public.assets FOR UPDATE
  USING (
    auth.uid() = producer_id AND
    status IN ('pending', 'rejected')
  );

CREATE POLICY "Stewards and admins can update assets"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'steward') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for asset_approvers
CREATE POLICY "Approvers viewable by asset participants"
  ON public.asset_approvers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE id = asset_id AND producer_id = auth.uid()
    ) OR
    approver_id = auth.uid() OR
    public.has_role(auth.uid(), 'steward') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Stewards and admins can manage approvers"
  ON public.asset_approvers FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'steward') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for comments
CREATE POLICY "Comments viewable by asset participants"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE id = asset_id AND producer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.asset_approvers
      WHERE asset_id = comments.asset_id AND approver_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'steward') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can create comments on relevant assets"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    (
      EXISTS (
        SELECT 1 FROM public.assets
        WHERE id = asset_id AND producer_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.asset_approvers
        WHERE asset_id = comments.asset_id AND approver_id = auth.uid()
      ) OR
      public.has_role(auth.uid(), 'steward') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

-- RLS Policies for timeline_events
CREATE POLICY "Timeline events viewable by asset participants"
  ON public.timeline_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE id = asset_id AND producer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.asset_approvers
      WHERE asset_id = timeline_events.asset_id AND approver_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'steward') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can create timeline events"
  ON public.timeline_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for delegates
CREATE POLICY "Delegates viewable by delegator and delegate"
  ON public.delegates FOR SELECT
  TO authenticated
  USING (
    auth.uid() = delegator_id OR
    auth.uid() = delegate_id OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can manage their own delegates"
  ON public.delegates FOR ALL
  TO authenticated
  USING (auth.uid() = delegator_id);

-- RLS Policies for approval_rules
CREATE POLICY "Rules viewable by stewards and admins"
  ON public.approval_rules FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'steward') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can manage rules"
  ON public.approval_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at on relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_rules_updated_at
  BEFORE UPDATE ON public.approval_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();