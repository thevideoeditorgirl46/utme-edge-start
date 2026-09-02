CREATE OR REPLACE FUNCTION public.share_verifications_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  s public.verification_settings%ROWTYPE;
  is_trusted boolean;
BEGIN
  SELECT * INTO s FROM public.verification_settings WHERE id = 1;
  is_trusted := auth.uid() IS NULL OR private.has_role(auth.uid(), 'admin'::app_role);

  IF TG_OP = 'INSERT' THEN
    IF NOT is_trusted THEN
      NEW.status := 'pending';
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
      NEW.automated_score := NULL;
      NEW.automated_recommendation := NULL;
      NEW.fraud_score := 0;
      NEW.fraud_flags := '{}';
    END IF;
    NEW.claimed_points := CASE WHEN NEW.share_type = 'group' THEN s.group_points ELSE s.friend_points END;
  ELSE
    NEW.claimed_points := OLD.claimed_points;
    NEW.student_id := OLD.student_id;
    NEW.share_type := OLD.share_type;
    NEW.image_path := OLD.image_path;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := now();
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT is_trusted THEN
      RAISE EXCEPTION 'Only admins can change verification status';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;