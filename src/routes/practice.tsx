import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { answerQuestion, getPracticeQuestions } from "@/lib/practice.functions";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Edge Practice — Newton Edge Tutorial" },
      {
        name: "description",
        content:
          "Mini JAMB-style practice questions unlocked by verified flyer shares, one question at a time with instant explanations.",
      },
      { property: "og:title", content: "Edge Practice — Newton Edge Tutorial" },
      {
        property: "og:description",
        content: "Practice UTME-style questions with instant feedback and explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const fetchQuestions = useServerFn(getPracticeQuestions);
  const answer = useServerFn(answerQuestion);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctOption: string;
    explanation: string | null;
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["practice"],
    queryFn: () => fetchQuestions(),
    enabled: Boolean(user),
  });

  const question = data?.questions[index];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold">Edge Practice</h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : !data?.unlocked ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Edge Practice is locked. Share the flyer and reach the required verified points to
              unlock it.
            </p>
            <Button asChild className="mt-4 h-12">
              <Link to="/dashboard">Go to Share &amp; Unlock</Link>
            </Button>
          </div>
        ) : !question ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Practice questions are being prepared. Check back soon.
          </p>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Question {index + 1} of {data.questions.length}
            </p>
            <p className="mt-3 text-base font-medium">{question.prompt}</p>

            <div className="mt-4 space-y-2">
              {question.options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  disabled={Boolean(result)}
                  onClick={() => setSelected(o.key)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected === o.key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <span className="font-semibold">{o.key}.</span> {o.text}
                </button>
              ))}
            </div>

            {result ? (
              <div className="mt-4 rounded-lg border border-border p-4 text-sm">
                <p className="font-semibold">
                  {result.isCorrect ? "Correct ✓" : `Incorrect — answer is ${result.correctOption}`}
                </p>
                {result.explanation ? (
                  <p className="mt-2 text-muted-foreground">{result.explanation}</p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex gap-3">
              {result ? (
                <Button
                  className="h-12"
                  disabled={index + 1 >= data.questions.length}
                  onClick={() => {
                    setIndex((i) => i + 1);
                    setSelected("");
                    setResult(null);
                  }}
                >
                  Next question
                </Button>
              ) : (
                <Button
                  className="h-12"
                  disabled={!selected}
                  onClick={async () => {
                    const r = await answer({
                      data: { questionId: question.id, selected },
                    });
                    setResult(r);
                  }}
                >
                  Submit answer
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
