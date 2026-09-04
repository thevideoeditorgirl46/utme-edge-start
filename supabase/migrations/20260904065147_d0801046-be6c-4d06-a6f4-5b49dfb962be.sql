-- SUBJECTS
CREATE TABLE public.practice_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.practice_subjects TO authenticated;
GRANT ALL ON public.practice_subjects TO service_role;
ALTER TABLE public.practice_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects readable by signed in" ON public.practice_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage subjects" ON public.practice_subjects FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(),'admin'::app_role));

-- TOPICS
CREATE TABLE public.practice_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.practice_subjects(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_id, slug)
);
GRANT SELECT ON public.practice_topics TO authenticated;
GRANT ALL ON public.practice_topics TO service_role;
ALTER TABLE public.practice_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics readable by signed in" ON public.practice_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage topics" ON public.practice_topics FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(),'admin'::app_role));

-- QUESTION BANK
CREATE TYPE public.question_status AS ENUM ('draft','pending','approved','published','archived');

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.practice_topics(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation text,
  image_url text,
  source text,
  status public.question_status NOT NULL DEFAULT 'pending',
  revision integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX questions_topic_status_idx ON public.questions (topic_id, status, sort_order);
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage questions bank" ON public.questions FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.question_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  revision integer NOT NULL,
  snapshot jsonb NOT NULL,
  edited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, revision)
);
GRANT ALL ON public.question_revisions TO service_role;
GRANT SELECT ON public.question_revisions TO authenticated;
ALTER TABLE public.question_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read revisions" ON public.question_revisions FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role));

-- STUDENT-OWNED DATA
CREATE TABLE public.question_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);
GRANT SELECT, INSERT, DELETE ON public.question_bookmarks TO authenticated;
GRANT ALL ON public.question_bookmarks TO service_role;
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookmarks" ON public.question_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.question_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_notes TO authenticated;
GRANT ALL ON public.question_notes TO service_role;
ALTER TABLE public.question_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.question_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.practice_topics(id) ON DELETE CASCADE,
  selected_option text NOT NULL CHECK (selected_option IN ('A','B','C','D')),
  is_correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);
CREATE INDEX question_attempts_user_topic_idx ON public.question_attempts (user_id, topic_id);
GRANT SELECT, INSERT, UPDATE ON public.question_attempts TO authenticated;
GRANT ALL ON public.question_attempts TO service_role;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own question attempts" ON public.question_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER practice_subjects_touch BEFORE UPDATE ON public.practice_subjects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER practice_topics_touch BEFORE UPDATE ON public.practice_topics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER questions_touch BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER question_notes_touch BEFORE UPDATE ON public.question_notes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER question_attempts_touch BEFORE UPDATE ON public.question_attempts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SUBJECTS + TOPICS SEED
INSERT INTO public.practice_subjects (slug, name, sort_order) VALUES
  ('mathematics','Mathematics',1),
  ('physics','Physics',2),
  ('chemistry','Chemistry',3),
  ('biology','Biology',4),
  ('english','English',5);

INSERT INTO public.practice_topics (subject_id, slug, name, sort_order)
SELECT s.id, t.slug, t.name, t.sort_order FROM public.practice_subjects s
JOIN (VALUES
  ('mathematics','number-bases','Number Bases',1),
  ('mathematics','algebra','Algebra',2),
  ('mathematics','indices-logarithms','Indices and Logarithms',3),
  ('mathematics','geometry','Geometry',4),
  ('mathematics','statistics','Statistics',5),
  ('physics','mechanics','Mechanics',1),
  ('physics','waves','Waves',2),
  ('physics','heat','Heat Energy',3),
  ('physics','electricity','Electricity',4),
  ('physics','optics','Optics',5),
  ('chemistry','atomic-structure','Atomic Structure',1),
  ('chemistry','chemical-bonding','Chemical Bonding',2),
  ('chemistry','acids-bases-salts','Acids, Bases and Salts',3),
  ('chemistry','organic-chemistry','Organic Chemistry',4),
  ('biology','cell-biology','Cell Biology',1),
  ('biology','ecology','Ecology',2),
  ('biology','genetics','Genetics',3),
  ('biology','nutrition','Nutrition',4),
  ('english','comprehension','Comprehension',1),
  ('english','lexis-structure','Lexis and Structure',2),
  ('english','synonyms-antonyms','Synonyms and Antonyms',3)
) AS t(subject_slug, slug, name, sort_order) ON t.subject_slug = s.slug;

-- DEVELOPMENT SAMPLE QUESTIONS (clearly marked, not official JAMB past questions)
INSERT INTO public.questions (topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, source, status, sort_order)
SELECT tp.id, q.prompt, q.a, q.b, q.c, q.d, q.correct, q.explanation, 'DEV SAMPLE — not an official JAMB past question', 'published', q.sort_order
FROM public.practice_topics tp
JOIN public.practice_subjects s ON s.id = tp.subject_id
JOIN (VALUES
  ('physics','mechanics','A body starts from rest and accelerates uniformly at 4 m/s^2 for 5 s. What is its final velocity?','10 m/s','15 m/s','20 m/s','25 m/s','C','Using v = u + at with u = 0, a = 4 m/s^2 and t = 5 s gives v = 0 + 4 x 5 = 20 m/s. Remember: for a body starting from rest, u = 0.',1),
  ('physics','mechanics','The unit of momentum is','N/s','kg m/s','kg m/s^2','J s^-1','B','Momentum = mass x velocity, so its unit is kg x m/s = kg m/s. Remember: force is the rate of change of momentum, so N = kg m/s^2.',2),
  ('physics','mechanics','A force of 20 N acts on a mass of 5 kg. The acceleration produced is','2 m/s^2','4 m/s^2','5 m/s^2','100 m/s^2','B','From F = ma, a = F/m = 20/5 = 4 m/s^2.',3),
  ('mathematics','algebra','If 3x - 7 = 11, find x.','4','5','6','7','C','Add 7 to both sides: 3x = 18. Divide by 3: x = 6.',1),
  ('mathematics','algebra','Factorise x^2 - 9.','(x-3)(x-3)','(x+3)(x+3)','(x-9)(x+1)','(x-3)(x+3)','D','x^2 - 9 is a difference of two squares: a^2 - b^2 = (a-b)(a+b) with a = x and b = 3.',2),
  ('mathematics','number-bases','Convert 1101 in base 2 to base 10.','11','12','13','14','C','1101(2) = 1x8 + 1x4 + 0x2 + 1x1 = 13.',1),
  ('chemistry','atomic-structure','The number of protons in an atom is called its','mass number','atomic number','nucleon number','valency','B','The atomic number is the number of protons in the nucleus and identifies the element.',1),
  ('biology','cell-biology','The powerhouse of the cell is the','ribosome','nucleus','mitochondrion','vacuole','C','Mitochondria release energy as ATP during respiration, which is why they are called the powerhouse of the cell.',1),
  ('english','synonyms-antonyms','Choose the word nearest in meaning to ABUNDANT.','scarce','plentiful','tiny','costly','B','Abundant means existing in large quantity, so plentiful is closest in meaning. Scarce is its opposite.',1)
) AS q(subject_slug, topic_slug, prompt, a, b, c, d, correct, explanation, sort_order)
  ON q.subject_slug = s.slug AND q.topic_slug = tp.slug;

INSERT INTO public.question_revisions (question_id, revision, snapshot)
SELECT id, 1, to_jsonb(q) FROM public.questions q;