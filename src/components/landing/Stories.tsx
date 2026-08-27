import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Quote, Star } from "lucide-react";

import { SectionHeading } from "@/components/landing/Sections";
import { Card, CardContent } from "@/components/ui/card";
import { getLandingContent } from "@/lib/public.functions";

export function Stories() {
  const fetchContent = useServerFn(getLandingContent);
  const { data } = useQuery({
    queryKey: ["landing-content"],
    queryFn: () => fetchContent({}),
  });

  const stories = data?.stories ?? [];

  return (
    <section id="stories" className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeading
          eyebrow="Success stories"
          title="Real students. Real UTME scores."
          subtitle="Newton Edge Tutorial students who rebuilt their foundation and scored above 300."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {stories.map((s) => (
            <Card key={s.id} className="overflow-hidden border-border/70 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  {s.photo_url ? (
                    <img
                      src={s.photo_url}
                      alt={`${s.student_name}, Newton Edge Tutorial student`}
                      loading="lazy"
                      className="size-14 rounded-full border border-gold/40 object-cover"
                    />
                  ) : null}
                  <div>
                    <h3 className="font-display text-base font-bold">{s.student_name}</h3>
                    <p className="flex items-center gap-1 text-sm font-semibold text-accent">
                      <Star className="size-3.5 fill-current" />
                      UTME {s.utme_score}
                    </p>
                  </div>
                </div>

                <Quote className="mt-4 size-4 text-accent" />
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.excerpt}</p>

                {s.result_image_url ? (
                  <img
                    src={s.result_image_url}
                    alt={`${s.student_name}'s UTME result showing ${s.utme_score}`}
                    loading="lazy"
                    className="mt-4 w-full rounded-xl border border-border object-contain"
                  />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
