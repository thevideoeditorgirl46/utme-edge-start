import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { ShareUnlock } from "@/components/dashboard/ShareUnlock";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getMyAccount } from "@/lib/account.functions";
import { BRAND_ASSETS } from "@/lib/brand";
import type { ClassLinks } from "@/lib/public.functions";

const SUBJECT_TELEGRAM_MAP: Record<string, keyof ClassLinks> = {
  "Use of English": "telegram_english_url",
  Mathematics: "telegram_math_url",
  Physics: "telegram_physics_url",
  Chemistry: "telegram_chemistry_url",
  Biology: "telegram_biology_url",
};

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

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button
                  asChild={Boolean(data.links?.whatsapp_channel_url)}
                  disabled={!data.links?.whatsapp_channel_url}
                  className="h-12 text-base"
                >
                  {data.links?.whatsapp_channel_url ? (
                    <a href={data.links.whatsapp_channel_url} target="_blank" rel="noreferrer">
                      Follow WhatsApp channel
                    </a>
                  ) : (
                    <span>WhatsApp channel coming soon</span>
                  )}
                </Button>
                <Button
                  asChild={Boolean(data.links?.whatsapp_group_url)}
                  disabled={!data.links?.whatsapp_group_url}
                  variant="outline"
                  className="h-12 text-base"
                >
                  {data.links?.whatsapp_group_url ? (
                    <a href={data.links.whatsapp_group_url} target="_blank" rel="noreferrer">
                      Join general WhatsApp group
                    </a>
                  ) : (
                    <span>WhatsApp group coming soon</span>
                  )}
                </Button>
              </div>

              {data.registration?.subjects?.length ? (
                <div className="mt-6">
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Your Telegram subject classes
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {data.registration.subjects.map((subject) => {
                      const key = SUBJECT_TELEGRAM_MAP[subject];
                      const url = key ? (data.links as ClassLinks | null)?.[key] : undefined;
                      return (
                        <Button
                          key={subject}
                          asChild={Boolean(url)}
                          disabled={!url}
                          variant="outline"
                          className="h-12 text-base"
                        >
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer">
                              Join {subject} Telegram
                            </a>
                          ) : (
                            <span>{subject} Telegram coming soon</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>

            <ShareUnlock flyerUrl={data.links?.flyer_url ?? BRAND_ASSETS.flyer} />
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
