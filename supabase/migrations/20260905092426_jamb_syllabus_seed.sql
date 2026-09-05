-- =============================================================================
-- JAMB UTME Official Syllabus Seed (v3 — Exact Verified Topic Names)
-- Replaces ALL existing practice data with the official JAMB UTME syllabus.
-- Run in Supabase SQL Editor (service-role). Safe to run multiple times.
-- =============================================================================

-- 1. Clear existing data (cascade-safe order)
DELETE FROM questions;
DELETE FROM practice_topics;
DELETE FROM practice_subjects;

-- 2. Insert the 5 core JAMB UTME subjects
INSERT INTO practice_subjects (id, slug, name, sort_order) VALUES
  (gen_random_uuid(), 'mathematics', 'Mathematics',    1),
  (gen_random_uuid(), 'physics',     'Physics',        2),
  (gen_random_uuid(), 'chemistry',   'Chemistry',      3),
  (gen_random_uuid(), 'biology',     'Biology',        4),
  (gen_random_uuid(), 'english',     'Use of English', 5);

-- =============================================================================
-- 3. MATHEMATICS — exact JAMB syllabus (23 topics)
-- =============================================================================
INSERT INTO practice_topics (id, slug, name, subject_id, sort_order)
SELECT gen_random_uuid(), v.slug, v.name, s.id, v.n
FROM practice_subjects s,
(VALUES
  -- Section I: Number and Numeration
  ('number-bases',                       'Number bases',                                         1),
  ('fractions-decimals-approximations',  'Fractions, Decimals, Approximations and Percentages', 2),
  ('indices-logarithms-surds',           'Indices, Logarithms and Surds',                       3),
  ('sets',                               'Sets',                                                 4),
  -- Section II: Algebra
  ('polynomials',                        'Polynomials',                                          5),
  ('variation',                          'Variation',                                            6),
  ('inequalities',                       'Inequalities',                                         7),
  ('progression',                        'Progression',                                          8),
  ('binary-operations',                  'Binary Operations',                                    9),
  ('matrices-and-determinants',          'Matrices and Determinants',                           10),
  -- Section III: Geometry/Trigonometry
  ('euclidean-geometry',                 'Euclidean Geometry',                                  11),
  ('mensuration',                        'Mensuration',                                         12),
  ('loci',                               'Loci',                                                13),
  ('coordinate-geometry',                'Coordinate Geometry',                                 14),
  ('trigonometry',                       'Trigonometry',                                        15),
  -- Section IV: Calculus
  ('differentiation',                    'Differentiation',                                     16),
  ('application-of-differentiation',     'Application of differentiation',                      17),
  ('integration',                        'Integration',                                         18),
  -- Section V: Statistics
  ('representation-of-data',            'Representation of data',                              19),
  ('measures-of-location',              'Measures of Location',                                20),
  ('measures-of-dispersion',            'Measures of Dispersion',                              21),
  ('permutation-and-combination',        'Permutation and Combination',                         22),
  ('probability',                        'Probability',                                         23)
) AS v(slug, name, n)
WHERE s.slug = 'mathematics';

-- =============================================================================
-- 4. PHYSICS — exact JAMB syllabus (39 topics)
-- =============================================================================
INSERT INTO practice_topics (id, slug, name, subject_id, sort_order)
SELECT gen_random_uuid(), v.slug, v.name, s.id, v.n
FROM practice_subjects s,
(VALUES
  ('measurements-and-units',              'Measurements and Units',                                          1),
  ('scalars-and-vectors',                 'Scalars and Vectors',                                             2),
  ('motion',                              'Motion',                                                          3),
  ('gravitational-field',                 'Gravitational Field',                                             4),
  ('equilibrium-of-forces',               'Equilibrium of Forces',                                           5),
  ('work-energy-and-power',               'Work, Energy and Power',                                          6),
  ('friction',                            'Friction',                                                        7),
  ('simple-machines',                     'Simple Machines',                                                 8),
  ('elasticity',                          'Elasticity',                                                      9),
  ('pressure',                            'Pressure',                                                       10),
  ('liquids-at-rest',                     'Liquids at Rest',                                                11),
  ('temperature-and-measurement',         'Temperature and its Measurement',                                12),
  ('thermal-expansion',                   'Thermal Expansion',                                              13),
  ('gas-laws',                            'Gas Laws',                                                       14),
  ('quantity-of-heat',                    'Quantity of Heat',                                               15),
  ('change-of-state',                     'Change of State',                                                16),
  ('vapours',                             'Vapours',                                                        17),
  ('structure-of-matter-kinetic-theory',  'Structure of Matter and Kinetic Theory',                        18),
  ('heat-transfer',                       'Heat Transfer',                                                  19),
  ('waves',                               'Waves',                                                          20),
  ('propagation-of-sound-waves',          'Propagation of Sound Waves',                                     21),
  ('characteristics-of-sound-waves',      'Characteristics of Sound Waves',                                22),
  ('light-energy',                        'Light Energy',                                                   23),
  ('reflection-of-light',                 'Reflection of Light at Plane and Curved Surfaces',              24),
  ('refraction-of-light',                 'Refraction of Light Through Plane and Curved Surfaces',         25),
  ('optical-instruments',                 'Optical Instruments',                                            26),
  ('dispersion-of-light-and-colours',     'Dispersion of Light and Colours',                               27),
  ('electrostatics',                      'Electrostatics',                                                 28),
  ('capacitors',                          'Capacitors',                                                     29),
  ('electric-cells',                      'Electric Cells',                                                 30),
  ('current-electricity',                 'Current Electricity',                                            31),
  ('electrical-energy-and-power',         'Electrical Energy and Power',                                   32),
  ('magnets-and-magnetic-fields',         'Magnets and Magnetic Fields',                                   33),
  ('force-on-current-carrying-conductor', 'Force on a Current-Carrying Conductor in a Magnetic Field',     34),
  ('electromagnetic-induction',           'Electromagnetic Induction',                                     35),
  ('simple-ac-circuits',                  'Simple A.C. Circuits',                                          36),
  ('conduction-through-liquids-gases',    'Conduction of Electricity Through Liquids and Gases',          37),
  ('elementary-modern-physics',           'Elementary Modern Physics',                                     38),
  ('introductory-electronics',            'Introductory Electronics',                                      39)
) AS v(slug, name, n)
WHERE s.slug = 'physics';

