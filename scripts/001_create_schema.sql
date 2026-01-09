-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('tradie', 'admin')),
  company_name TEXT,
  abn TEXT,
  electrical_license TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create installations table
CREATE TABLE IF NOT EXISTS public.installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tradie_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  site_address TEXT NOT NULL,
  site_suburb TEXT,
  site_state TEXT,
  site_postcode TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  installation_date DATE NOT NULL,
  system_size_kw DECIMAL(10, 2) NOT NULL,
  total_panels INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'credits_claimed')),
  credits_assigned BOOLEAN DEFAULT FALSE,
  assignment_date TIMESTAMP WITH TIME ZONE,
  signature_data TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create panels table to store individual panel data
CREATE TABLE IF NOT EXISTS public.panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  wattage INTEGER,
  serial_image_url TEXT,
  installation_image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance documents table
CREATE TABLE IF NOT EXISTS public.compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('stc_form', 'assignment_form', 'compliance_report', 'other')),
  document_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES public.profiles(id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Tradies can create their own installations"
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
CREATE POLICY "Users can view panels for their installations"
  ON public.panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = panels.installation_id
      AND installations.tradie_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Tradies can insert panels for their installations"
  ON public.panels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Tradies can update panels for their installations"
  ON public.panels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = panels.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

-- RLS Policies for compliance_documents
CREATE POLICY "Users can view compliance docs for their installations"
  ON public.compliance_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = compliance_documents.installation_id
      AND installations.tradie_id = auth.uid()
    )
    OR
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

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tradie')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_installations_tradie_id ON public.installations(tradie_id);
CREATE INDEX IF NOT EXISTS idx_installations_status ON public.installations(status);
CREATE INDEX IF NOT EXISTS idx_panels_installation_id ON public.panels(installation_id);
CREATE INDEX IF NOT EXISTS idx_panels_serial_number ON public.panels(serial_number);
CREATE INDEX IF NOT EXISTS idx_compliance_docs_installation_id ON public.compliance_documents(installation_id);
