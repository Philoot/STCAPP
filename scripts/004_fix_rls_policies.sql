-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all installations" ON public.installations;
DROP POLICY IF EXISTS "Admins can update all installations" ON public.installations;
DROP POLICY IF EXISTS "Admins can view all panels" ON public.panels;
DROP POLICY IF EXISTS "Admins can update all panels" ON public.panels;
DROP POLICY IF EXISTS "Admins can view all rights assignments" ON public.rights_assignments;
DROP POLICY IF EXISTS "Admins can view all compliance documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Admins can insert compliance documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Admins can update compliance documents" ON public.compliance_documents;

-- Create a security definer function to check if user is admin
-- This function runs with elevated privileges and breaks the recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Allow users to insert their own profile on signup
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all installations"
  ON public.installations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all installations"
  ON public.installations FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can view all panels"
  ON public.panels FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all panels"
  ON public.panels FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can view all rights assignments"
  ON public.rights_assignments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all compliance documents"
  ON public.compliance_documents FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert compliance documents"
  ON public.compliance_documents FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update compliance documents"
  ON public.compliance_documents FOR UPDATE
  USING (public.is_admin());
