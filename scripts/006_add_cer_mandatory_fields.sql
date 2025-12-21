-- Add mandatory CER fields to installations table
ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS nmi TEXT,
  ADD COLUMN IF NOT EXISTS system_mounting_type TEXT CHECK (system_mounting_type IN ('building_or_structure', 'ground_mounted')),
  ADD COLUMN IF NOT EXISTS installation_type TEXT CHECK (installation_type IN ('new_system', 'replacement_system', 'extension_system', 'additional_system')),
  ADD COLUMN IF NOT EXISTS is_complete_unit BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS deeming_period INTEGER CHECK (deeming_period IN (1, 5)),
  ADD COLUMN IF NOT EXISTS rated_power_output_kw DECIMAL(10, 3),
  ADD COLUMN IF NOT EXISTS connection_type TEXT CHECK (connection_type IN ('grid_without_battery', 'grid_with_battery', 'standalone')),
  ADD COLUMN IF NOT EXISTS previous_system_failed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS previous_accreditation_code TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT,
  ADD COLUMN IF NOT EXISTS is_multi_story BOOLEAN,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS additional_system_info TEXT;

-- Create solar_retailer table for retailer information
CREATE TABLE IF NOT EXISTS public.solar_retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  abn TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create retailer_representatives table
CREATE TABLE IF NOT EXISTS public.retailer_representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES public.solar_retailers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add retailer reference to installations
ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS retailer_id UUID REFERENCES public.solar_retailers(id),
  ADD COLUMN IF NOT EXISTS retailer_representative_id UUID REFERENCES public.retailer_representatives(id);

-- Create electricians table
CREATE TABLE IF NOT EXISTS public.electricians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  license_state TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create designers table
CREATE TABLE IF NOT EXISTS public.designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  accreditation_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add electrician and designer references to installations
ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS electrician_id UUID REFERENCES public.electricians(id),
  ADD COLUMN IF NOT EXISTS designer_id UUID REFERENCES public.designers(id);

-- Create battery_systems table for battery storage details
CREATE TABLE IF NOT EXISTS public.battery_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  capacity_kwh DECIMAL(10, 2),
  is_aggregated_control BOOLEAN,
  installer_changed_settings BOOLEAN,
  serial_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inverters table for multiple inverter support
CREATE TABLE IF NOT EXISTS public.inverters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  manufacturer TEXT NOT NULL,
  series TEXT NOT NULL,
  model_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  capacity_kw DECIMAL(10, 3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add CEC approval fields to panels
ALTER TABLE public.panels
  ADD COLUMN IF NOT EXISTS cec_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cec_module_brand TEXT,
  ADD COLUMN IF NOT EXISTS cec_module_model TEXT;

-- Create retailer_written_statements table for compliance tracking
CREATE TABLE IF NOT EXISTS public.retailer_written_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES public.solar_retailers(id),
  statement_type TEXT NOT NULL CHECK (statement_type IN (
    'installer_details',
    'performance_warranty',
    'completion_and_generation',
    'feed_in_tariff_info',
    'conflict_of_interest',
    'eligibility_declaration'
  )),
  statement_text TEXT NOT NULL,
  signed_by TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE
);

-- Create owner_details table (separate from customer)
CREATE TABLE IF NOT EXISTS public.owner_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  owner_type TEXT CHECK (owner_type IN ('individual', 'company', 'trust', 'other')),
  full_name TEXT NOT NULL,
  company_name TEXT,
  abn TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_address TEXT NOT NULL,
  postal_suburb TEXT NOT NULL,
  postal_state TEXT NOT NULL,
  postal_postcode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_log table for tracking validation and verification
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN (
    'panel_serial_verification',
    'rec_registry_check',
    'document_validation',
    'retailer_verification',
    'electrician_verification'
  )),
  status TEXT NOT NULL CHECK (status IN ('pending', 'passed', 'failed', 'warning')),
  details JSONB,
  performed_by UUID REFERENCES public.profiles(id),
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.solar_retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electricians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battery_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inverters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_written_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables (admins can manage, tradies can view their own)
CREATE POLICY "Admins can manage solar retailers"
  ON public.solar_retailers FOR ALL
  USING (is_admin());

CREATE POLICY "Tradies can view solar retailers"
  ON public.solar_retailers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage retailer representatives"
  ON public.retailer_representatives FOR ALL
  USING (is_admin());

CREATE POLICY "Tradies can view retailer representatives"
  ON public.retailer_representatives FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage electricians"
  ON public.electricians FOR ALL
  USING (is_admin());

CREATE POLICY "Tradies can view electricians"
  ON public.electricians FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage designers"
  ON public.designers FOR ALL
  USING (is_admin());

CREATE POLICY "Tradies can view designers"
  ON public.designers FOR SELECT
  USING (true);

CREATE POLICY "Tradies can manage battery systems for their installations"
  ON public.battery_systems FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = battery_systems.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all battery systems"
  ON public.battery_systems FOR SELECT
  USING (is_admin());

CREATE POLICY "Tradies can manage inverters for their installations"
  ON public.inverters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = inverters.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all inverters"
  ON public.inverters FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage retailer statements"
  ON public.retailer_written_statements FOR ALL
  USING (is_admin());

CREATE POLICY "Tradies can view statements for their installations"
  ON public.retailer_written_statements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = retailer_written_statements.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Tradies can manage owner details for their installations"
  ON public.owner_details FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = owner_details.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all owner details"
  ON public.owner_details FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage audit logs"
  ON public.audit_log FOR ALL
  USING (is_admin());

CREATE POLICY "Tradies can view audit logs for their installations"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = audit_log.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_solar_retailers_abn ON public.solar_retailers(abn);
CREATE INDEX idx_electricians_license ON public.electricians(license_number);
CREATE INDEX idx_battery_systems_installation_id ON public.battery_systems(installation_id);
CREATE INDEX idx_inverters_installation_id ON public.inverters(installation_id);
CREATE INDEX idx_retailer_statements_installation_id ON public.retailer_written_statements(installation_id);
CREATE INDEX idx_owner_details_installation_id ON public.owner_details(installation_id);
CREATE INDEX idx_audit_log_installation_id ON public.audit_log(installation_id);
CREATE INDEX idx_audit_log_status ON public.audit_log(status);
