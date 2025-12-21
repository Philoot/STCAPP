-- Fix infinite recursion in profiles RLS policies
-- The issue: "Admins can view all profiles" policy checks profiles table to see if user is admin
-- Solution: Use a security definer function that bypasses RLS

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function that can check admin status without RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Recreate admin policies using the security definer function
-- This breaks the recursion because the function runs with elevated privileges

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (is_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Also fix any other policies that might have similar issues
-- Drop and recreate admin policies for installations
DROP POLICY IF EXISTS "Admins can view all installations" ON installations;
CREATE POLICY "Admins can view all installations"
ON installations
FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all installations" ON installations;
CREATE POLICY "Admins can update all installations"
ON installations
FOR UPDATE
USING (is_admin());

-- Fix compliance documents admin policy
DROP POLICY IF EXISTS "Admins can insert compliance documents" ON compliance_documents;
CREATE POLICY "Admins can insert compliance documents"
ON compliance_documents
FOR INSERT
WITH CHECK (is_admin());
