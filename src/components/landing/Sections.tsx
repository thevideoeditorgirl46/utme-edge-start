import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpenCheck,
  Calculator,
  ClipboardList,
  FileCheck2,
  Gauge,
  GraduationCap,
  Lightbulb,
  MessagesSquare,
  Sigma,
  Target,
  Trophy,
  UserPlus,
} from "lucide-react";

import { BRAND_ASSETS } from "@/lib/brand";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p
        className={`text-[0.7rem] font-semibold uppercase tracking-[0.2em] ${
          light ? "text-gold" : "text-accent"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl ${
          light ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-3 text-base leading-relaxed ${
            light ? "text-primary-foreground/75" : "text-muted-foreground"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function WhyFoundational() {
  return (
    <section id="why" className="bg-background py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center">
        <img
          src={BRAND_ASSETS.flyer}
          alt="Newton Edge Tutorial Foundational Class flyer listing the learning pillars and mock exams"
          loading="lazy"
          className="w-full rounded-2xl border border-border object-contain shadow-card"
        />
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent">
            Why foundational
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Most UTME candidates don&apos;t fail JAMB. They fail the basics.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cramming past questions without a foundation is why scores stall in the 100s and 200s.
            The Foundational Class rebuilds the ground floor — calculations, core concepts and
            formulas — then trains you to apply them at JAMB speed.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "You understand topics, but freeze when the numbers change.",
              "You know the formula, but not when to use it.",
              "You run out of time before the last 20 questions.",
            ].map((line) => (
              <li key={line} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                <Target className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="mt-7 h-11 bg-gold-gradient font-semibold text-accent-foreground shadow-gold hover:opacity-95"
          >
            <Link to="/register">Claim your free spot</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    icon: Calculator,
    title: "Basic Calculations",
    text: "Rebuild arithmetic, indices, ratios and manipulation until numbers stop slowing you down.",
  },
  {
    icon: Lightbulb,
    title: "Core Concepts",
    text: "Understand the why behind every topic so unfamiliar questions still make sense.",
  },
  {
    icon: Sigma,
    title: "Formula Mastery",
    text: "Know every formula, what each symbol means, and exactly when to reach for it.",
  },
  {
    icon: Gauge,
    title: "Speed & Shortcuts",
    text: "Exam-tested techniques that cut working time without cutting accuracy.",
  },
  {
    icon: BookOpenCheck,
    title: "JAMB Application",
    text: "Apply everything to real UTME-style questions, the way JAMB actually asks them.",
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="bg-cream-gradient py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeading
          eyebrow="Pillars of learning"
          title="Five pillars that carry every high score"
          subtitle="Each class session is built on one of these — nothing is skipped, nothing is assumed."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-border/70 shadow-card transition hover:shadow-lift">
              <CardContent className="p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="size-5 text-gold" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const JOURNEY = [
  {
    icon: UserPlus,
    title: "Register free",
    text: "Four short steps. You get an account and a registration ID instantly.",
  },
  {
    icon: MessagesSquare,
    title: "Join the class",
    text: "Enter the WhatsApp and Telegram class from your dashboard.",
  },
  {
    icon: Calculator,
    title: "Rebuild the basics",
    text: "Start with calculations and core concepts, taught from zero.",
  },
  {
    icon: Sigma,
    title: "Master formulas",
    text: "Drill formulas and shortcuts until recall becomes automatic.",
  },
  {
    icon: ClipboardList,
    title: "Write 3 mocks",
    text: "Timed, JAMB-style mock exams with breakdowns after each one.",
  },
  {
    icon: Trophy,
    title: "Earn recognition",
    text: "Top performers are celebrated and considered for scholarships.",
  },
];

export function Journey() {
  return (
    <section id="journey" className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeading
          eyebrow="The journey"
          title="From registration to result day"
          subtitle="A clear path, so you always know what comes next."
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEY.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className="relative rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <span className="font-display text-sm font-bold text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon className="mt-3 size-5 text-primary" />
              <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function MockExams() {
  return (
    <section id="mocks" className="bg-primary py-16 text-primary-foreground sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeading
          light
          eyebrow="Mock exams"
          title="Three timed mocks before the real thing"
          subtitle="Because the first time you sit a full UTME-style paper should never be on exam day."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "Mock 1",
              t: "Diagnostic",
              d: "Find exactly where the gaps are before we go deep.",
            },
            {
              n: "Mock 2",
              t: "Progress check",
              d: "Measure improvement across all four subjects under time.",
            },
            {
              n: "Mock 3",
              t: "Final rehearsal",
              d: "Full JAMB conditions, full pressure, full feedback.",
            },
          ].map((m) => (
            <div
              key={m.n}
              className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5"
            >
              <FileCheck2 className="size-5 text-gold" />
              <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold">
                {m.n}
              </p>
              <h3 className="mt-1 font-display text-lg font-bold">{m.t}</h3>
              <p className="mt-2 text-sm text-primary-foreground/75">{m.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Scholarships() {
  return (
    <section id="scholarship" className="bg-cream-gradient py-16 sm:py-20">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="rounded-3xl border border-accent/30 bg-card p-7 text-center shadow-card sm:p-10">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gold-gradient">
            <Award className="size-6 text-accent-foreground" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
            Scholarships for top performers
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Consistency is rewarded. Students who lead the mock exams and stay active in class are
            recognised and considered for Newton Edge Tutorial scholarship support into the main
            UTME intensive programme.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-medium">
            {[
              "Mock exam performance",
              "Class participation",
              "Consistency",
              "Improvement rate",
            ].map((c) => (
              <span key={c} className="rounded-full border border-border bg-secondary px-3 py-1">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeading
          eyebrow="How it works"
          title="Everything happens on your phone"
          subtitle="Built light for Nigerian networks — no app to install, no heavy downloads."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: UserPlus,
              t: "Register in 4 steps",
              d: "About you, your UTME journey, your goals, and how you found us.",
            },
            {
              icon: MessagesSquare,
              t: "Learn in class",
              d: "Lessons, drills and Q&A run inside WhatsApp and Telegram.",
            },
            {
              icon: GraduationCap,
              t: "Practise & unlock",
              d: "Share the flyer to unlock a free mini JAMB practice set.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <Icon className="size-5 text-accent" />
              <h3 className="mt-3 font-display text-base font-bold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Is the Foundational Class really free?",
    a: "Yes. Registration and participation in the Foundational Class are free. You only need a phone and data.",
  },
  {
    q: "Who is this class for?",
    a: "Any candidate preparing for UTME who wants to fix the basics first — whether it is your first attempt or a retake.",
  },
  {
    q: "Where do the classes hold?",
    a: "Inside our WhatsApp and Telegram class groups. The join links appear on your dashboard immediately after registration.",
  },
  {
    q: "Do I need a laptop?",
    a: "No. Everything is designed mobile-first and works on low-end Android phones.",
  },
  {
    q: "What happens after I register?",
    a: "You get a registration ID, immediate access to the class links, and details of the mock exam schedule in class.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-cream-gradient py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl px-4">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-hero-gradient py-16 text-primary-foreground sm:py-20">
      <div className="mx-auto w-full max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          Your score changes when your foundation changes.
        </h2>
        <p className="mt-3 text-primary-foreground/80">
          Registration takes under three minutes. Class access is instant.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-7 h-12 bg-gold-gradient px-8 text-base font-semibold text-accent-foreground shadow-gold hover:opacity-95"
        >
          <Link to="/register">Register free now</Link>
        </Button>
      </div>
    </section>
  );
}
