import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { StudentQuestion } from "@/lib/edge-practice.functions";
import { getQuestionPage, revealAnswers } from "@/lib/edge-practice.functions";

import { getCachedData, setCachedData } from "./offline-cache";
import { QuestionCard } from "./QuestionCard";

interface PracticeEngineProps {
  subjectSlug: string;
  topicSlug: string;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onBackToTopics: () => void;
}

export function PracticeEngine({
  subjectSlug,
  topicSlug,
  currentPage,
  onPageChange,
  onBackToTopics,
}: PracticeEngineProps) {
  const queryClient = useQueryClient();
  const fetchPage = useServerFn(getQuestionPage);
  const fetchExplanations = useServerFn(revealAnswers);

  const [allRevealed, setAllRevealed] = useState(false);
  const [isRevealingAll, setIsRevealingAll] = useState(false);
  const [revealedMap, setRevealedMap] = useState<
    Record<string, { correctOption: string; explanation: string | null }>
  >({});

  const cacheKey = `page_${subjectSlug}_${topicSlug}_${currentPage}`;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["practice-page", subjectSlug, topicSlug, currentPage],
    queryFn: async () => {
      try {
        const res = await fetchPage({
          data: { subject: subjectSlug, topic: topicSlug, page: currentPage },
        });
        // Cache for offline resilience
        setCachedData(cacheKey, res);
        return res;
      } catch (err) {
        // Attempt offline cache retrieval
        const cached = getCachedData<Awaited<ReturnType<typeof fetchPage>>>(cacheKey);
        if (cached) {
          toast.info("Offline mode: viewing previously loaded questions");
          return cached;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Reset revealed state when page changes
  useEffect(() => {
    setAllRevealed(false);
    setRevealedMap({});
  }, [currentPage, topicSlug, subjectSlug]);

  // Prefetch next page if available
  useEffect(() => {
    if (data && currentPage < data.totalPages) {
      const nextPage = currentPage + 1;
      const nextCacheKey = `page_${subjectSlug}_${topicSlug}_${nextPage}`;
      void queryClient.prefetchQuery({
        queryKey: ["practice-page", subjectSlug, topicSlug, nextPage],
        queryFn: async () => {
          const res = await fetchPage({
            data: { subject: subjectSlug, topic: topicSlug, page: nextPage },
          });
          setCachedData(nextCacheKey, res);
          return res;
        },
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [data, currentPage, subjectSlug, topicSlug, fetchPage, queryClient]);

  // Handle View All Explanations
  async function handleViewAllExplanations() {
    if (!data?.questions?.length) return;
    setIsRevealingAll(true);
    try {
      const qIds = data.questions.map((q: StudentQuestion) => q.id);
      const res = await fetchExplanations({ data: { questionIds: qIds } });
      const nextMap: Record<string, { correctOption: string; explanation: string | null }> = {};
      for (const item of res.answers) {
        nextMap[item.questionId] = {
          correctOption: item.correctOption,
          explanation: item.explanation,
        };
      }
      setRevealedMap(nextMap);
      setAllRevealed(true);
      toast.success("Explanations revealed for all questions on this page");
    } catch {
      toast.error("Could not reveal explanations. Please try again.");
    } finally {
      setIsRevealingAll(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 py-8">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-border bg-card/60 p-6"
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
          <WifiOff className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-lg font-bold text-foreground">
            We couldn't load these questions.
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Please check your connection and try again.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => refetch()} variant="default" className="h-10">
              <RefreshCw className="mr-2 size-4" /> Try Again
            </Button>
            <Button onClick={onBackToTopics} variant="outline" className="h-10">
              Back to Topics
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { subject, topic, total, totalPages, questions, pageSize } = data;
  const startNumber = (currentPage - 1) * pageSize + 1;
  const endNumber = Math.min(currentPage * pageSize, total);

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      {/* Breadcrumbs & Navigation Header */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <button
          type="button"
          onClick={onBackToTopics}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>{subject.name}</span>
        </button>
        <span>›</span>
        <span className="font-semibold text-foreground">{topic.name}</span>
      </nav>

      {/* Title & Stats */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            {topic.name}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {total > 0
              ? `Questions ${startNumber}–${endNumber} of ${total}`
              : "No questions published yet in this topic."}
          </p>
        </div>

        {total > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRevealingAll || allRevealed}
            onClick={handleViewAllExplanations}
            className="h-9 gap-1.5 self-start text-xs sm:self-auto"
          >
            {isRevealingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {allRevealed ? "All Explanations Visible" : "View All Explanations"}
          </Button>
        ) : null}
      </div>

      {/* Question List */}
      {questions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Practice questions for {topic.name} are currently being prepared by the NET content
            team.
          </p>
          <Button onClick={onBackToTopics} className="mt-4">
            Choose Another Topic
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {questions.map((q: StudentQuestion) => (
            <QuestionCard
              key={q.id}
              question={q}
              forceReveal={allRevealed}
              revealedData={revealedMap[q.id]}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 ? (
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row">
          <div className="text-xs text-muted-foreground">
            Questions {startNumber}–{endNumber} of {total} · Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => {
                onPageChange(currentPage - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 gap-1 text-xs"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>

            <span className="px-2 font-mono text-xs font-semibold">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => {
                onPageChange(currentPage + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 gap-1 text-xs"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
