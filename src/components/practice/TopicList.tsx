import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getTopics } from "@/lib/edge-practice.functions";

interface TopicListProps {
  subjectSlug: string;
  onSelectTopic: (topicSlug: string) => void;
  onBackToSubjects: () => void;
}

export function TopicList({ subjectSlug, onSelectTopic, onBackToSubjects }: TopicListProps) {
  const fetchTopics = useServerFn(getTopics);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["practice-topics", subjectSlug],
    queryFn: () => fetchTopics({ data: { subject: subjectSlug } }),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-3 py-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-60 animate-pulse rounded bg-muted" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-border bg-card/60 p-5"
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
          <p className="text-sm text-muted-foreground">
            We couldn't load the topics for this subject.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button onClick={() => refetch()} size="sm">
              Try Again
            </Button>
            <Button onClick={onBackToSubjects} variant="outline" size="sm">
              Back to Subjects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { subject, topics } = data;

  return (
    <div className="mx-auto w-full max-w-2xl pb-16">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBackToSubjects}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Subjects</span>
      </button>

      {/* Subject Header */}
      <div className="mt-3">
        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          {subject.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a topic to practice</p>
      </div>

      {/* Topics List */}
      <div className="mt-6 space-y-3">
        {topics.map((topic) => {
          const hasQuestions = topic.questions > 0;
          return (
            <button
              key={topic.slug}
              type="button"
              disabled={!hasQuestions}
              onClick={() => onSelectTopic(topic.slug)}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all ${
                hasQuestions
                  ? "hover:border-primary/50 hover:bg-secondary/40 hover:shadow-sm active:scale-[0.99]"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{topic.name}</h3>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {topic.questions} {topic.questions === 1 ? "question" : "questions"}
                    </span>
                    {topic.attempted > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3" />
                        {topic.attempted} attempted
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {hasQuestions ? (
                <ChevronRight className="size-5 text-muted-foreground" />
              ) : (
                <span className="text-[11px] font-medium text-muted-foreground">Coming soon</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
