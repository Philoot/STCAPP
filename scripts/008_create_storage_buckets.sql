-- Create storage bucket for documents (bank verification, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create storage bucket for panel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('panel-images', 'panel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for panel images bucket
CREATE POLICY "Users can upload panel images for their installations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'panel-images' AND
  EXISTS (
    SELECT 1 FROM public.installations
    WHERE id = (storage.foldername(name))[1]::uuid
    AND tradie_id = auth.uid()
  )
);

CREATE POLICY "Users can view panel images from their installations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'panel-images' AND
  EXISTS (
    SELECT 1 FROM public.installations
    WHERE id = (storage.foldername(name))[1]::uuid
    AND tradie_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all panel images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'panel-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
