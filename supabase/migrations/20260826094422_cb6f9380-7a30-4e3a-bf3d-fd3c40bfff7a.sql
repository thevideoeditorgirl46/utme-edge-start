CREATE POLICY "own share proof upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'share-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "own share proof read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'share-proofs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));