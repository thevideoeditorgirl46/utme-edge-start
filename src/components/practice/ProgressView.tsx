import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Flame, Loader2, Target, Trophy, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getMyProgress } from "@/lib/edge-practice.functions";

interface ProgressViewProps {
  onStartPracticing: () => void;
}

export function ProgressView({ onStartPracticing }: ProgressViewProps) {
  const fetchProgress = useServerFn(getMyProgress);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-progress"],
    queryFn: () => fetchProgress(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 py-8">
        <div className="h-6 w-36 animate-pulse rounded bg-muted" />
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-border bg-card/60 p-4"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-lg py-12 text-center">
        <div className="rounded-2xl border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">We couldn't load your progress details.</p>
          <Button onClick={() => refetch()} className="mt-4" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { attempted, correct, wrong, accuracy, topics } = data;

  return (
    <div className="mx-auto w-full max-w-2xl pb-16">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Your Progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your practice consistency and accuracy across topics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Attempted</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{attempted}</p>
          <p className="text-[11px] text-muted-foreground">Practice questions</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Correct
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {correct}
          </p>
          <p className="text-[11px] text-muted-foreground">Answers right</p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-red-700 dark:text-red-400">Wrong</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-red-600 dark:text-red-400">
            {wrong}
          </p>
          <p className="text-[11px] text-muted-foreground">Questions to review</p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs uppercase tracking-wider text-primary">Accuracy</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-primary">{accuracy}%</p>
          <p className="text-[11px] text-muted-foreground">Overall rate</p>
        </div>
      </div>

      {/* Accuracy Bar */}
      {attempted > 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Overall Performance</span>
            <span className="text-primary">{accuracy}% accuracy</span>
          </div>
          <Progress value={accuracy} className="mt-2.5 h-2" />
        </div>
      ) : null}

      {/* Topic Breakdown */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold text-foreground">Topic Breakdown</h3>

        {topics.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-8 text-center">
            <Target className="mx-auto size-10 text-muted-foreground opacity-60" />
            <p className="mt-3 text-sm text-muted-foreground">
              You haven't practiced any topics yet.
            </p>
            <Button onClick={onStartPracticing} className="mt-4">
              Start Practicing Now
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {topics.map((t) => {
              const topicAccuracy = t.total ? Math.round((t.correct / t.total) * 100) : 0;
              return (
                <div
                  key={`${t.subject}-${t.name}`}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.subject}
                      </span>
                      <h4 className="font-display text-base font-bold text-foreground">{t.name}</h4>
                    </div>

                    <div className="text-right">
                      <span className="font-display text-base font-bold text-primary">
                        {topicAccuracy}%
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {t.correct} / {t.total} correct
                      </p>
                    </div>
                  </div>

                  <Progress value={topicAccuracy} className="mt-3 h-1.5" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
