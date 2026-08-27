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

const title = "Newton Edge Tutorial — Free Foundational Class for UTME";
const description =
  "Free foundational UTME class: master calculations, core concepts, formulas and speed, plus 3 timed mock exams. Register in under 3 minutes.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
