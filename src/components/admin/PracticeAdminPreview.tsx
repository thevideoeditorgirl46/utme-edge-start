import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  GraduationCap,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MathText } from "@/components/ui/math-text";
import { buildAskAiPrompt, GOOGLE_GEMINI_URL } from "@/lib/ask-ai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Option, StudentQuestion } from "@/lib/edge-practice.functions";
import { getAdminPracticePreview } from "@/lib/practice-admin.functions";

type AdminSubject = { id: string; slug: string; name: string };
type AdminTopic = { id: string; slug: string; name: string; subject_id: string };

export function PracticeAdminPreview() {
  const fetchPreview = useServerFn(getAdminPracticePreview);

  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string>("mathematics");
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Simulator local state
  const [attempts, setAttempts] = useState<
    Record<string, { selected: string; isCorrect: boolean }>
  >({});
  const [changingAnswerId, setChangingAnswerId] = useState<string | null>(null);
  const [pendingOptionMap, setPendingOptionMap] = useState<Record<string, string>>({});
  const [allRevealed, setAllRevealed] = useState<boolean>(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-practice-preview", selectedSubjectSlug, selectedTopicSlug, statusFilter],
    queryFn: () =>
      fetchPreview({
        data: {
          subjectSlug: selectedSubjectSlug || undefined,
          topicSlug: selectedTopicSlug || undefined,
          statusFilter: statusFilter !== "all" ? statusFilter : undefined,
        },
      }),
  });

  const subjects: AdminSubject[] = data?.subjects ?? [];
  const topics: AdminTopic[] = (data?.topics as AdminTopic[]) ?? [];
  const activeSubject = data?.activeSubject;
  const activeTopic = data?.activeTopic;
  const allQuestions = data?.questions ?? [];

  // Pagination slice
  const total = allQuestions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentQuestions = allQuestions.slice((page - 1) * pageSize, page * pageSize);

  // Statistics
  const attemptedCount = Object.keys(attempts).length;
  const correctCount = Object.values(attempts).filter((a) => a.isCorrect).length;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  function handleSelectOption(qId: string, correctOption: string, optionKey: string) {
    if (attempts[qId] && changingAnswerId !== qId) return;

    if (changingAnswerId === qId) {
      setPendingOptionMap((prev) => ({ ...prev, [qId]: optionKey }));
      return;
    }

    const isCorrect = optionKey === correctOption;
    setAttempts((prev) => ({
      ...prev,
      [qId]: { selected: optionKey, isCorrect },
    }));
  }

  function confirmChangeAnswer(qId: string, correctOption: string) {
    const pending = pendingOptionMap[qId];
    if (!pending) return;

    const isCorrect = pending === correctOption;
    setAttempts((prev) => ({
      ...prev,
      [qId]: { selected: pending, isCorrect },
    }));
    setChangingAnswerId(null);
    setPendingOptionMap((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    toast.success("Answer updated in simulator");
  }

  function resetSimulator() {
    setAttempts({});
    setChangingAnswerId(null);
    setPendingOptionMap({});
    setAllRevealed(false);
    toast.info("Simulator state reset");
  }

  async function handleAskAiForQuestion(
    q: { prompt: string; options: Option[]; id: string },
    qNumber: number,
  ) {
    const toastId = toast.loading("Preparing your AI explanation...");
    try {
      const prompt = buildAskAiPrompt({
        subjectName: activeSubject?.name,
        topicName: activeTopic?.name,
        questionText: q.prompt,
        options: q.options,
        studentSelectedOption: attempts[q.id]?.selected,
      });

      setPreparedAiPrompt(prompt);
      try {
        await navigator.clipboard.writeText(prompt);
      } catch {
        // ignore
      }

      const geminiUrl = `${GOOGLE_GEMINI_URL}?prompt=${encodeURIComponent(prompt)}`;
      window.open(geminiUrl, "_blank", "noopener,noreferrer");
      toast.success("🤖 Opening Gemini with your question... Just click Enter or Send!", {
        id: toastId,
        duration: 4000,
      });
    } catch {
      toast.error("Could not prepare AI prompt", { id: toastId });
    }
  }

  return (
    <section className="space-y-6">
      {/* Simulator Control & Filter Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Edge Practice — Live Student Simulator
              </h2>
              <p className="text-xs text-muted-foreground">
                Preview the live student practice experience across subjects, topics, and question
                statuses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={resetSimulator}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Reset Test Answers
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-3" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Subject */}
          <div className="w-44">
            <Label className="text-[11px] font-semibold text-muted-foreground">Subject</Label>
            <Select
              value={selectedSubjectSlug}
              onValueChange={(val) => {
                setSelectedSubjectSlug(val);
                setSelectedTopicSlug("");
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="w-52">
            <Label className="text-[11px] font-semibold text-muted-foreground">Topic</Label>
            <Select
              value={selectedTopicSlug || (activeTopic?.slug ?? "")}
              onValueChange={(val) => {
                setSelectedTopicSlug(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <Label className="text-[11px] font-semibold text-muted-foreground">
              Question Status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Drafts + Live)</SelectItem>
                <SelectItem value="published">Published Only</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Simulator Metrics */}
          <div className="ml-auto flex items-center gap-3 pt-4 text-xs font-medium">
            <div className="rounded-lg bg-secondary/80 px-2.5 py-1">
              Attempted: <span className="font-bold">{attemptedCount}</span> / {total}
            </div>
            <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
              Score: <span className="font-bold">{correctCount}</span> Correct ({accuracy}%)
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Practice Feed */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-border bg-card/60 p-6"
            />
          ))}
        </div>
      ) : allQuestions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <AlertCircle className="mx-auto size-8 text-muted-foreground" />
          <h3 className="mt-3 font-display text-base font-bold">No questions found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No questions match this subject, topic, and status filter in the database.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Practice Header matching student view */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span>{activeSubject?.name || "Subject"}</span>
                <span>›</span>
                <span className="text-foreground">{activeTopic?.name || "Topic"}</span>
              </div>
              <h1 className="mt-1 font-display text-xl font-extrabold text-foreground sm:text-2xl">
                {activeTopic?.name}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Questions {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAllRevealed((prev) => !prev)}
              className="h-9 gap-1.5 self-start text-xs sm:self-auto"
            >
              <Eye className="size-3.5" />
              {allRevealed ? "Hide Explanations" : "View All Explanations"}
            </Button>
          </div>

          {/* Question Cards Feed */}
          <div className="space-y-6">
            {currentQuestions.map((q, idx) => {
              const qNumber = (page - 1) * pageSize + idx + 1;
              const userAttempt = attempts[q.id];
              const isChanging = changingAnswerId === q.id;
              const pendingOpt = pendingOptionMap[q.id];
              const isAnswered = Boolean(userAttempt);
              const showExp = allRevealed || isAnswered;

              return (
                <article
                  key={q.id}
                  className={`protected-practice-content select-none rounded-2xl border bg-card p-5 shadow-sm transition-all sm:p-6 ${
                    userAttempt
                      ? userAttempt.isCorrect
                        ? "border-emerald-500/30 dark:border-emerald-500/20"
                        : "border-red-500/30 dark:border-red-500/20"
                      : "border-border"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Question {qNumber}
                      </span>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {q.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAskAiForQuestion(q, qNumber)}
                        title="Get a detailed explanation for this question with AI"
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 text-[11px] font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
                      >
                        <Bot className="size-3 text-primary" />
                        <span>Ask AI</span>
                      </button>
                      <span className="hidden text-[11px] text-muted-foreground sm:inline">
                        Staff Simulator Mode
                      </span>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="mt-4">
                    <MathText
                      content={q.prompt}
                      className="text-base font-medium leading-relaxed text-foreground whitespace-pre-wrap"
                    />

                    {q.imageUrl ? (
                      <div className="mt-4 overflow-hidden rounded-xl border border-border">
                        <img
                          src={q.imageUrl}
                          alt={`Diagram for Question ${qNumber}`}
                          loading="lazy"
                          className="max-h-72 w-auto object-contain mx-auto"
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Options */}
                  <div className="mt-5 space-y-2.5">
                    {q.options.map((option: Option) => {
                      const isSelected = userAttempt?.selected === option.key;
                      const isPending = isChanging && pendingOpt === option.key;
                      const isCorrect = userAttempt && q.correctOption === option.key;
                      const isWrongSelected = isSelected && userAttempt && !userAttempt.isCorrect;

                      let btnStyles = "border-border bg-card hover:bg-secondary/60 text-foreground";
                      let badgeStyles = "bg-secondary text-muted-foreground";

                      if (userAttempt) {
                        if (isCorrect) {
                          btnStyles =
                            "border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium";
                          badgeStyles = "bg-emerald-600 text-white";
                        } else if (isWrongSelected) {
                          btnStyles =
                            "border-red-500/60 bg-red-500/10 text-red-950 dark:text-red-200";
                          badgeStyles = "bg-red-600 text-white";
                        } else if (isSelected) {
                          btnStyles = "border-primary bg-primary/10 text-foreground";
                          badgeStyles = "bg-primary text-primary-foreground";
                        }
                      } else if (isSelected || isPending) {
                        btnStyles = "border-primary bg-primary/10 text-foreground font-medium";
                        badgeStyles = "bg-primary text-primary-foreground";
                      }

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleSelectOption(q.id, q.correctOption, option.key)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${btnStyles} ${
                            isAnswered && !isChanging
                              ? "cursor-default"
                              : "cursor-pointer active:scale-[0.99]"
                          }`}
                        >
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${badgeStyles}`}
                          >
                            {option.key}
                          </span>
                          <MathText content={option.text} className="mt-0.5 flex-1 leading-snug" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Banner */}
                  {userAttempt ? (
                    <div
                      className={`mt-4 rounded-xl border p-3.5 text-sm transition-all ${
                        userAttempt.isCorrect
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                          : "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-semibold">
                          {userAttempt.isCorrect ? (
                            <>
                              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Correct ✓</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="size-4 text-red-600 dark:text-red-400" />
                              <span>Not quite (Correct: {q.correctOption})</span>
                            </>
                          )}
                        </div>

                        {!isChanging ? (
                          <button
                            type="button"
                            onClick={() => setChangingAnswerId(q.id)}
                            className="text-xs font-medium underline underline-offset-4 hover:opacity-100 opacity-80"
                          >
                            Change answer
                          </button>
                        ) : null}
                      </div>

                      {/* Change Answer Confirmation */}
                      {isChanging ? (
                        <div className="mt-3 border-t border-border/40 pt-3">
                          <p className="text-xs font-medium">
                            Select a new option above, then click confirm:
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              size="sm"
                              disabled={!pendingOpt}
                              onClick={() => confirmChangeAnswer(q.id, q.correctOption)}
                              className="h-8 text-xs"
                            >
                              Confirm new answer ({pendingOpt || "none"})
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setChangingAnswerId(null)}
                              className="h-8 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Explanation with Diagram & LaTeX Support */}
                  {showExp && q.explanation ? (
                    <div className="mt-4 rounded-xl border border-border/80 bg-secondary/30 p-4 text-sm">
                      <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Explanation & Solution
                      </p>
                      <div className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap">
                        <MathText content={q.explanation} />
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row">
              <div className="text-xs text-muted-foreground">
                Page {page} of {totalPages} ({total} questions total)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-9 text-xs"
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>

                <span className="px-2 font-mono text-xs font-semibold">
                  {page} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-9 text-xs"
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
