import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  Sparkles,
  Tag,
  Trophy,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { StudentQuestion } from "@/lib/edge-practice.functions";
import {
  getMultiTopicQuestionPage,
  getQuestionPage,
  revealAnswers,
} from "@/lib/edge-practice.functions";

import { ContentProtection } from "./ContentProtection";
import { getCachedData, setCachedData } from "./offline-cache";
import { QuestionCard } from "./QuestionCard";

// ── Single-topic mode props ────────────────────────────────────────────────
interface SingleTopicProps {
  mode?: "single";
  subjectSlug: string;
  topicSlug: string;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onBackToTopics: () => void;
}

// ── Multi-topic mode props ─────────────────────────────────────────────────
interface MultiTopicProps {
  mode: "multi";
  subjectSlug: string;
  topicSlugs: string[];
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onBackToTopics: () => void;
}

type PracticeEngineProps = SingleTopicProps | MultiTopicProps;

interface PracticePageData {
  subject: { name: string };
  topic?: { name: string };
  topicNames?: string[];
  total: number;
  totalPages: number;
  pageSize: number;
  questions: (StudentQuestion & { topicName?: string })[];
}

export function PracticeEngine(props: PracticeEngineProps) {
  const { subjectSlug, currentPage, onPageChange, onBackToTopics } = props;
  const isMulti = props.mode === "multi";

  const queryClient = useQueryClient();
  const fetchSinglePage = useServerFn(getQuestionPage);
  const fetchMultiPage = useServerFn(getMultiTopicQuestionPage);
  const fetchExplanations = useServerFn(revealAnswers);

  const [allRevealed, setAllRevealed] = useState(false);
  const [isRevealingAll, setIsRevealingAll] = useState(false);
  const [revealedMap, setRevealedMap] = useState<
    Record<string, { correctOption: string; explanation: string | null }>
  >({});

  // Score tracker: a question only counts once its answer has actually been viewed
  const [scoreMap, setScoreMap] = useState<Record<string, boolean>>({});

  function handleScored(questionId: string, isCorrect: boolean) {
    setScoreMap((prev) =>
      prev[questionId] === isCorrect ? prev : { ...prev, [questionId]: isCorrect },
    );
  }

  const scoreValues = Object.values(scoreMap);
  const scoreGraded = scoreValues.length;
  const scoreCorrect = scoreValues.filter(Boolean).length;
  const scorePercent = scoreGraded ? Math.round((scoreCorrect / scoreGraded) * 100) : 0;

  // Build a stable cache key
  const cacheKey = isMulti
    ? `page_${subjectSlug}_multi_${(props as MultiTopicProps).topicSlugs.sort().join("-")}_${currentPage}`
    : `page_${subjectSlug}_${(props as SingleTopicProps).topicSlug}_${currentPage}`;

  // Build a stable query key
  const queryKey = isMulti
    ? [
        "practice-page-multi",
        subjectSlug,
        (props as MultiTopicProps).topicSlugs.slice().sort().join(","),
        currentPage,
      ]
    : ["practice-page", subjectSlug, (props as SingleTopicProps).topicSlug, currentPage];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<PracticePageData> => {
      try {
        let res: PracticePageData;
        if (isMulti) {
          res = (await fetchMultiPage({
            data: {
              subject: subjectSlug,
              topicSlugs: (props as MultiTopicProps).topicSlugs,
              page: currentPage,
            },
          })) as PracticePageData;
        } else {
          res = (await fetchSinglePage({
            data: {
              subject: subjectSlug,
              topic: (props as SingleTopicProps).topicSlug,
              page: currentPage,
            },
          })) as PracticePageData;
        }
        setCachedData(cacheKey, res);
        return res;
      } catch (err) {
        const cached = getCachedData<PracticePageData>(cacheKey);
        if (cached) {
          toast.info("Offline mode: viewing previously loaded questions");
          return cached;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour stale time so tab switching never re-fetches
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Reset revealed state when page / topic changes
  useEffect(() => {
    setAllRevealed(false);
    setRevealedMap({});
    setScoreMap({});
  }, [currentPage, cacheKey]);

  // Silently prefetch answers & explanations for the active page
  // so student clicks on "View Answer" or "Submit Answer" respond in 0ms without server lag
  useEffect(() => {
    if (!data?.questions?.length) return;
    const qIds = data.questions.map((q: StudentQuestion) => q.id);
    let isMounted = true;

    void fetchExplanations({ data: { questionIds: qIds } })
      .then((res) => {
        if (!isMounted || !res?.answers) return;
        const nextMap: Record<string, { correctOption: string; explanation: string | null }> = {};
        for (const item of res.answers) {
          nextMap[item.questionId] = {
            correctOption: item.correctOption,
            explanation: item.explanation,
          };
        }
        setRevealedMap((prev) => ({ ...nextMap, ...prev }));
      })
      .catch(() => {
        // Silently ignore background prefetch errors; fallback is handled per-question on submit
      });

    return () => {
      isMounted = false;
    };
  }, [data, fetchExplanations]);

  // Prefetch next page
  useEffect(() => {
    if (data && currentPage < data.totalPages) {
      const nextPage = currentPage + 1;
      const nextCacheKey = cacheKey.replace(`_${currentPage}`, `_${nextPage}`);
      const nextQueryKey = [...queryKey.slice(0, -1), nextPage];

      void queryClient.prefetchQuery({
        queryKey: nextQueryKey,
        queryFn: async () => {
          let res;
          if (isMulti) {
            res = await fetchMultiPage({
              data: {
                subject: subjectSlug,
                topicSlugs: (props as MultiTopicProps).topicSlugs,
                page: nextPage,
              },
            });
          } else {
            res = await fetchSinglePage({
              data: {
                subject: subjectSlug,
                topic: (props as SingleTopicProps).topicSlug,
                page: nextPage,
              },
            });
          }
          setCachedData(nextCacheKey, res);
          return res;
        },
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [data, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const { subject, total, totalPages, questions, pageSize } = data;
  const startNumber = (currentPage - 1) * pageSize + 1;
  const endNumber = Math.min(currentPage * pageSize, total);

  // For multi-topic: build a label showing selected topic names
  const practiceTitle = isMulti
    ? `Mixed Practice · ${(data as { topicNames: string[] }).topicNames?.join(", ") ?? "Multiple Topics"}`
    : ((data as { topic: { name: string } }).topic?.name ?? "Practice");

  const practiceSub = isMulti
    ? `${(data as { topicNames: string[] }).topicNames?.length ?? 0} topics combined`
    : undefined;

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
        <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
          {practiceTitle}
        </span>
      </nav>

      {/* Title & Stats */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            {practiceTitle}
          </h1>
          {practiceSub ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="size-3" />
              {practiceSub}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {total > 0
              ? `Questions ${startNumber}–${endNumber} of ${total}`
              : "No questions published yet in this selection."}
          </p>
        </div>

        {/* Score tracker — only counts questions whose answer has been viewed */}
        {total > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5">
            <Trophy className="size-4 text-primary" />
            <div>
              <p className="font-display text-lg font-extrabold leading-none text-foreground">
                {scoreCorrect} / {scoreGraded}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Score this page{scoreGraded > 0 ? ` · ${scorePercent}%` : " · answers viewed only"}
              </p>
            </div>
          </div>
        ) : null}

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

      {/* Multi-topic topic-name chip strip */}
      {isMulti && (data as { topicNames: string[] }).topicNames?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(data as { topicNames: string[] }).topicNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              <Sparkles className="size-3 text-primary/60" />
              {name}
            </span>
          ))}
        </div>
      ) : null}

      {/* Question List */}
      {questions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Practice questions for this selection are currently being prepared by the NET content
            team.
          </p>
          <Button onClick={onBackToTopics} className="mt-4">
            Choose Another Topic
          </Button>
        </div>
      ) : (
        <ContentProtection className="mt-6 space-y-6">
          {questions.map((q: StudentQuestion & { topicName?: string }) => (
            <div key={q.id}>
              {/* Per-question topic badge in multi mode */}
              {isMulti && q.topicName ? (
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    <Tag className="size-3" />
                    {q.topicName}
                  </span>
                </div>
              ) : null}
              <QuestionCard
                question={q}
                forceReveal={allRevealed}
                revealedData={revealedMap[q.id]}
                onScored={handleScored}
                subjectName={subject.name}
                topicName={q.topicName || (data as { topic?: { name: string } }).topic?.name}
              />
            </div>
          ))}
        </ContentProtection>
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
