import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import heroStudent from "@/assets/hero-student.jpg";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-bl-[4.5rem] bg-hero-gradient text-primary-foreground sm:rounded-bl-[8rem] lg:rounded-bl-[10rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-6 hidden opacity-40 lg:block"
      >
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="size-1 rounded-full bg-gold/60" />
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-20 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
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

        {/* Circular portrait frame, as in the design references */}
        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <div
            aria-hidden
            className="absolute -inset-3 rounded-full border-2 border-gold/50 sm:-inset-4"
          />
          <div
            aria-hidden
            className="absolute -inset-3 -rotate-6 rounded-full border border-gold/20 sm:-inset-4"
          />
          <img
            src={heroStudent}
            alt="A UTME candidate working through mathematics and physics calculations with a scientific calculator"
            width={1280}
            height={1600}
            fetchPriority="high"
            className="relative aspect-square w-full rounded-full object-cover object-[center_18%] shadow-lift"
          />
        </div>
      </div>
    </section>
  );
}
