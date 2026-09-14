INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "admins upload question images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'question-images'
  AND private.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "admins delete question images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'question-images'
  AND private.has_role(auth.uid(), 'admin'::app_role)
);
