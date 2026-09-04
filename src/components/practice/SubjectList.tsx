import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Atom,
  BookMarked,
  BookOpen,
  Calculator,
  ChevronRight,
  Dna,
  FlaskConical,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSubjects } from "@/lib/edge-practice.functions";

const SUBJECT_ICONS: Record<string, typeof Atom> = {
  mathematics: Calculator,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  english: BookOpen,
};

interface SubjectListProps {
  onSelectSubject: (subjectSlug: string) => void;
  activeTab: "practice" | "saved" | "progress";
  onTabChange: (tab: "practice" | "saved" | "progress") => void;
}

export function SubjectList({ onSelectSubject, activeTab, onTabChange }: SubjectListProps) {
  const fetchSubjects = useServerFn(getSubjects);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["practice-subjects"],
    queryFn: () => fetchSubjects(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 py-8">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border bg-card/60 p-5"
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
            We couldn't load practice subjects. Please try again.
          </p>
          <Button onClick={() => refetch()} className="mt-4" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const subjects = data.subjects ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <GraduationCap className="size-3.5" />
          <span>Newton Edge Foundational Class</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          Edge Practice
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What do you want to practice? Choose a subject to get started.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => onTabChange("practice")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "practice"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <BookOpen className="size-3.5" />
          Practice Questions
        </button>

        <button
          type="button"
          onClick={() => onTabChange("saved")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "saved"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <BookMarked className="size-3.5" />
          Saved Questions
        </button>

        <button
          type="button"
          onClick={() => onTabChange("progress")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "progress"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <TrendingUp className="size-3.5" />
          Your Progress
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {subjects.map((sub: { slug: string; name: string; topics: number; questions: number }) => {
          const Icon = SUBJECT_ICONS[sub.slug] || BookOpen;
          return (
            <button
              key={sub.slug}
              type="button"
              onClick={() => onSelectSubject(sub.slug)}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-secondary/40 hover:shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <Icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {sub.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {sub.topics} {sub.topics === 1 ? "topic" : "topics"} · {sub.questions}{" "}
                    {sub.questions === 1 ? "question" : "questions"}
                  </p>
                </div>
              </div>

              <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
