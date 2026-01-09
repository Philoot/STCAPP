-- Create calculations table to store user's STC calculations
CREATE TABLE IF NOT EXISTS public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_size DECIMAL(10, 2) NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  zone INTEGER NOT NULL,
  stc_value DECIMAL(10, 2) NOT NULL,
  total_stcs INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) for public access
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view all calculations
CREATE POLICY "calculations_select_all"
  ON public.calculations FOR SELECT
  USING (true);

-- Allow anyone to insert calculations
CREATE POLICY "calculations_insert_all"
  ON public.calculations FOR INSERT
  WITH CHECK (true);