-- =============================================================================
-- 5. CHEMISTRY — exact JAMB syllabus (18 topics)
-- =============================================================================
INSERT INTO practice_topics (id, slug, name, subject_id, sort_order)
SELECT gen_random_uuid(), v.slug, v.name, s.id, v.n
FROM practice_subjects s,
(VALUES
  ('separation-and-purification',    'Separation of mixtures and purification of chemical substances', 1),
  ('chemical-combination',           'Chemical combination',                                            2),
  ('kinetic-theory-and-gas-laws',    'Kinetic theory of matter and Gas Laws',                          3),
  ('atomic-structure-and-bonding',   'Atomic structure and bonding',                                   4),
  ('air',                            'Air',                                                             5),
  ('water',                          'Water',                                                           6),
  ('solubility',                     'Solubility',                                                      7),
  ('environmental-pollution',        'Environmental pollution',                                         8),
  ('acids-bases-and-salts',          'Acids, bases and salts',                                         9),
  ('oxidation-and-reduction',        'Oxidation and reduction',                                        10),
  ('electrolysis',                   'Electrolysis',                                                   11),
  ('energy-changes',                 'Energy changes',                                                  12),
  ('rates-of-chemical-reaction',     'Rates of chemical reaction',                                     13),
  ('chemical-equilibria',            'Chemical equilibria',                                            14),
  ('non-metals-and-compounds',       'Non-metals and their compounds',                                 15),
  ('metals-and-compounds',           'Metals and their compounds',                                     16),
  ('organic-compounds',              'Organic compounds',                                              17),
  ('chemistry-and-industry',         'Chemistry and industry',                                         18)
) AS v(slug, name, n)
WHERE s.slug = 'chemistry';

-- =============================================================================
-- 6. BIOLOGY — exact JAMB syllabus (23 topics)
-- =============================================================================
INSERT INTO practice_topics (id, slug, name, subject_id, sort_order)
SELECT gen_random_uuid(), v.slug, v.name, s.id, v.n
FROM practice_subjects s,
(VALUES
  ('living-organisms',                 'Living Organisms',                                       1),
  ('evolution-among-organisms',        'Evolution Among Organisms',                             2),
  ('variety-of-organisms',             'Variety of Organisms',                                  3),
  ('internal-structure-plant-mammal',  'Internal Structure of a Flowering Plant and a Mammal', 4),
  ('nutrition',                        'Nutrition',                                             5),
  ('transport',                        'Transport',                                             6),
  ('respiration',                      'Respiration',                                           7),
  ('excretion',                        'Excretion',                                             8),
  ('support-and-movement',             'Support and Movement',                                  9),
  ('reproduction',                     'Reproduction',                                         10),
  ('growth',                           'Growth',                                               11),
  ('coordination-and-control',         'Co-ordination and Control',                            12),
  ('factors-affecting-distribution',   'Factors Affecting Distribution of Organisms',          13),
  ('symbiotic-interactions',           'Symbiotic Interactions of Plants',                     14),
  ('natural-habitats',                 'Natural Habitats',                                     15),
  ('local-nigerian-biomes',            'Local (Nigerian) Biomes',                              16),
  ('ecology-of-populations',           'The Ecology of Populations',                           17),
  ('soil',                             'Soil',                                                 18),
  ('humans-and-environment',           'Humans and Environment',                               19),
  ('variation-in-population',          'Variation in Population',                              20),
  ('heredity',                         'Heredity',                                             21),
  ('theories-of-evolution',            'Theories of Evolution',                                22),
  ('evidence-of-evolution',            'Evidence of Evolution',                                23)
) AS v(slug, name, n)
WHERE s.slug = 'biology';

