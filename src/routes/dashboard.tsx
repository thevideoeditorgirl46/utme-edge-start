import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getMyAccount } from "@/lib/account.functions";
import { BRAND_ASSETS } from "@/lib/brand";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard — Newton Edge Tutorial" },
      {
        name: "description",
        content:
          "Your Foundational Class status, WhatsApp and Telegram class links, and the share-and-unlock practice reward.",
      },
      { property: "og:title", content: "My dashboard — Newton Edge Tutorial" },
      {
        property: "og:description",
        content: "Foundational Class status, class links and practice access.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const fetchAccount = useServerFn(getMyAccount);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-account", user?.id],
    queryFn: () => fetchAccount(),
    enabled: Boolean(user),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Welcome{data?.profile?.full_name ? `, ${data.profile.full_name.split(" ")[0]}` : ""}
        </h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading your details…</p>
        ) : !data?.registration ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              You haven't completed the registration form yet.
            </p>
            <Button asChild className="mt-4 h-12">
              <Link to="/register">Complete registration</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold">Foundational Class</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Stat label="Registration" value="Confirmed" />
                <Stat label="Class access" value="Available" />
                {data.profile?.registration_id ? (
                  <Stat label="Registration ID" value={data.profile.registration_id} />
                ) : null}
                <Stat label="UTME year" value={data.registration.utme_year} />
              </dl>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild={Boolean(data.links?.whatsapp_url)}
                  disabled={!data.links?.whatsapp_url}
                  className="h-12 flex-1 text-base"
                >
                  {data.links?.whatsapp_url ? (
                    <a href={data.links.whatsapp_url} target="_blank" rel="noreferrer">
                      Join WhatsApp class
                    </a>
                  ) : (
                    <span>WhatsApp link coming soon</span>
                  )}
                </Button>
                <Button
                  asChild={Boolean(data.links?.telegram_url)}
                  disabled={!data.links?.telegram_url}
                  variant="outline"
                  className="h-12 flex-1 text-base"
                >
                  {data.links?.telegram_url ? (
                    <a href={data.links.telegram_url} target="_blank" rel="noreferrer">
                      Join Telegram class
                    </a>
                  ) : (
                    <span>Telegram link coming soon</span>
                  )}
                </Button>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Share &amp; unlock practice</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Optional: share the flyer, then submit your screenshot to unlock Edge Practice.
              </p>
              <p className="mt-3 text-sm font-medium">
                Status:{" "}
                {data.unlocked
                  ? "Unlocked"
                  : data.submissions[0]?.status === "pending"
                    ? "Verification in progress"
                    : "Not unlocked yet"}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="h-12 flex-1">
                  <a href={data.links?.flyer_url ?? BRAND_ASSETS.flyer} download target="_blank" rel="noreferrer">
                    Download the flyer
                  </a>
                </Button>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}
