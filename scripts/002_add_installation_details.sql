-- Add installation_details table to capture full CER/installer/owner metadata
CREATE TABLE IF NOT EXISTS public.installation_details (
  installation_id UUID PRIMARY KEY REFERENCES public.installations(id) ON DELETE CASCADE,
  installer JSONB,
  installation JSONB,
  pv JSONB,
  inverter JSONB,
  battery JSONB,
  owner JSONB,
  electrician JSONB,
  designer JSONB,
  retailer JSONB,
  accreditation JSONB,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.installation_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tradies can view their own installation details"
  ON public.installation_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = installation_details.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Tradies can insert their own installation details"
  ON public.installation_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Tradies can update their own installation details"
  ON public.installation_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.installations
      WHERE installations.id = installation_details.installation_id
      AND installations.tradie_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all installation details"
  ON public.installation_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all installation details"
  ON public.installation_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_installation_details_installation_id
  ON public.installation_details(installation_id);
