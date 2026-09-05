export interface JambSubjectData {
  slug: string;
  name: string;
  sort_order: number;
}

export interface JambTopicData {
  slug: string;
  name: string;
  sort_order: number;
}

export interface JambQuestionData {
  subjectSlug: string;
  topicSlug: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  sort_order: number;
}

export const JAMB_SUBJECTS: JambSubjectData[] = [
  { slug: "mathematics", name: "Mathematics", sort_order: 1 },
  { slug: "physics", name: "Physics", sort_order: 2 },
  { slug: "chemistry", name: "Chemistry", sort_order: 3 },
  { slug: "biology", name: "Biology", sort_order: 4 },
  { slug: "english", name: "Use of English", sort_order: 5 },
];

export const JAMB_TOPICS: Record<string, JambTopicData[]> = {
  mathematics: [
    { slug: "number-bases", name: "Number bases", sort_order: 1 },
    {
      slug: "fractions-decimals-approximations",
      name: "Fractions, Decimals, Approximations and Percentages",
      sort_order: 2,
    },
    { slug: "indices-logarithms-surds", name: "Indices, Logarithms and Surds", sort_order: 3 },
    { slug: "sets", name: "Sets", sort_order: 4 },
    { slug: "polynomials", name: "Polynomials", sort_order: 5 },
    { slug: "variation", name: "Variation", sort_order: 6 },
    { slug: "inequalities", name: "Inequalities", sort_order: 7 },
    { slug: "progression", name: "Progression", sort_order: 8 },
    { slug: "binary-operations", name: "Binary Operations", sort_order: 9 },
    { slug: "matrices-and-determinants", name: "Matrices and Determinants", sort_order: 10 },
    { slug: "euclidean-geometry", name: "Euclidean Geometry", sort_order: 11 },
    { slug: "mensuration", name: "Mensuration", sort_order: 12 },
    { slug: "loci", name: "Loci", sort_order: 13 },
    { slug: "coordinate-geometry", name: "Coordinate Geometry", sort_order: 14 },
    { slug: "trigonometry", name: "Trigonometry", sort_order: 15 },
    { slug: "differentiation", name: "Differentiation", sort_order: 16 },
    {
      slug: "application-of-differentiation",
      name: "Application of differentiation",
      sort_order: 17,
    },
    { slug: "integration", name: "Integration", sort_order: 18 },
    { slug: "representation-of-data", name: "Representation of data", sort_order: 19 },
    { slug: "measures-of-location", name: "Measures of Location", sort_order: 20 },
    { slug: "measures-of-dispersion", name: "Measures of Dispersion", sort_order: 21 },
    { slug: "permutation-and-combination", name: "Permutation and Combination", sort_order: 22 },
    { slug: "probability", name: "Probability", sort_order: 23 },
  ],
  physics: [
    { slug: "measurements-and-units", name: "Measurements and Units", sort_order: 1 },
    { slug: "scalars-and-vectors", name: "Scalars and Vectors", sort_order: 2 },
    { slug: "motion", name: "Motion", sort_order: 3 },
    { slug: "gravitational-field", name: "Gravitational Field", sort_order: 4 },
    { slug: "equilibrium-of-forces", name: "Equilibrium of Forces", sort_order: 5 },
    { slug: "work-energy-and-power", name: "Work, Energy and Power", sort_order: 6 },
    { slug: "friction", name: "Friction", sort_order: 7 },
    { slug: "simple-machines", name: "Simple Machines", sort_order: 8 },
    { slug: "elasticity", name: "Elasticity", sort_order: 9 },
    { slug: "pressure", name: "Pressure", sort_order: 10 },
    { slug: "liquids-at-rest", name: "Liquids at Rest", sort_order: 11 },
    {
      slug: "temperature-and-measurement",
      name: "Temperature and its Measurement",
      sort_order: 12,
    },
    { slug: "thermal-expansion", name: "Thermal Expansion", sort_order: 13 },
    { slug: "gas-laws", name: "Gas Laws", sort_order: 14 },
    { slug: "quantity-of-heat", name: "Quantity of Heat", sort_order: 15 },
    { slug: "change-of-state", name: "Change of State", sort_order: 16 },
    { slug: "vapours", name: "Vapours", sort_order: 17 },
    {
      slug: "structure-of-matter-kinetic-theory",
      name: "Structure of Matter and Kinetic Theory",
      sort_order: 18,
    },
    { slug: "heat-transfer", name: "Heat Transfer", sort_order: 19 },
    { slug: "waves", name: "Waves", sort_order: 20 },
    { slug: "propagation-of-sound-waves", name: "Propagation of Sound Waves", sort_order: 21 },
    {
      slug: "characteristics-of-sound-waves",
      name: "Characteristics of Sound Waves",
      sort_order: 22,
    },
    { slug: "light-energy", name: "Light Energy", sort_order: 23 },
    {
      slug: "reflection-of-light",
      name: "Reflection of Light at Plane and Curved Surfaces",
      sort_order: 24,
    },
    {
      slug: "refraction-of-light",
      name: "Refraction of Light Through Plane and Curved Surfaces",
      sort_order: 25,
    },
    { slug: "optical-instruments", name: "Optical Instruments", sort_order: 26 },
    {
      slug: "dispersion-of-light-and-colours",
      name: "Dispersion of Light and Colours",
      sort_order: 27,
    },
    { slug: "electrostatics", name: "Electrostatics", sort_order: 28 },
    { slug: "capacitors", name: "Capacitors", sort_order: 29 },
    { slug: "electric-cells", name: "Electric Cells", sort_order: 30 },
    { slug: "current-electricity", name: "Current Electricity", sort_order: 31 },
    { slug: "electrical-energy-and-power", name: "Electrical Energy and Power", sort_order: 32 },
    { slug: "magnets-and-magnetic-fields", name: "Magnets and Magnetic Fields", sort_order: 33 },
    {
      slug: "force-on-current-carrying-conductor",
      name: "Force on a Current-Carrying Conductor in a Magnetic Field",
      sort_order: 34,
    },
    { slug: "electromagnetic-induction", name: "Electromagnetic Induction", sort_order: 35 },
    { slug: "simple-ac-circuits", name: "Simple A.C. Circuits", sort_order: 36 },
    {
      slug: "conduction-through-liquids-gases",
      name: "Conduction of Electricity Through Liquids and Gases",
      sort_order: 37,
    },
    { slug: "elementary-modern-physics", name: "Elementary Modern Physics", sort_order: 38 },
    { slug: "introductory-electronics", name: "Introductory Electronics", sort_order: 39 },
  ],
  chemistry: [
    {
      slug: "separation-and-purification",
      name: "Separation of mixtures and purification of chemical substances",
      sort_order: 1,
    },
    { slug: "chemical-combination", name: "Chemical combination", sort_order: 2 },
    {
      slug: "kinetic-theory-and-gas-laws",
      name: "Kinetic theory of matter and Gas Laws",
      sort_order: 3,
    },
    { slug: "atomic-structure-and-bonding", name: "Atomic structure and bonding", sort_order: 4 },
    { slug: "air", name: "Air", sort_order: 5 },
    { slug: "water", name: "Water", sort_order: 6 },
    { slug: "solubility", name: "Solubility", sort_order: 7 },
    { slug: "environmental-pollution", name: "Environmental pollution", sort_order: 8 },
    { slug: "acids-bases-and-salts", name: "Acids, bases and salts", sort_order: 9 },
    { slug: "oxidation-and-reduction", name: "Oxidation and reduction", sort_order: 10 },
    { slug: "electrolysis", name: "Electrolysis", sort_order: 11 },
    { slug: "energy-changes", name: "Energy changes", sort_order: 12 },
    { slug: "rates-of-chemical-reaction", name: "Rates of chemical reaction", sort_order: 13 },
    { slug: "chemical-equilibria", name: "Chemical equilibria", sort_order: 14 },
    { slug: "non-metals-and-compounds", name: "Non-metals and their compounds", sort_order: 15 },
    { slug: "metals-and-compounds", name: "Metals and their compounds", sort_order: 16 },
    { slug: "organic-compounds", name: "Organic compounds", sort_order: 17 },
    { slug: "chemistry-and-industry", name: "Chemistry and industry", sort_order: 18 },
  ],
  biology: [
    { slug: "living-organisms", name: "Living Organisms", sort_order: 1 },
    { slug: "evolution-among-organisms", name: "Evolution Among Organisms", sort_order: 2 },
    { slug: "variety-of-organisms", name: "Variety of Organisms", sort_order: 3 },
    {
      slug: "internal-structure-plant-mammal",
      name: "Internal Structure of a Flowering Plant and a Mammal",
      sort_order: 4,
    },
    { slug: "nutrition", name: "Nutrition", sort_order: 5 },
    { slug: "transport", name: "Transport", sort_order: 6 },
    { slug: "respiration", name: "Respiration", sort_order: 7 },
    { slug: "excretion", name: "Excretion", sort_order: 8 },
    { slug: "support-and-movement", name: "Support and Movement", sort_order: 9 },
    { slug: "reproduction", name: "Reproduction", sort_order: 10 },
    { slug: "growth", name: "Growth", sort_order: 11 },
    { slug: "coordination-and-control", name: "Co-ordination and Control", sort_order: 12 },
    {
      slug: "factors-affecting-distribution",
      name: "Factors Affecting Distribution of Organisms",
      sort_order: 13,
    },
    { slug: "symbiotic-interactions", name: "Symbiotic Interactions of Plants", sort_order: 14 },
    { slug: "natural-habitats", name: "Natural Habitats", sort_order: 15 },
    { slug: "local-nigerian-biomes", name: "Local (Nigerian) Biomes", sort_order: 16 },
    { slug: "ecology-of-populations", name: "The Ecology of Populations", sort_order: 17 },
    { slug: "soil", name: "Soil", sort_order: 18 },
    { slug: "humans-and-environment", name: "Humans and Environment", sort_order: 19 },
    { slug: "variation-in-population", name: "Variation in Population", sort_order: 20 },
    { slug: "heredity", name: "Heredity", sort_order: 21 },
    { slug: "theories-of-evolution", name: "Theories of Evolution", sort_order: 22 },
    { slug: "evidence-of-evolution", name: "Evidence of Evolution", sort_order: 23 },
  ],
  english: [
    {
      slug: "comprehension-description",
      name: "Comprehension/Summary: Description",
      sort_order: 1,
    },
    { slug: "comprehension-narration", name: "Comprehension/Summary: Narration", sort_order: 2 },
    { slug: "comprehension-exposition", name: "Comprehension/Summary: Exposition", sort_order: 3 },
    {
      slug: "comprehension-argumentation",
      name: "Comprehension/Summary: Argumentation/Persuasion",
      sort_order: 4,
    },
    { slug: "lexis-synonyms", name: "Lexis and Structure: Synonyms", sort_order: 5 },
    { slug: "lexis-antonyms", name: "Lexis and Structure: Antonyms", sort_order: 6 },
    { slug: "lexis-homonyms", name: "Lexis and Structure: Homonyms", sort_order: 7 },
    {
      slug: "lexis-clause-patterns",
      name: "Lexis and Structure: Clause and Sentence Patterns",
      sort_order: 8,
    },
    {
      slug: "lexis-word-classes",
      name: "Lexis and Structure: Word Classes and their Functions",
      sort_order: 9,
    },
    {
      slug: "lexis-mood-tense-concord",
      name: "Lexis and Structure: Mood, Tense, Aspect, Number, Concord, Degree and Question Tags",
      sort_order: 10,
    },
    {
      slug: "lexis-punctuation-spelling",
      name: "Lexis and Structure: Punctuation and Spelling",
      sort_order: 11,
    },
    {
      slug: "lexis-figurative-usage",
      name: "Lexis and Structure: Ordinary, Figurative and Idiomatic Usage",
      sort_order: 12,
    },
    {
      slug: "oral-vowels",
      name: "Oral Forms: Vowels (Monophthongs and Diphthongs)",
      sort_order: 13,
    },
    {
      slug: "oral-consonants",
      name: "Oral Forms: Consonants (Including Clusters)",
      sort_order: 14,
    },
    { slug: "oral-rhymes", name: "Oral Forms: Rhymes (Including Homophones)", sort_order: 15 },
    {
      slug: "oral-word-stress",
      name: "Oral Forms: Word Stress (Monosyllabic and Polysyllabic)",
      sort_order: 16,
    },
    {
      slug: "oral-intonation",
      name: "Oral Forms: Intonation (Words Emphatic Stress)",
      sort_order: 17,
    },
  ],
};

