-- ============ settings ============
CREATE TABLE public.verification_settings (
  id integer PRIMARY KEY DEFAULT 1,
  friend_points integer NOT NULL DEFAULT 20,
  group_points integer NOT NULL DEFAULT 50,
  required_points integer NOT NULL DEFAULT 100,
  auto_approve_enabled boolean NOT NULL DEFAULT true,
  auto_approve_min_confidence numeric NOT NULL DEFAULT 0.85,
  auto_approve_max_fraud numeric NOT NULL DEFAULT 0.20,
  auto_reject_min_fraud numeric NOT NULL DEFAULT 0.90,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.verification_settings TO authenticated;
GRANT ALL ON public.verification_settings TO service_role;
ALTER TABLE public.verification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings readable by signed in" ON public.verification_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins write settings" ON public.verification_settings
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.verification_settings (id) VALUES (1);

-- ============ share_verifications ============
CREATE TABLE public.share_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  share_type text NOT NULL CHECK (share_type IN ('friend','group')),
  claimed_points integer NOT NULL DEFAULT 0,
  image_path text NOT NULL,
  image_hash text,
  perceptual_hash text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','needs_review')),
  automated_score numeric,
  automated_recommendation text,
  verification_method text NOT NULL DEFAULT 'MANUAL',
  fraud_score numeric NOT NULL DEFAULT 0,
  fraud_flags text[] NOT NULL DEFAULT '{}',
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX share_verifications_student_idx ON public.share_verifications (student_id, created_at DESC);
CREATE INDEX share_verifications_status_idx ON public.share_verifications (status, created_at DESC);
CREATE INDEX share_verifications_hash_idx ON public.share_verifications (image_hash);
CREATE INDEX share_verifications_phash_idx ON public.share_verifications (perceptual_hash);

GRANT SELECT, INSERT ON public.share_verifications TO authenticated;
GRANT UPDATE ON public.share_verifications TO authenticated;
GRANT ALL ON public.share_verifications TO service_role;
ALTER TABLE public.share_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read own verifications" ON public.share_verifications
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "students insert own verifications" ON public.share_verifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id AND status = 'pending');
CREATE POLICY "admins read all verifications" ON public.share_verifications
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins update verifications" ON public.share_verifications
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- students may never set privileged fields on insert
CREATE OR REPLACE FUNCTION public.share_verifications_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.verification_settings%ROWTYPE;
BEGIN
  SELECT * INTO s FROM public.verification_settings WHERE id = 1;
  IF TG_OP = 'INSERT' THEN
    IF NOT private.has_role(auth.uid(), 'admin'::app_role) THEN
      NEW.status := 'pending';
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
    END IF;
    NEW.claimed_points := CASE WHEN NEW.share_type = 'group' THEN s.group_points ELSE s.friend_points END;
  ELSE
    NEW.claimed_points := OLD.claimed_points;
    NEW.student_id := OLD.student_id;
    NEW.share_type := OLD.share_type;
    NEW.image_path := OLD.image_path;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := now();
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NOT private.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can change verification status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER share_verifications_guard_trg
  BEFORE INSERT OR UPDATE ON public.share_verifications
  FOR EACH ROW EXECUTE FUNCTION public.share_verifications_guard();

-- ============ authoritative points + unlock ============
CREATE OR REPLACE FUNCTION public.verified_share_points(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(claimed_points), 0)::int
  FROM public.share_verifications
  WHERE student_id = _user_id AND status = 'approved';
$$;
GRANT EXECUTE ON FUNCTION public.verified_share_points(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.sync_reward_unlock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.student_id, OLD.student_id);
  req integer;
  pts integer;
BEGIN
  SELECT required_points INTO req FROM public.verification_settings WHERE id = 1;
  pts := public.verified_share_points(target);
  IF pts >= req THEN
    INSERT INTO public.reward_unlocks (user_id, source)
    VALUES (target, 'flyer_share')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.reward_unlocks WHERE user_id = target AND source = 'flyer_share';
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER share_verifications_unlock_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.share_verifications
  FOR EACH ROW EXECUTE FUNCTION public.sync_reward_unlock();

-- ============ audit log ============
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  submission_id uuid,
  target_user_id uuid,
  previous_status text,
  new_status text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));