CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin profile read" ON public.profiles;
CREATE POLICY "admin profile read" ON public.profiles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin registration read" ON public.registrations;
CREATE POLICY "admin registration read" ON public.registrations FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins write class links" ON public.class_links;
CREATE POLICY "admins write class links" ON public.class_links FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins read all stories" ON public.success_stories;
CREATE POLICY "admins read all stories" ON public.success_stories FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins write stories" ON public.success_stories;
CREATE POLICY "admins write stories" ON public.success_stories FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin submissions read" ON public.sharing_submissions;
CREATE POLICY "admin submissions read" ON public.sharing_submissions FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update submissions" ON public.sharing_submissions;
CREATE POLICY "admins update submissions" ON public.sharing_submissions FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin unlock read" ON public.reward_unlocks;
CREATE POLICY "admin unlock read" ON public.reward_unlocks FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage unlocks" ON public.reward_unlocks;
CREATE POLICY "admins manage unlocks" ON public.reward_unlocks FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins write sets" ON public.practice_sets;
CREATE POLICY "admins write sets" ON public.practice_sets FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage questions" ON public.practice_questions;
CREATE POLICY "admins manage questions" ON public.practice_questions FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin attempts read" ON public.practice_attempts;
CREATE POLICY "admin attempts read" ON public.practice_attempts FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own share proof read" ON storage.objects;
CREATE POLICY "own share proof read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'share-proofs' AND ((storage.foldername(name))[1] = auth.uid()::text OR private.has_role(auth.uid(), 'admin')));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
