import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/components/landing/Hero";
import {
  Faq,
  FinalCta,
  HowItWorks,
  Journey,
  MockExams,
  Pillars,
  Scholarships,
  WhyFoundational,
} from "@/components/landing/Sections";
import { Stories } from "@/components/landing/Stories";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";


export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead({
      path: "/",
      title: "Newton Edge Tutorial — Free Foundational Class for UTME 2027",
      description: "Free foundational UTME class for science candidates: master calculations, core concepts, formulas and speed, plus 3 timed JAMB mock exams. Register in under 3 minutes.",
    }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <WhyFoundational />
        <Pillars />
        <Journey />
        <MockExams />
        <Scholarships />
        <Stories />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
