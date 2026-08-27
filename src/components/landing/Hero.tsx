import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import heroStudent from "@/assets/hero-student.jpg";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl"
      />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold">
            Registration open
          </p>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Build the foundation.
            <span className="mt-1 block text-gold">Get the edge.</span>
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            The Foundational Class for UTME candidates. Master the basics, the concepts and the
            speed you need — before you tackle JAMB.
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-primary-foreground/85 sm:grid-cols-2">
            {[
              "Free registration",
              "3 mock exams",
              "Scholarship opportunity",
              "Classes on WhatsApp & Telegram",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-gold" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gold-gradient text-base font-semibold text-accent-foreground shadow-gold hover:opacity-95"
            >
              <Link to="/register">
                Register free <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-primary-foreground/30 bg-transparent text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href="#stories">See student results</a>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -rotate-2 rounded-3xl border border-gold/30" aria-hidden />
          <img
            src={heroStudent}
            alt="A UTME candidate working through mathematics and physics calculations with a scientific calculator"
            width={1280}
            height={1600}
            fetchPriority="high"
            className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]"
          />
        </div>
      </div>
    </section>
  );
}
