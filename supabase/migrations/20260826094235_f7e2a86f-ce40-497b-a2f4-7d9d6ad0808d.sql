-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp_number text NOT NULL,
  telegram_username text,
  registration_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX profiles_email_lower_idx ON public.profiles (lower(email));
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "admin profile read" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- registrations
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  utme_year text NOT NULL,
  written_before boolean NOT NULL DEFAULT false,
  previous_score integer,
  challenge_areas text[] NOT NULL DEFAULT '{}',
  subjects text[] NOT NULL DEFAULT '{}',
  improvement_goal text,
  referral_source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own registration read" ON public.registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin registration read" ON public.registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own registration insert" ON public.registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own registration update" ON public.registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- class links (singleton row)
CREATE TABLE public.class_links (
  id integer PRIMARY KEY DEFAULT 1,
  whatsapp_url text,
  telegram_url text,
  flyer_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_links_singleton CHECK (id = 1)
);
GRANT SELECT ON public.class_links TO anon, authenticated;
GRANT ALL ON public.class_links TO service_role;
GRANT INSERT, UPDATE ON public.class_links TO authenticated;
ALTER TABLE public.class_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class links public read" ON public.class_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write class links" ON public.class_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.class_links (id) VALUES (1);

-- success stories
CREATE TABLE public.success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  utme_score integer NOT NULL,
  photo_url text,
  result_image_url text,
  excerpt text NOT NULL,
  full_story text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.success_stories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.success_stories TO authenticated;
GRANT ALL ON public.success_stories TO service_role;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published stories public read" ON public.success_stories FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins read all stories" ON public.success_stories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write stories" ON public.success_stories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- sharing submissions
CREATE TABLE public.sharing_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  verification_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT ON public.sharing_submissions TO authenticated;
GRANT UPDATE ON public.sharing_submissions TO authenticated;
GRANT ALL ON public.sharing_submissions TO service_role;
ALTER TABLE public.sharing_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own submissions read" ON public.sharing_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin submissions read" ON public.sharing_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own submissions insert" ON public.sharing_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins update submissions" ON public.sharing_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- reward unlocks
CREATE TABLE public.reward_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'flyer_share',
  unlocked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reward_unlocks TO authenticated;
GRANT INSERT, DELETE ON public.reward_unlocks TO authenticated;
GRANT ALL ON public.reward_unlocks TO service_role;
ALTER TABLE public.reward_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own unlock read" ON public.reward_unlocks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin unlock read" ON public.reward_unlocks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage unlocks" ON public.reward_unlocks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- practice
CREATE TABLE public.practice_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text,
  description text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_sets TO authenticated;
GRANT ALL ON public.practice_sets TO service_role;
ALTER TABLE public.practice_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published sets read" ON public.practice_sets FOR SELECT TO authenticated USING (published = true);
CREATE POLICY "admins write sets" ON public.practice_sets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.practice_sets(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL,
  explanation text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_questions TO authenticated;
GRANT ALL ON public.practice_questions TO service_role;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage questions" ON public.practice_questions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.practice_questions(id) ON DELETE CASCADE,
  selected_option text NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.practice_attempts TO authenticated;
GRANT ALL ON public.practice_attempts TO service_role;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts read" ON public.practice_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin attempts read" ON public.practice_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own attempts insert" ON public.practice_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);