-- =============================================================================
-- 7. USE OF ENGLISH — exact JAMB syllabus (17 topics)
-- =============================================================================
INSERT INTO practice_topics (id, slug, name, subject_id, sort_order)
SELECT gen_random_uuid(), v.slug, v.name, s.id, v.n
FROM practice_subjects s,
(VALUES
  -- Section A: Comprehension/Summary
  ('comprehension-description',      'Comprehension/Summary: Description',                                   1),
  ('comprehension-narration',        'Comprehension/Summary: Narration',                                     2),
  ('comprehension-exposition',       'Comprehension/Summary: Exposition',                                    3),
  ('comprehension-argumentation',    'Comprehension/Summary: Argumentation/Persuasion',                      4),
  -- Section B: Lexis and Structure
  ('lexis-synonyms',                 'Lexis and Structure: Synonyms',                                        5),
  ('lexis-antonyms',                 'Lexis and Structure: Antonyms',                                        6),
  ('lexis-homonyms',                 'Lexis and Structure: Homonyms',                                        7),
  ('lexis-clause-patterns',          'Lexis and Structure: Clause and Sentence Patterns',                   8),
  ('lexis-word-classes',             'Lexis and Structure: Word Classes and their Functions',                9),
  ('lexis-mood-tense-concord',       'Lexis and Structure: Mood, Tense, Aspect, Number, Concord, Degree and Question Tags', 10),
  ('lexis-punctuation-spelling',     'Lexis and Structure: Punctuation and Spelling',                       11),
  ('lexis-figurative-usage',         'Lexis and Structure: Ordinary, Figurative and Idiomatic Usage',       12),
  -- Section C: Oral Forms
  ('oral-vowels',                    'Oral Forms: Vowels (Monophthongs and Diphthongs)',                    13),
  ('oral-consonants',                'Oral Forms: Consonants (Including Clusters)',                         14),
  ('oral-rhymes',                    'Oral Forms: Rhymes (Including Homophones)',                           15),
  ('oral-word-stress',               'Oral Forms: Word Stress (Monosyllabic and Polysyllabic)',             16),
  ('oral-intonation',                'Oral Forms: Intonation (Words Emphatic Stress)',                      17)
) AS v(slug, name, n)
WHERE s.slug = 'english';

-- =============================================================================
-- 8. Seed real verified UTME past questions
-- =============================================================================

