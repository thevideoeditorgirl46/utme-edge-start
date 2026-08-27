import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register/success")({
  head: () => ({
    meta: [
      { title: "Registration confirmed — Newton Edge Tutorial" },
      {
        name: "description",
        content:
          "Your Foundational Class registration is confirmed. Class access is now available on your dashboard.",
      },
      { property: "og:title", content: "Registration confirmed — Newton Edge Tutorial" },
      {
        property: "og:description",
        content: "Your Foundational Class registration is confirmed.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? search["id"] : "",
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto size-14 text-gold" />
        <h1 className="mt-6 font-display text-3xl font-extrabold text-foreground">
          You're registered
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Class access is now available — no approval needed.
        </p>
        {id ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Registration ID
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">{id}</p>
          </div>
        ) : null}
        <Button asChild className="mt-8 h-12 w-full text-base">
          <Link to="/dashboard">Go to my dashboard</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}
