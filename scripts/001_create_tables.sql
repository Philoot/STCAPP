-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  abn TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tradie')) DEFAULT 'tradie',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create installations table
CREATE TABLE IF NOT EXISTS public.installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tradie_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  installation_address TEXT NOT NULL,
  installation_date DATE NOT NULL,
  postcode TEXT NOT NULL,
  state TEXT NOT NULL,
  total_stc_credits INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'processing', 'approved', 'rejected')) DEFAULT 'draft',
  rights_assigned BOOLEAN DEFAULT FALSE,
  rights_assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create panels table for individual panel data
CREATE TABLE IF NOT EXISTS public.panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  serial_number_image_url TEXT NOT NULL,
  installation_image_url TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  wattage INTEGER NOT NULL,
  stc_rating INTEGER NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rights assignments table for legal documentation
CREATE TABLE IF NOT EXISTS public.rights_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  tradie_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  terms_version TEXT NOT NULL DEFAULT '1.0'
);

-- Create compliance documents table
CREATE TABLE IF NOT EXISTS public.compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('assignment_form', 'installation_certificate', 'stc_claim')),
  document_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_to_regulator BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rights_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for installations
CREATE POLICY "Tradies can view their own installations"
  ON public.installations FOR SELECT
  USING (tradie_id = auth.uid());

CREATE POLICY "Tradies can insert their own installations"
  ON public.installations FOR INSERT
  WITH CHECK (tradie_id = auth.uid());

CREATE POLICY "Tradies can update their own installations"
  ON public.installations FOR UPDATE
  USING (tradie_id = auth.uid());

CREATE POLICY "Admins can view all installations"
  ON public.installations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all installations"
  ON public.installations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for panels
CREATE POLICY "Tradies can view panels from their installations"
  ON public.panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = panels.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Tradies can insert panels to their installations"
  ON public.panels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Tradies can update panels in their installations"
  ON public.panels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = panels.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all panels"
  ON public.panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all panels"
  ON public.panels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for rights_assignments
CREATE POLICY "Tradies can view their own rights assignments"
  ON public.rights_assignments FOR SELECT
  USING (tradie_id = auth.uid());

CREATE POLICY "Tradies can insert their own rights assignments"
  ON public.rights_assignments FOR INSERT
  WITH CHECK (tradie_id = auth.uid());

CREATE POLICY "Admins can view all rights assignments"
  ON public.rights_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for compliance_documents
CREATE POLICY "Tradies can view documents for their installations"
  ON public.compliance_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = compliance_documents.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all compliance documents"
  ON public.compliance_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert compliance documents"
  ON public.compliance_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update compliance documents"
  ON public.compliance_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_installations_tradie_id ON public.installations(tradie_id);
CREATE INDEX idx_installations_status ON public.installations(status);
CREATE INDEX idx_panels_installation_id ON public.panels(installation_id);
CREATE INDEX idx_rights_assignments_installation_id ON public.rights_assignments(installation_id);
CREATE INDEX idx_compliance_documents_installation_id ON public.compliance_documents(installation_id);