-- ── MATHEMATICS: Number bases ──────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'number-bases')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Convert $110111_2$ to base 10.',
    '43', '55', '63', '47', 'B',
    '$1\times2^5 + 1\times2^4 + 0\times2^3 + 1\times2^2 + 1\times2^1 + 1\times2^0 = 32+16+0+4+2+1 = 55$.',
    1
  ),
  (
    'What is $31_8$ expressed in base 10?',
    '24', '25', '28', '31', 'B',
    '$31_8 = 3\times8 + 1\times1 = 24 + 1 = 25$.',
    2
  ),
  (
    'Convert $10110_2$ to base 8.',
    '$22_8$', '$26_8$', '$30_8$', '$16_8$', 'B',
    '$10110_2 = 22_{10}$. Now $22 \div 8 = 2$ remainder $6$. So $22_{10} = 26_8$.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── MATHEMATICS: Indices, Logarithms and Surds ─────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'indices-logarithms-surds')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'If $\log_{10}2 = 0.3010$, find $\log_{10}5$.',
    '0.3010', '0.6990', '1.3010', '1.6990', 'B',
    '$\log_{10}5 = \log_{10}\!\left(\frac{10}{2}\right) = \log_{10}10 - \log_{10}2 = 1 - 0.3010 = 0.6990$.',
    1
  ),
  (
    'Simplify $\frac{27^{\frac{1}{3}} \times 4^{\frac{1}{2}}}{3^{-2}}$.',
    '6', '18', '54', '162', 'C',
    '$27^{1/3}=3,\; 4^{1/2}=2,\; 3^{-2}=\tfrac{1}{9}$. So $\frac{3 \times 2}{1/9} = 6 \times 9 = 54$.',
    2
  ),
  (
    'Simplify $\sqrt{50} + \sqrt{32} - \sqrt{18}$.',
    '$6\sqrt{2}$', '$7\sqrt{2}$', '$8\sqrt{2}$', '$9\sqrt{2}$', 'A',
    '$\sqrt{50}=5\sqrt{2},\;\sqrt{32}=4\sqrt{2},\;\sqrt{18}=3\sqrt{2}$. Total: $(5+4-3)\sqrt{2} = 6\sqrt{2}$.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── MATHEMATICS: Sets ──────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'sets')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'If $P = \{1,2,3,4,5\}$ and $Q = \{2,4,6,8\}$, find $P \cap Q$.',
    '$\{1,3,5\}$', '$\{2,4\}$', '$\{1,2,3,4,5,6,8\}$', '$\{6,8\}$', 'B',
    '$P \cap Q$ contains elements common to both sets. The common elements are 2 and 4, so $P \cap Q = \{2,4\}$.',
    1
  ),
  (
    'In a class of 40 students, 25 study Mathematics and 20 study Physics. If 10 study both subjects, how many study neither?',
    '0', '5', '10', '15', 'B',
    '$n(M \cup P) = 25 + 20 - 10 = 35$. Students studying neither $= 40 - 35 = 5$.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── MATHEMATICS: Trigonometry ──────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'trigonometry')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'If $\sin\theta = \dfrac{3}{5}$ and $\theta$ is acute, find $\tan\theta$.',
    '$\dfrac{3}{4}$', '$\dfrac{4}{5}$', '$\dfrac{3}{5}$', '$\dfrac{4}{3}$', 'A',
    'opp = 3, hyp = 5 → adj = $\sqrt{25-9}=4$. $\tan\theta = \dfrac{\text{opp}}{\text{adj}} = \dfrac{3}{4}$.',
    1
  ),
  (
    'Evaluate $\sin 30° + \cos 60° - \tan 45°$.',
    '$0$', '$\dfrac{1}{2}$', '$1$', '$-1$', 'A',
    '$\sin30°=\tfrac{1}{2},\;\cos60°=\tfrac{1}{2},\;\tan45°=1$. Result: $\tfrac{1}{2}+\tfrac{1}{2}-1 = 0$.',
    2
  ),
  (
    'The angle of elevation of the top of a vertical mast from a point 20 m away on level ground is $60°$. Find the height of the mast.',
    '$10\sqrt{3}$ m', '$20\sqrt{3}$ m', '$\dfrac{20}{\sqrt{3}}$ m', '40 m', 'B',
    '$\tan60° = \dfrac{h}{20}$, so $h = 20\tan60° = 20\sqrt{3}$ m $\approx 34.6$ m.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── MATHEMATICS: Probability ───────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'probability')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'A bag contains 5 red and 4 blue balls. One ball is drawn at random. What is the probability of drawing a red ball?',
    '$\dfrac{4}{9}$', '$\dfrac{5}{9}$', '$\dfrac{5}{4}$', '$\dfrac{1}{5}$', 'B',
    'Total = 9. $P(\text{red}) = \dfrac{5}{9}$.',
    1
  ),
  (
    'Two fair dice are thrown together. What is the probability of obtaining a total score of 7?',
    '$\dfrac{1}{6}$', '$\dfrac{5}{36}$', '$\dfrac{7}{36}$', '$\dfrac{1}{12}$', 'A',
    'Favourable outcomes: $(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)$ — 6 outcomes. Total = 36. $P = \dfrac{6}{36} = \dfrac{1}{6}$.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── MATHEMATICS: Permutation and Combination ───────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'permutation-and-combination')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'In how many ways can 4 students be arranged in a straight line?',
    '8', '16', '24', '48', 'C',
    '$4! = 4 \times 3 \times 2 \times 1 = 24$.',
    1
  ),
  (
    'How many ways can 3 books be chosen from 7 different books?',
    '21', '35', '42', '210', 'B',
    '$\binom{7}{3} = \dfrac{7!}{3!\,4!} = \dfrac{7\times6\times5}{3\times2\times1} = 35$.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Measurements and Units ───────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'measurements-and-units')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Which of the following is a fundamental (base) SI unit?',
    'Newton', 'Watt', 'Kilogram', 'Pascal', 'C',
    'The kilogram (kg) is one of the seven SI base units. Newton, Watt and Pascal are all derived units.',
    1
  ),
  (
    'The dimension of pressure is:',
    '$ML^{-1}T^{-2}$', '$MLT^{-2}$', '$ML^2T^{-2}$', '$M^{-1}LT^{-2}$', 'A',
    'Pressure $= \dfrac{\text{Force}}{\text{Area}} = \dfrac{MLT^{-2}}{L^2} = ML^{-1}T^{-2}$.',
    2
  ),
  (
    'A vernier caliper has a main-scale reading of 2.3 cm. The vernier coincidence is at the 7th division and the least count is 0.01 cm. The actual reading is:',
    '2.30 cm', '2.37 cm', '2.07 cm', '2.73 cm', 'B',
    'Reading $=$ main scale $+$ (vernier division $\times$ LC) $= 2.30 + 7 \times 0.01 = 2.37$ cm.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Motion ────────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'motion')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'A car starts from rest and accelerates uniformly at $4\ \text{m/s}^2$ for 5 s. Calculate the distance covered.',
    '20 m', '40 m', '50 m', '100 m', 'C',
    '$s = ut + \tfrac{1}{2}at^2 = 0 + \tfrac{1}{2}(4)(25) = 50$ m.',
    1
  ),
  (
    'A stone is dropped from a height of 80 m. How long does it take to reach the ground? ($g = 10\ \text{m/s}^2$)',
    '2 s', '4 s', '8 s', '16 s', 'B',
    '$h = \tfrac{1}{2}gt^2 \Rightarrow 80 = 5t^2 \Rightarrow t^2 = 16 \Rightarrow t = 4$ s.',
    2
  ),
  (
    'A body of mass 5 kg is acted upon by a force of 20 N for 5 s. What is the impulse?',
    '4 Ns', '20 Ns', '100 Ns', '25 Ns', 'C',
    'Impulse $= F \times t = 20 \times 5 = 100$ Ns.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Work, Energy and Power ───────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'work-energy-and-power')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'A force of 50 N moves a body through a distance of 10 m in the direction of the force. The work done is:',
    '5 J', '50 J', '500 J', '5000 J', 'C',
    '$W = Fd = 50 \times 10 = 500$ J.',
    1
  ),
  (
    'A machine lifts a 200 kg load through 5 m in 10 s. What is the power developed? ($g = 10\ \text{m/s}^2$)',
    '100 W', '500 W', '1 000 W', '2 000 W', 'C',
    '$P = \dfrac{mgh}{t} = \dfrac{200 \times 10 \times 5}{10} = 1000$ W.',
    2
  ),
  (
    'A body of mass 4 kg moves with a velocity of 6 m/s. Its kinetic energy is:',
    '12 J', '24 J', '72 J', '144 J', 'C',
    '$KE = \tfrac{1}{2}mv^2 = \tfrac{1}{2}(4)(36) = 72$ J.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Gas Laws ─────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'gas-laws')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Which gas law states that the volume of a fixed mass of gas is inversely proportional to its pressure at constant temperature?',
    'Charles'' law', 'Boyle''s law', 'Gay-Lussac''s law', 'Avogadro''s law', 'B',
    'Boyle''s law: $P \propto \dfrac{1}{V}$ (at constant temperature), i.e. $PV = \text{constant}$.',
    1
  ),
  (
    'A gas occupies 200 cm³ at 27°C. What volume will it occupy at 127°C at the same pressure?',
    '133 cm³', '267 cm³', '400 cm³', '800 cm³', 'B',
    'Charles'' law: $\dfrac{V_1}{T_1}=\dfrac{V_2}{T_2}$. $T_1=300$ K, $T_2=400$ K. $V_2 = \dfrac{200\times400}{300} \approx 267$ cm³.',
    2
  ),
  (
    'At STP, which of the following is correct for an ideal gas?',
    'Temperature is 0°C and pressure is 760 mmHg', 'Temperature is 25°C and pressure is 1 atm', 'Temperature is 100°C and pressure is 760 mmHg', 'Temperature is 0°C and pressure is 1 Pa', 'A',
    'Standard Temperature and Pressure (STP) is defined as 0°C (273.15 K) and 760 mmHg (1 atm = 101.325 kPa).',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Waves ─────────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'waves')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'A wave has frequency 500 Hz and wavelength 0.6 m. What is the speed of the wave?',
    '0.83 m/s', '300 m/s', '500.6 m/s', '8.3 m/s', 'B',
    '$v = f\lambda = 500 \times 0.6 = 300$ m/s.',
    1
  ),
  (
    'A wave has a period of 0.02 s. What is its frequency?',
    '2 Hz', '20 Hz', '50 Hz', '200 Hz', 'C',
    '$f = \dfrac{1}{T} = \dfrac{1}{0.02} = 50$ Hz.',
    2
  ),
  (
    'Which of the following is a longitudinal wave?',
    'Light waves', 'X-rays', 'Sound waves', 'Water ripples', 'C',
    'Sound waves are longitudinal — particles vibrate parallel to the direction of wave propagation. Light and X-rays are transverse.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Current Electricity ──────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'current-electricity')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Three resistors of $3\ \Omega$, $6\ \Omega$ and $9\ \Omega$ are connected in parallel. Find the effective resistance.',
    '$1.6\ \Omega$', '$2.0\ \Omega$', '$\dfrac{18}{11}\ \Omega$', '$18\ \Omega$', 'C',
    '$\dfrac{1}{R}=\dfrac{1}{3}+\dfrac{1}{6}+\dfrac{1}{9}=\dfrac{6+3+2}{18}=\dfrac{11}{18}$. So $R = \dfrac{18}{11}\ \Omega \approx 1.64\ \Omega$.',
    1
  ),
  (
    'A battery of e.m.f. 12 V and internal resistance $2\ \Omega$ drives current through a $10\ \Omega$ external resistor. The terminal voltage is:',
    '12 V', '10 V', '2 V', '8 V', 'B',
    '$I = \dfrac{E}{R+r} = \dfrac{12}{12} = 1$ A. Terminal voltage $= E - Ir = 12 - 2 = 10$ V.',
    2
  ),
  (
    'A 60 W bulb is connected to a 240 V supply. What current flows through it?',
    '0.125 A', '0.25 A', '4 A', '14 400 A', 'B',
    '$I = \dfrac{P}{V} = \dfrac{60}{240} = 0.25$ A.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Elementary Modern Physics ────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'elementary-modern-physics')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'The half-life of a radioactive substance is 5 years. What fraction remains after 20 years?',
    '$\dfrac{1}{2}$', '$\dfrac{1}{4}$', '$\dfrac{1}{8}$', '$\dfrac{1}{16}$', 'D',
    'Number of half-lives $= 20 \div 5 = 4$. Fraction remaining $= \left(\dfrac{1}{2}\right)^4 = \dfrac{1}{16}$.',
    1
  ),
  (
    'The photoelectric effect is best explained by treating light as:',
    'A wave', 'A stream of particles (photons)', 'A form of heat', 'An electromagnetic field only', 'B',
    'Einstein explained the photoelectric effect by proposing that light consists of discrete packets of energy called photons. The energy of each photon is $E = hf$.',
    2
  ),
  (
    'In beta-minus decay, which particle is emitted?',
    'Proton', 'Neutron', 'Alpha particle', 'Electron', 'D',
    'In $\beta^-$ decay a neutron converts to a proton, emitting an electron (beta particle) and an antineutrino: $\text{n} \rightarrow \text{p} + e^- + \bar{\nu}_e$.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── PHYSICS: Electrostatics ───────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'electrostatics')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Two point charges of $+2\ \mu\text{C}$ and $-2\ \mu\text{C}$ are placed 0.1 m apart. What is the nature of the force between them?',
    'Repulsive', 'Attractive', 'Zero', 'Perpendicular', 'B',
    'Unlike charges (positive and negative) attract each other. By Coulomb''s law, the force is attractive.',
    1
  ),
  (
    'The SI unit of electric charge is the:',
    'Volt', 'Ampere', 'Coulomb', 'Farad', 'C',
    'The SI unit of electric charge is the coulomb (C). $1\text{ C} = 1\text{ A}\cdot\text{s}$.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── CHEMISTRY: Atomic Structure and Bonding ───────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'atomic-structure-and-bonding')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'An element has atomic number 17 and mass number 35. How many neutrons are in its nucleus?',
    '17', '18', '35', '52', 'B',
    'Neutrons $=$ mass number $-$ atomic number $= 35 - 17 = 18$.',
    1
  ),
  (
    'The electronic configuration of sodium (Na, $Z = 11$) is:',
    '2, 8, 1', '2, 9', '3, 8', '2, 8, 3', 'A',
    'Sodium has 11 electrons: 2 in shell 1, 8 in shell 2, 1 in shell 3 → configuration 2, 8, 1.',
    2
  ),
  (
    'Which type of bond involves the complete transfer of electrons from one atom to another?',
    'Covalent bond', 'Metallic bond', 'Ionic bond', 'Hydrogen bond', 'C',
    'An ionic bond is formed by the complete transfer of electrons. The atom losing electrons becomes a cation and the one gaining becomes an anion.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── CHEMISTRY: Acids, Bases and Salts ─────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'acids-bases-and-salts')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'A solution has a pH of 3. The solution is:',
    'Strongly basic', 'Weakly basic', 'Neutral', 'Acidic', 'D',
    'pH < 7 indicates an acidic solution. pH = 7 is neutral; pH > 7 is basic.',
    1
  ),
  (
    'Which salt is formed when sodium hydroxide reacts with hydrochloric acid?',
    'Sodium carbonate', 'Sodium sulphate', 'Sodium chloride', 'Sodium nitrate', 'C',
    '$\text{NaOH} + \text{HCl} \rightarrow \text{NaCl} + \text{H}_2\text{O}$. The salt is sodium chloride.',
    2
  ),
  (
    'Which of the following is a strong acid?',
    'Ethanoic acid', 'Carbonic acid', 'Hydrochloric acid', 'Citric acid', 'C',
    'HCl is a strong acid — it dissociates completely in water. Ethanoic, carbonic and citric acids are weak (partial dissociation).',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── CHEMISTRY: Oxidation and Reduction ────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'oxidation-and-reduction')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'In the reaction $\text{Fe}^{3+} + e^- \rightarrow \text{Fe}^{2+}$, the iron ion is:',
    'Oxidised', 'Reduced', 'Hydrolysed', 'Neutralised', 'B',
    '$\text{Fe}^{3+}$ gains an electron → reduced. OIL RIG: Oxidation Is Loss, Reduction Is Gain.',
    1
  ),
  (
    'What is the oxidation number of sulphur in $\text{H}_2\text{SO}_4$?',
    '+2', '+4', '+6', '-2', 'C',
    '$2(+1) + x + 4(-2) = 0 \Rightarrow 2 + x - 8 = 0 \Rightarrow x = +6$.',
    2
  ),
  (
    'Which of the following is an oxidising agent in the reaction $\text{Zn} + \text{CuSO}_4 \rightarrow \text{ZnSO}_4 + \text{Cu}$?',
    'Zn', 'ZnSO₄', 'Cu²⁺ (from CuSO₄)', 'SO₄²⁻', 'C',
    'Cu²⁺ accepts electrons from Zn ($\text{Cu}^{2+} + 2e^- \rightarrow \text{Cu}$) — it is reduced, hence it is the oxidising agent.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── CHEMISTRY: Electrolysis ────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'electrolysis')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'During electrolysis of dilute sulphuric acid, which gas is produced at the cathode?',
    'Oxygen', 'Hydrogen', 'Sulphur dioxide', 'Chlorine', 'B',
    'At the cathode: $2\text{H}^+ + 2e^- \rightarrow \text{H}_2$. Hydrogen gas is produced.',
    1
  ),
  (
    'What is produced at the anode during the electrolysis of brine (concentrated NaCl solution)?',
    'Hydrogen', 'Sodium', 'Oxygen', 'Chlorine', 'D',
    'At the anode in brine: $2\text{Cl}^- - 2e^- \rightarrow \text{Cl}_2$. Chlorine gas is discharged.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── CHEMISTRY: Organic Compounds ──────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'organic-compounds')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'The general formula for alkanes is:',
    '$\text{C}_n\text{H}_{2n}$', '$\text{C}_n\text{H}_{2n+2}$', '$\text{C}_n\text{H}_{2n-2}$', '$\text{C}_n\text{H}_n$', 'B',
    'Alkanes (saturated hydrocarbons) follow $\text{C}_n\text{H}_{2n+2}$. Alkenes: $\text{C}_n\text{H}_{2n}$; Alkynes: $\text{C}_n\text{H}_{2n-2}$.',
    1
  ),
  (
    'The IUPAC name of $\text{CH}_3\text{CH}_2\text{OH}$ is:',
    'Methanol', 'Ethanol', 'Propanol', 'Butanol', 'B',
    '2 carbon atoms + hydroxyl group ($-\text{OH}$) → ethanol.',
    2
  ),
  (
    'Which functional group is characteristic of carboxylic acids?',
    '$-\text{OH}$', '$-\text{CHO}$', '$-\text{CO}-$', '$-\text{COOH}$', 'D',
    'The carboxyl group $-\text{COOH}$ is the functional group of carboxylic acids (e.g. ethanoic acid, CH₃COOH).',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── CHEMISTRY: Kinetic Theory and Gas Laws ────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'kinetic-theory-and-gas-laws')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'According to the kinetic theory of matter, temperature is a measure of:',
    'The total energy of the molecules', 'The average kinetic energy of the molecules', 'The potential energy of the molecules', 'The density of the gas', 'B',
    'Temperature is a measure of the average kinetic energy of the molecules of a substance. Higher temperature → faster molecules → higher average KE.',
    1
  ),
  (
    'Which of the following is an assumption of the kinetic theory of an ideal gas?',
    'Gas molecules exert strong attractive forces on each other', 'Gas molecules occupy a significant volume', 'Collisions between gas molecules are perfectly elastic', 'Gas molecules move in circular paths', 'C',
    'An ideal gas is assumed to have perfectly elastic collisions — no net loss of kinetic energy during collisions. Molecules also have negligible volume and negligible intermolecular forces.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── BIOLOGY: Living Organisms ─────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'living-organisms')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Which of the following is NOT a characteristic of living organisms?',
    'Respiration', 'Reproduction', 'Conductivity', 'Excretion', 'C',
    'Conductivity is not a standard characteristic of life. The 7 life processes are: Nutrition, Respiration, Excretion, Growth, Reproduction, Irritability (sensitivity) and Movement.',
    1
  ),
  (
    'The basic structural and functional unit of all living organisms is the:',
    'Organ', 'Tissue', 'Cell', 'Organelle', 'C',
    'The cell is the basic unit of life (cell theory). All living organisms are composed of one or more cells.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── BIOLOGY: Nutrition ────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'nutrition')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Which vitamin is essential for the synthesis of blood-clotting factors?',
    'Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K', 'D',
    'Vitamin K is essential for synthesising prothrombin and other clotting factors. Its deficiency causes abnormal bleeding.',
    1
  ),
  (
    'Which enzyme initiates starch digestion in the mouth?',
    'Pepsin', 'Lipase', 'Amylase', 'Trypsin', 'C',
    'Salivary amylase (ptyalin) breaks down starch into maltose in the mouth. Pepsin and trypsin digest proteins; lipase digests fats.',
    2
  ),
  (
    'Which mineral element is a component of haemoglobin?',
    'Calcium', 'Iron', 'Phosphorus', 'Sodium', 'B',
    'Iron (Fe) is the central component of the haem group in haemoglobin. Iron deficiency causes anaemia.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── BIOLOGY: Respiration ──────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'respiration')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'What is the net ATP gain from the glycolysis of one glucose molecule?',
    '2 ATP', '4 ATP', '36 ATP', '38 ATP', 'A',
    'Glycolysis produces 4 ATP but uses 2 ATP — net gain of 2 ATP. The remaining ~34–36 ATP come from the Krebs cycle and oxidative phosphorylation (aerobic only).',
    1
  ),
  (
    'The correct overall equation for aerobic respiration is:',
    '$\text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2 \rightarrow 6\text{CO}_2 + 6\text{H}_2\text{O} + \text{Energy}$',
    '$\text{C}_6\text{H}_{12}\text{O}_6 \rightarrow 2\text{C}_2\text{H}_5\text{OH} + 2\text{CO}_2 + \text{Energy}$',
    '$6\text{CO}_2 + 6\text{H}_2\text{O} \rightarrow \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2$',
    '$\text{C}_6\text{H}_{12}\text{O}_6 \rightarrow \text{lactic acid} + \text{Energy}$', 'A',
    'Option A is aerobic respiration. Option B is alcoholic fermentation (anaerobic). Option C is photosynthesis. Option D is anaerobic respiration in animals.',
    2
  ),
  (
    'Where does the Krebs cycle (citric acid cycle) take place?',
    'Cytoplasm', 'Nucleus', 'Mitochondrial matrix', 'Endoplasmic reticulum', 'C',
    'The Krebs cycle occurs in the mitochondrial matrix. Glycolysis occurs in the cytoplasm; oxidative phosphorylation occurs on the inner mitochondrial membrane.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── BIOLOGY: Heredity ─────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'heredity')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'In a monohybrid cross between TT and tt, the phenotype of all $F_1$ offspring is:',
    'All short', 'All tall', '3 tall : 1 short', '1 tall : 1 short', 'B',
    'All $F_1$ are Tt (heterozygous). Tall (T) is dominant over short (t), so all $F_1$ show the tall phenotype.',
    1
  ),
  (
    'Sickle-cell anaemia is caused by:',
    'A dominant autosomal gene', 'A recessive autosomal gene', 'A sex-linked dominant gene', 'A chromosomal mutation', 'B',
    'Sickle-cell anaemia is an autosomal recessive disorder. An individual must inherit two copies of the sickle allele (HbS HbS) to manifest the disease.',
    2
  ),
  (
    'Which of the following statements about DNA is CORRECT?',
    'DNA is single-stranded', 'DNA contains uracil', 'DNA carries genetic information', 'DNA is found only in the nucleus', 'C',
    'DNA is the carrier of genetic information (via the sequence of base pairs). It is double-stranded, uses thymine (not uracil), and is found in the nucleus, mitochondria and chloroplasts.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── BIOLOGY: Reproduction ─────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'reproduction')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Fertilisation in humans normally takes place in the:',
    'Uterus', 'Ovary', 'Fallopian tube', 'Cervix', 'C',
    'The sperm fertilises the egg (ovum) in the fallopian tube (oviduct). The resulting zygote migrates to the uterus for implantation.',
    1
  ),
  (
    'Pollination is defined as the transfer of pollen grains from the:',
    'Stigma to the ovary', 'Anther to the stigma', 'Ovule to the anther', 'Petal to the sepal', 'B',
    'Pollination is the transfer of pollen grains from the anther (male) to the stigma (female) of a flower of the same or another plant of the same species.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── BIOLOGY: Transport ────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'transport')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Which tissue transports water and mineral salts from the roots upward in plants?',
    'Phloem', 'Xylem', 'Parenchyma', 'Collenchyma', 'B',
    'Xylem vessels transport water and dissolved minerals upward from roots to leaves via transpiration pull. Phloem transports organic solutes (sucrose) made in photosynthesis.',
    1
  ),
  (
    'Which type of blood vessel carries blood AWAY from the heart?',
    'Veins', 'Capillaries', 'Arteries', 'Venules', 'C',
    'Arteries carry blood away from the heart (mnemonic: Arteries = Away). The aorta and pulmonary artery both carry blood away from the heart.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── BIOLOGY: Excretion ────────────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'excretion')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'The functional unit of the kidney is called the:',
    'Glomerulus', 'Nephron', 'Loop of Henle', 'Collecting duct', 'B',
    'The nephron is the structural and functional unit of the kidney. Each kidney contains about one million nephrons.',
    1
  ),
  (
    'The main nitrogenous waste product excreted by humans is:',
    'Uric acid', 'Ammonia', 'Urea', 'Creatine', 'C',
    'Humans excrete urea (formed in the liver from the breakdown of amino acids) as the main nitrogenous waste. It is dissolved in urine and excreted by the kidneys.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── USE OF ENGLISH: Synonyms ──────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'lexis-synonyms')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Choose the option nearest in meaning to LOQUACIOUS.',
    'Reserved', 'Talkative', 'Aggressive', 'Intelligent', 'B',
    'Loquacious means tending to talk a great deal; garrulous. Antonym: taciturn (habitually silent).',
    1
  ),
  (
    'Choose the word nearest in meaning to AMELIORATE.',
    'Worsen', 'Improve', 'Destroy', 'Prolong', 'B',
    'To ameliorate means to make something bad better; to improve. Antonym: aggravate, worsen.',
    2
  ),
  (
    'Choose the option nearest in meaning to MAGNANIMOUS.',
    'Petty', 'Cruel', 'Generous', 'Cowardly', 'C',
    'Magnanimous means very generous or forgiving. Antonym: petty, mean-spirited.',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── USE OF ENGLISH: Antonyms ──────────────────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'lexis-antonyms')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Choose the option most opposite in meaning to PRODIGAL.',
    'Generous', 'Extravagant', 'Frugal', 'Wealthy', 'C',
    'Prodigal means wastefully extravagant. Its antonym is frugal (careful with money; not wasteful).',
    1
  ),
  (
    'Choose the option most opposite in meaning to EBULLIENT.',
    'Enthusiastic', 'Cheerful', 'Dejected', 'Energetic', 'C',
    'Ebullient means cheerful and full of energy. Its antonym is dejected (sad and dispirited).',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── USE OF ENGLISH: Mood, Tense, Concord ─────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'lexis-mood-tense-concord')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'Choose the option that correctly fills the gap: "Neither the teachers nor the student _____ present."',
    'were', 'are', 'is', 'be', 'C',
    'With neither...nor, the verb agrees with the subject nearer to it. "Student" is singular → "is".',
    1
  ),
  (
    'Choose the option that correctly fills the gap: "He suggested that she _____ the report immediately."',
    'writes', 'write', 'written', 'wrote', 'B',
    'After "suggest that", the subjunctive mood requires the base form of the verb regardless of subject: "that she write".',
    2
  ),
  (
    'Which sentence is grammatically correct?',
    'Each of the boys have done their homework.', 'Each of the boys has done his homework.', 'Each of the boys have done his homework.', 'Each of the boys has done their homework.', 'B',
    '"Each" is singular → takes singular verb "has" and singular pronoun "his". Correct: "Each of the boys has done his homework."',
    3
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── USE OF ENGLISH: Oral Forms — Vowels ──────────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'oral-vowels')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'How many vowel sounds does standard British (RP) English have?',
    '5', '12', '20', '26', 'C',
    'RP English has 20 vowel sounds: 12 monophthongs (pure vowels) and 8 diphthongs (gliding vowels). The 5 vowel letters represent far more sounds.',
    1
  ),
  (
    'A vowel sound that glides from one position to another is called a:',
    'Monophthong', 'Diphthong', 'Consonant cluster', 'Fricative', 'B',
    'A diphthong is a vowel sound that changes quality during its production, e.g. /eɪ/ in "face", /aɪ/ in "price".',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── USE OF ENGLISH: Oral Forms — Word Stress ─────────────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'oral-word-stress')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'In which syllable does the primary stress fall in the word "PHOtograph"?',
    'First (PHO)', 'Second (to)', 'Third (graph)', 'All equally', 'A',
    'PHO-to-graph: primary stress is on the first syllable. Compare with pho-TOG-ra-phy where stress shifts to the second syllable.',
    1
  ),
  (
    'Which of the following words has its stress on the second syllable?',
    'CONduct (noun)', 'TAble', 'beHIND', 'WINdow', 'C',
    '"beHIND" is stressed on the second syllable (be-HIND). "CONduct" (noun), "TAble" and "WINdow" all carry primary stress on the first syllable.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- ── USE OF ENGLISH: Figurative and Idiomatic Usage ───────────────────────
WITH t AS (SELECT id FROM practice_topics WHERE slug = 'lexis-figurative-usage')
INSERT INTO questions (id, topic_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, status, sort_order)
SELECT gen_random_uuid(), t.id, q.prompt, q.a, q.b, q.c, q.d, q.ans, q.exp, 'published', q.n
FROM t, (VALUES
  (
    'What does the idiom "to burn the midnight oil" mean?',
    'To set something on fire at night', 'To work or study late into the night', 'To waste energy', 'To be very tired', 'B',
    '"Burning the midnight oil" means to work or study very late at night — a reference to the use of oil lamps before electricity.',
    1
  ),
  (
    'The expression "It is raining cats and dogs" is an example of:',
    'Simile', 'Metaphor', 'Idiom', 'Hyperbole', 'C',
    '"Raining cats and dogs" is an idiomatic expression meaning it is raining very heavily. It cannot be interpreted literally.',
    2
  )
) AS q(prompt, a, b, c, d, ans, exp, n);

-- =============================================================================
-- Done. All 5 subjects seeded with exact JAMB syllabus topics and past questions.
-- =============================================================================
