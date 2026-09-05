import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  Square,
  SquareCheck,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getTopics } from "@/lib/edge-practice.functions";

interface TopicListProps {
  subjectSlug: string;
  /** Single-topic mode (legacy): called when user taps a single topic row directly */
  onSelectTopic: (topicSlug: string) => void;
  /** Multi-topic mode: called when user clicks "Start Practice" with ≥1 topic checked */
  onStartMultiTopic?: (topicSlugs: string[]) => void;
  onBackToSubjects: () => void;
}

export function TopicList({
  subjectSlug,
  onSelectTopic,
  onStartMultiTopic,
  onBackToSubjects,
}: TopicListProps) {
  const fetchTopics = useServerFn(getTopics);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [multiMode, setMultiMode] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["practice-topics", subjectSlug],
    queryFn: () => fetchTopics({ data: { subject: subjectSlug } }),
  });

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function handleStartMulti() {
    const slugs = [...selected];
    if (slugs.length === 0) return;
    if (slugs.length === 1 && slugs[0]) {
      onSelectTopic(slugs[0]);
    } else if (onStartMultiTopic) {
      onStartMultiTopic(slugs);
    }
  }

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
  const availableTopics = topics.filter((t) => t.questions > 0);
  const selectedCount = selected.size;

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
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            {subject.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {multiMode ? "Check topics to practice together" : "Choose a topic to practice"}
          </p>
        </div>

        {/* Multi-topic toggle */}
        {availableTopics.length > 1 && onStartMultiTopic ? (
          <button
            type="button"
            onClick={() => {
              setMultiMode((m) => !m);
              setSelected(new Set());
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              multiMode
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            <Sparkles className="size-3.5" />
            {multiMode ? "Cancel Multi-Select" : "Practice Multiple Topics"}
          </button>
        ) : null}
      </div>

      {/* Topics List */}
      <div className="mt-6 space-y-3">
        {topics.map((topic) => {
          const hasQuestions = topic.questions > 0;
          const isChecked = selected.has(topic.slug);

          if (multiMode) {
            // ── Multi-select checkbox row ────────────────────────────────
            return (
              <button
                key={topic.slug}
                type="button"
                disabled={!hasQuestions}
                onClick={() => hasQuestions && toggleSelect(topic.slug)}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-5 text-left transition-all ${
                  isChecked
                    ? "border-primary bg-primary/10 shadow-sm"
                    : hasQuestions
                      ? "border-border bg-card hover:border-primary/50 hover:bg-secondary/40"
                      : "border-border bg-card opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                      isChecked ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isChecked ? (
                      <SquareCheck className="size-5" />
                    ) : (
                      <Square className="size-5 opacity-60" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {topic.name}
                    </h3>
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
                  isChecked ? (
                    <span className="text-[11px] font-bold text-primary">Selected</span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Tap to select</span>
                  )
                ) : (
                  <span className="text-[11px] font-medium text-muted-foreground">Coming soon</span>
                )}
              </button>
            );
          }

          // ── Single-topic row (default) ────────────────────────────────
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

      {/* Multi-topic Start CTA */}
      {multiMode && selectedCount > 0 ? (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-5 py-3 shadow-xl backdrop-blur-md">
            <span className="text-sm font-medium text-foreground">
              <span className="font-bold text-primary">{selectedCount}</span>{" "}
              {selectedCount === 1 ? "topic" : "topics"} selected
            </span>
            <Button type="button" onClick={handleStartMulti} className="h-9 gap-1.5 text-sm">
              <Sparkles className="size-4" />
              Start Practice
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
