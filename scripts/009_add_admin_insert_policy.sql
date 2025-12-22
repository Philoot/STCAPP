-- Add policy to allow admins to create installations on behalf of tradies
-- This allows admins to use the "New Installation" form to create installations for any tradie

-- Create policy for admins to insert installations
CREATE POLICY "Admins can insert installations"
ON installations
FOR INSERT
WITH CHECK (is_admin());