export const JAMB_QUESTIONS: JambQuestionData[] = [
  // Mathematics: Number bases
  {
    subjectSlug: "mathematics",
    topicSlug: "number-bases",
    prompt: "Convert $110111_2$ to base 10.",
    option_a: "43",
    option_b: "55",
    option_c: "63",
    option_d: "47",
    correct_option: "B",
    explanation:
      "$1\\times2^5 + 1\\times2^4 + 0\\times2^3 + 1\\times2^2 + 1\\times2^1 + 1\\times2^0 = 32+16+0+4+2+1 = 55$.",
    sort_order: 1,
  },
  {
    subjectSlug: "mathematics",
    topicSlug: "number-bases",
    prompt: "What is $31_8$ expressed in base 10?",
    option_a: "24",
    option_b: "25",
    option_c: "28",
    option_d: "31",
    correct_option: "B",
    explanation: "$31_8 = 3\\times8 + 1\\times1 = 24 + 1 = 25$.",
    sort_order: 2,
  },
  {
    subjectSlug: "mathematics",
    topicSlug: "number-bases",
    prompt: "Convert $10110_2$ to base 8.",
    option_a: "$22_8$",
    option_b: "$26_8$",
    option_c: "$30_8$",
    option_d: "$16_8$",
    correct_option: "B",
    explanation: "$10110_2 = 22_{10}$. Now $22 \\div 8 = 2$ remainder $6$. So $22_{10} = 26_8$.",
    sort_order: 3,
  },

  // Mathematics: Indices, Logarithms and Surds
  {
    subjectSlug: "mathematics",
    topicSlug: "indices-logarithms-surds",
    prompt: "If $\\log_{10}2 = 0.3010$, find $\\log_{10}5$.",
    option_a: "0.3010",
    option_b: "0.6990",
    option_c: "1.3010",
    option_d: "1.6990",
    correct_option: "B",
    explanation:
      "$\\log_{10}5 = \\log_{10}\\!\\left(\\frac{10}{2}\\right) = \\log_{10}10 - \\log_{10}2 = 1 - 0.3010 = 0.6990$.",
    sort_order: 1,
  },
  {
    subjectSlug: "mathematics",
    topicSlug: "indices-logarithms-surds",
    prompt: "Simplify $\\frac{27^{\\frac{1}{3}} \\times 4^{\\frac{1}{2}}}{3^{-2}}$.",
    option_a: "6",
    option_b: "18",
    option_c: "54",
    option_d: "162",
    correct_option: "C",
    explanation:
      "$27^{1/3}=3,\\; 4^{1/2}=2,\\; 3^{-2}=\\tfrac{1}{9}$. So $\\frac{3 \\times 2}{1/9} = 6 \\times 9 = 54$.",
    sort_order: 2,
  },
  {
    subjectSlug: "mathematics",
    topicSlug: "indices-logarithms-surds",
    prompt: "Simplify $\\sqrt{50} + \\sqrt{32} - \\sqrt{18}$.",
    option_a: "$6\\sqrt{2}$",
    option_b: "$7\\sqrt{2}$",
    option_c: "$8\\sqrt{2}$",
    option_d: "$9\\sqrt{2}$",
    correct_option: "A",
    explanation:
      "$\\sqrt{50}=5\\sqrt{2},\\;\\sqrt{32}=4\\sqrt{2},\\;\\sqrt{18}=3\\sqrt{2}$. Total: $(5+4-3)\\sqrt{2} = 6\\sqrt{2}$.",
    sort_order: 3,
  },

  // Mathematics: Sets
  {
    subjectSlug: "mathematics",
    topicSlug: "sets",
    prompt: "If $P = \\{1,2,3,4,5\\}$ and $Q = \\{2,4,6,8\\}$, find $P \\cap Q$.",
    option_a: "$\\{1,3,5\\}$",
    option_b: "$\\{2,4\\}$",
    option_c: "$\\{1,2,3,4,5,6,8\\}$",
    option_d: "$\\{6,8\\}$",
    correct_option: "B",
    explanation:
      "$P \\cap Q$ contains elements common to both sets. The common elements are 2 and 4, so $P \\cap Q = \\{2,4\\}$.",
    sort_order: 1,
  },
  {
    subjectSlug: "mathematics",
    topicSlug: "sets",
    prompt:
      "In a class of 40 students, 25 study Mathematics and 20 study Physics. If 10 study both subjects, how many study neither?",
    option_a: "0",
    option_b: "5",
    option_c: "10",
    option_d: "15",
    correct_option: "B",
    explanation: "$n(M \\cup P) = 25 + 20 - 10 = 35$. Students studying neither $= 40 - 35 = 5$.",
    sort_order: 2,
  },

  // Mathematics: Trigonometry
  {
    subjectSlug: "mathematics",
    topicSlug: "trigonometry",
    prompt: "If $\\sin\\theta = \\dfrac{3}{5}$ and $\\theta$ is acute, find $\\tan\\theta$.",
    option_a: "$\\dfrac{3}{4}$",
    option_b: "$\\dfrac{4}{5}$",
    option_c: "$\\dfrac{3}{5}$",
    option_d: "$\\dfrac{4}{3}$",
    correct_option: "A",
    explanation:
      "opp = 3, hyp = 5 → adj = $\\sqrt{25-9}=4$. $\\tan\\theta = \\dfrac{\\text{opp}}{\\text{adj}} = \\dfrac{3}{4}$.",
    sort_order: 1,
  },
  {
    subjectSlug: "mathematics",
    topicSlug: "trigonometry",
    prompt: "Evaluate $\\sin 30° + \\cos 60° - \\tan 45°$.",
    option_a: "$0$",
    option_b: "$\\dfrac{1}{2}$",
    option_c: "$1$",
    option_d: "$-1$",
    correct_option: "A",
    explanation:
      "$\\sin30°=\\tfrac{1}{2},\\;\\cos60°=\\tfrac{1}{2},\\;\\tan45°=1$. Result: $\\tfrac{1}{2}+\\tfrac{1}{2}-1 = 0$.",
    sort_order: 2,
  },

  // Physics: Measurements and Units
  {
    subjectSlug: "physics",
    topicSlug: "measurements-and-units",
    prompt: "Which of the following is a fundamental (base) SI unit?",
    option_a: "Newton",
    option_b: "Watt",
    option_c: "Kilogram",
    option_d: "Pascal",
    correct_option: "C",
    explanation:
      "The kilogram (kg) is one of the seven SI base units. Newton, Watt and Pascal are all derived units.",
    sort_order: 1,
  },
  {
    subjectSlug: "physics",
    topicSlug: "measurements-and-units",
    prompt: "The dimension of pressure is:",
    option_a: "$ML^{-1}T^{-2}$",
    option_b: "$MLT^{-2}$",
    option_c: "$ML^2T^{-2}$",
    option_d: "$M^{-1}LT^{-2}$",
    correct_option: "A",
    explanation:
      "Pressure $= \\dfrac{\\text{Force}}{\\text{Area}} = \\dfrac{MLT^{-2}}{L^2} = ML^{-1}T^{-2}$.",
    sort_order: 2,
  },

  // Physics: Motion
  {
    subjectSlug: "physics",
    topicSlug: "motion",
    prompt:
      "A car starts from rest and accelerates uniformly at $4\\ \\text{m/s}^2$ for 5 s. Calculate the distance covered.",
    option_a: "20 m",
    option_b: "40 m",
    option_c: "50 m",
    option_d: "100 m",
    correct_option: "C",
    explanation: "$s = ut + \\tfrac{1}{2}at^2 = 0 + \\tfrac{1}{2}(4)(25) = 50$ m.",
    sort_order: 1,
  },
  {
    subjectSlug: "physics",
    topicSlug: "motion",
    prompt:
      "A stone is dropped from a height of 80 m. How long does it take to reach the ground? ($g = 10\\ \\text{m/s}^2$)",
    option_a: "2 s",
    option_b: "4 s",
    option_c: "8 s",
    option_d: "16 s",
    correct_option: "B",
    explanation:
      "$h = \\tfrac{1}{2}gt^2 \\Rightarrow 80 = 5t^2 \\Rightarrow t^2 = 16 \\Rightarrow t = 4$ s.",
    sort_order: 2,
  },

  // Physics: Gas Laws
  {
    subjectSlug: "physics",
    topicSlug: "gas-laws",
    prompt:
      "Which gas law states that the volume of a fixed mass of gas is inversely proportional to its pressure at constant temperature?",
    option_a: "Charles' law",
    option_b: "Boyle's law",
    option_c: "Gay-Lussac's law",
    option_d: "Avogadro's law",
    correct_option: "B",
    explanation:
      "Boyle's law: $P \\propto \\dfrac{1}{V}$ (at constant temperature), i.e. $PV = \\text{constant}$.",
    sort_order: 1,
  },

  // Physics: Waves
  {
    subjectSlug: "physics",
    topicSlug: "waves",
    prompt: "A wave has frequency 500 Hz and wavelength 0.6 m. What is the speed of the wave?",
    option_a: "0.83 m/s",
    option_b: "300 m/s",
    option_c: "500.6 m/s",
    option_d: "8.3 m/s",
    correct_option: "B",
    explanation: "$v = f\\lambda = 500 \\times 0.6 = 300$ m/s.",
    sort_order: 1,
  },

  // Chemistry: Atomic structure and bonding
  {
    subjectSlug: "chemistry",
    topicSlug: "atomic-structure-and-bonding",
    prompt:
      "An element has atomic number 17 and mass number 35. How many neutrons are in its nucleus?",
    option_a: "17",
    option_b: "18",
    option_c: "35",
    option_d: "52",
    correct_option: "B",
    explanation: "Neutrons $=$ mass number $-$ atomic number $= 35 - 17 = 18$.",
    sort_order: 1,
  },
  {
    subjectSlug: "chemistry",
    topicSlug: "atomic-structure-and-bonding",
    prompt: "The electronic configuration of sodium (Na, $Z = 11$) is:",
    option_a: "2, 8, 1",
    option_b: "2, 9",
    option_c: "3, 8",
    option_d: "2, 8, 3",
    correct_option: "A",
    explanation:
      "Sodium has 11 electrons: 2 in shell 1, 8 in shell 2, 1 in shell 3 → configuration 2, 8, 1.",
    sort_order: 2,
  },

  // Chemistry: Acids, bases and salts
  {
    subjectSlug: "chemistry",
    topicSlug: "acids-bases-and-salts",
    prompt: "A solution has a pH of 3. The solution is:",
    option_a: "Strongly basic",
    option_b: "Weakly basic",
    option_c: "Neutral",
    option_d: "Acidic",
    correct_option: "D",
    explanation: "pH < 7 indicates an acidic solution. pH = 7 is neutral; pH > 7 is basic.",
    sort_order: 1,
  },

  // Chemistry: Organic compounds
  {
    subjectSlug: "chemistry",
    topicSlug: "organic-compounds",
    prompt: "The general formula for alkanes is:",
    option_a: "$\\text{C}_n\\text{H}_{2n}$",
    option_b: "$\\text{C}_n\\text{H}_{2n+2}$",
    option_c: "$\\text{C}_n\\text{H}_{2n-2}$",
    option_d: "$\\text{C}_n\\text{H}_n$",
    correct_option: "B",
    explanation:
      "Alkanes (saturated hydrocarbons) follow $\\text{C}_n\\text{H}_{2n+2}$. Alkenes: $\\text{C}_n\\text{H}_{2n}$; Alkynes: $\\text{C}_n\\text{H}_{2n-2}$.",
    sort_order: 1,
  },

  // Biology: Living Organisms
  {
    subjectSlug: "biology",
    topicSlug: "living-organisms",
    prompt: "Which of the following is NOT a characteristic of living organisms?",
    option_a: "Respiration",
    option_b: "Reproduction",
    option_c: "Conductivity",
    option_d: "Excretion",
    correct_option: "C",
    explanation:
      "Conductivity is not a standard characteristic of life. The 7 life processes are: Nutrition, Respiration, Excretion, Growth, Reproduction, Irritability and Movement.",
    sort_order: 1,
  },
  {
    subjectSlug: "biology",
    topicSlug: "living-organisms",
    prompt: "The basic structural and functional unit of all living organisms is the:",
    option_a: "Organ",
    option_b: "Tissue",
    option_c: "Cell",
    option_d: "Organelle",
    correct_option: "C",
    explanation:
      "The cell is the basic unit of life (cell theory). All living organisms are composed of one or more cells.",
    sort_order: 2,
  },

  // Biology: Heredity
  {
    subjectSlug: "biology",
    topicSlug: "heredity",
    prompt: "In a monohybrid cross between TT and tt, the phenotype of all $F_1$ offspring is:",
    option_a: "All short",
    option_b: "All tall",
    option_c: "3 tall : 1 short",
    option_d: "1 tall : 1 short",
    correct_option: "B",
    explanation:
      "All $F_1$ are Tt (heterozygous). Tall (T) is dominant over short (t), so all $F_1$ show the tall phenotype.",
    sort_order: 1,
  },

  // Use of English: Synonyms
  {
    subjectSlug: "english",
    topicSlug: "lexis-synonyms",
    prompt: "Choose the option nearest in meaning to LOQUACIOUS.",
    option_a: "Reserved",
    option_b: "Talkative",
    option_c: "Aggressive",
    option_d: "Intelligent",
    correct_option: "B",
    explanation:
      "Loquacious means tending to talk a great deal; garrulous. Antonym: taciturn (habitually silent).",
    sort_order: 1,
  },

  // Use of English: Antonyms
  {
    subjectSlug: "english",
    topicSlug: "lexis-antonyms",
    prompt: "Choose the option most opposite in meaning to PRODIGAL.",
    option_a: "Generous",
    option_b: "Extravagant",
    option_c: "Frugal",
    option_d: "Wealthy",
    correct_option: "C",
    explanation:
      "Prodigal means wastefully extravagant. Its antonym is frugal (careful with money; not wasteful).",
    sort_order: 1,
  },

  // Use of English: Mood, Tense, Concord
  {
    subjectSlug: "english",
    topicSlug: "lexis-mood-tense-concord",
    prompt:
      'Choose the option that correctly fills the gap: "Neither the teachers nor the student _____ present."',
    option_a: "were",
    option_b: "are",
    option_c: "is",
    option_d: "be",
    correct_option: "C",
    explanation:
      'With neither...nor, the verb agrees with the subject nearer to it. "Student" is singular → "is".',
    sort_order: 1,
  },

  // Use of English: Word Stress
  {
    subjectSlug: "english",
    topicSlug: "oral-word-stress",
    prompt: 'In which syllable does the primary stress fall in the word "PHOtograph"?',
    option_a: "First (PHO)",
    option_b: "Second (to)",
    option_c: "Third (graph)",
    option_d: "All equally",
    correct_option: "A",
    explanation:
      "PHO-to-graph: primary stress is on the first syllable. Compare with pho-TOG-ra-phy where stress shifts to the second syllable.",
    sort_order: 1,
  },
];
