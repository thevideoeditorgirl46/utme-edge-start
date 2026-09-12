import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Bookmark,
  Bot,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,

  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MathText } from "@/components/ui/math-text";
import { Textarea } from "@/components/ui/textarea";
import { buildAskAiPrompt, CHATGPT_URL } from "@/lib/ask-ai";
import type { Option, StudentQuestion } from "@/lib/edge-practice.functions";
import { saveNote, submitAnswer, toggleBookmark } from "@/lib/edge-practice.functions";

interface QuestionCardProps {
  question: StudentQuestion;
  forceReveal?: boolean;
  revealedData?: { correctOption: string; explanation: string | null } | null | undefined;
  onAttemptRecorded?: (questionId: string, selected: string, isCorrect: boolean) => void;
  onBookmarkToggled?: (questionId: string, bookmarked: boolean) => void;
  onNoteSaved?: (questionId: string, body: string) => void;
  /** Fired only once the student has actually viewed the answer for this question. */
  onScored?: (questionId: string, isCorrect: boolean) => void;
  subjectName?: string | undefined;
  topicName?: string | undefined;
  passage?: string | null | undefined;
}

export function QuestionCard({
  question,
  forceReveal = false,
  revealedData,
  onAttemptRecorded,
  onBookmarkToggled,
  onNoteSaved,
  onScored,
  subjectName,
  topicName,
  passage,
}: QuestionCardProps) {
  const submit = useServerFn(submitAnswer);
  const toggleBm = useServerFn(toggleBookmark);
  const saveStudentNote = useServerFn(saveNote);

  // ── JAMB-style state ────────────────────────────────────────────────────────
  // Session-safe persistence so mobile tab switching never clears radio selection
  const sessionKey = `sel_opt_${question.id}`;
  const [selectedOption, setSelectedOption] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) return saved;
    }
    return question.attempt?.selected ?? null;
  });

  // submittedResult: populated ONLY after the student deliberately submits/reveals
  const [submittedResult, setSubmittedResult] = useState<{
    isCorrect: boolean;
    correctOption: string;
    explanation: string | null;
  } | null>(
    // If they previously attempted AND we have revealed data, pre-populate
    question.attempt && revealedData
      ? {
          isCorrect: question.attempt.isCorrect,
          correctOption: revealedData.correctOption,
          explanation: revealedData.explanation,
        }
      : null,
  );

  // showAnswer: user explicitly opened the answer panel
  const [showAnswer, setShowAnswer] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bookmark state
  const [bookmarked, setBookmarked] = useState(question.bookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Note state (popup modal dialog card)
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState(question.note || "");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // ── Sync forceReveal / revealedData from parent ──────────────────────────
  useEffect(() => {
    if (forceReveal && revealedData && !submittedResult) {
      // Parent explicitly clicked "View All Explanations"
      setSubmittedResult({
        isCorrect: selectedOption ? selectedOption === revealedData.correctOption : false,
        correctOption: revealedData.correctOption,
        explanation: revealedData.explanation,
      });
      setShowAnswer(true);
    } else if (revealedData && submittedResult) {
      // Update correctOption / explanation if revealed data arrives after a prior attempt
      setSubmittedResult((prev) =>
        prev
          ? {
              ...prev,
              correctOption: revealedData.correctOption,
              explanation: revealedData.explanation,
            }
          : prev,
      );
    }
  }, [forceReveal, revealedData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (forceReveal) {
      setShowAnswer(true);
    }
  }, [forceReveal]);

  // Report the score only after the answer has actually been viewed.
  useEffect(() => {
    if (submittedResult && (showAnswer || forceReveal) && selectedOption) {
      onScored?.(question.id, submittedResult.isCorrect);
    }
  }, [submittedResult, showAnswer, forceReveal, selectedOption]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** JAMB click = radio highlight only. No server call yet. */
  function handleSelectOption(key: "A" | "B" | "C" | "D") {
    if (submittedResult) return; // locked after submission
    if (isSubmitting) return;

    setSelectedOption(key);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, key);
    }
  }

  /** User deliberately submits their selected option. Instant reveal if pre-fetched! */
  async function handleSubmitAnswer() {
    if (!selectedOption || isSubmitting) return;

    // Instant local reveal if revealedData is already prefetched
    if (revealedData) {
      const isCorrect = selectedOption === revealedData.correctOption;
      setSubmittedResult({
        isCorrect,
        correctOption: revealedData.correctOption,
        explanation: revealedData.explanation,
      });
      setShowAnswer(true);
      onAttemptRecorded?.(question.id, selectedOption, isCorrect);

      // Record to server in the background without blocking UI
      void submit({
        data: { questionId: question.id, selected: selectedOption },
      }).catch(() => {
        // Non-blocking sync failure
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submit({
        data: { questionId: question.id, selected: selectedOption },
      });
      setSubmittedResult({
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        explanation: res.explanation,
      });
      setShowAnswer(true);
      onAttemptRecorded?.(question.id, selectedOption, res.isCorrect);
    } catch {
      toast.error("Failed to evaluate answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleBookmark() {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    setIsBookmarking(true);
    try {
      await toggleBm({ data: { questionId: question.id, bookmarked: nextState } });
      onBookmarkToggled?.(question.id, nextState);
      toast.success(nextState ? "Question bookmarked" : "Bookmark removed");
    } catch {
      setBookmarked(!nextState);
      toast.error("Could not update bookmark");
    } finally {
      setIsBookmarking(false);
    }
  }

  async function handleSaveNote() {
    setIsSavingNote(true);
    try {
      await saveStudentNote({ data: { questionId: question.id, body: noteBody } });
      onNoteSaved?.(question.id, noteBody);
      toast.success("Note saved");
    } catch {
      toast.error("Could not save note");
    } finally {
      setIsSavingNote(false);
    }
  }

  // ── Ask AI State & Handler ──────────────────────────────────────────────────
  const [isAskingAi, setIsAskingAi] = useState(false);

  async function handleAskAi() {
    setIsAskingAi(true);
    const toastId = toast.loading("Preparing your AI explanation...");

    try {
      const prompt = buildAskAiPrompt({
        subjectName,
        topicName,
        questionText: question.prompt,
        options: question.options,
        studentSelectedOption: selectedOption,
        passage,
      });

      // Silently prefill clipboard buffer in background as instant fallback
      try {
        await navigator.clipboard.writeText(prompt);
      } catch {
        // ignore
      }

      // Open ChatGPT directly with prefilled prompt parameter in a new tab
      const chatGptUrl = `${CHATGPT_URL}/?q=${encodeURIComponent(prompt)}`;
      window.open(chatGptUrl, "_blank", "noopener,noreferrer");

      toast.success("🤖 Opening ChatGPT with your question... Ready to answer!", {
        id: toastId,
        duration: 4500,
      });
    } catch {
      toast.error("Could not prepare AI prompt. Please try again.", { id: toastId });
    } finally {
      setIsAskingAi(false);
    }
  }

  // ── Derived display flags ──────────────────────────────────────────────────
  const isLocked = Boolean(submittedResult);
  const showExplanation =
    (showAnswer || forceReveal) &&
    Boolean(submittedResult?.explanation ?? revealedData?.explanation);

  return (
    <article
      id={`question-${question.number}`}
      className={`protected-practice-content select-none rounded-2xl border bg-card p-5 shadow-sm transition-all sm:p-6 ${
        submittedResult && showAnswer
          ? submittedResult.isCorrect
            ? "border-emerald-500/30 dark:border-emerald-500/20"
            : "border-red-500/30 dark:border-red-500/20"
          : "border-border"
      }`}
    >
      {/* Header: Question Number & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question {question.number}
        </span>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            disabled={isBookmarking}
            title={bookmarked ? "Remove bookmark" : "Bookmark question"}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
              bookmarked
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Bookmark className={`size-3.5 ${bookmarked ? "fill-current text-amber-500" : ""}`} />
            <span className="text-[11px] sm:text-xs">{bookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          {/* Note Toggle Button */}
          <button
            type="button"
            onClick={() => setNoteOpen((prev) => !prev)}
            title="Personal Note"
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
              noteOpen || question.note
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            <span className="text-[11px] sm:text-xs">
              {question.note ? "Note Added" : "Add Note"}
            </span>
          </button>

          {/* Ask AI Button */}
          <button
            type="button"
            onClick={handleAskAi}
            disabled={isAskingAi}
            title="Get a detailed explanation for this question with AI"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 active:scale-95"
          >
            {isAskingAi ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Bot className="size-3.5 text-primary" />
            )}
            <span className="text-[11px] sm:text-xs">{isAskingAi ? "Preparing..." : "Ask AI"}</span>
          </button>

        </div>
      </div>

      {/* Question Prompt */}
      <div className="mt-4">
        <MathText
          content={question.prompt}
          className="text-base font-medium leading-relaxed text-foreground whitespace-pre-wrap"
        />

        {question.imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <img
              src={question.imageUrl}
              alt={`Diagram for Question ${question.number}`}
              loading="lazy"
              className="max-h-80 w-auto object-contain"
            />
          </div>
        ) : null}
      </div>

      {/* ── JAMB Radio-Ball Option List ───────────────────────────────────── */}
      <div className="mt-5 space-y-2.5">
        {question.options.map((option: Option) => {
          const isSelected = selectedOption === option.key;
          const isCorrectAnswer = submittedResult?.correctOption === option.key;
          const isWrongSelected =
            isSelected &&
            submittedResult &&
            !submittedResult.isCorrect &&
            submittedResult.correctOption;

          // ── Colour scheme ─────────────────────────────────────────────────
          let outerStyles = "border-border bg-card hover:bg-secondary/60 text-foreground";
          let radioStyles =
            "border-2 border-muted-foreground/40 bg-background group-hover:border-primary/50";
          let radioDotVisible = false;

          if (submittedResult && showAnswer) {
            // After reveal: show correct (green) / wrong (red) / neutral
            if (isCorrectAnswer) {
              outerStyles =
                "border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium";
              radioStyles = "border-emerald-500 bg-emerald-500";
              radioDotVisible = true;
            } else if (isWrongSelected) {
              outerStyles = "border-red-500/60 bg-red-500/10 text-red-950 dark:text-red-200";
              radioStyles = "border-red-500 bg-red-500";
              radioDotVisible = true;
            } else if (isSelected) {
              outerStyles = "border-primary/40 bg-primary/5 text-foreground";
              radioStyles = "border-primary bg-primary";
              radioDotVisible = true;
            }
          } else if (submittedResult && !showAnswer) {
            // Submitted but answer panel hidden — show neutral clean selected state (no green/red spoiler)
            if (isSelected) {
              outerStyles = "border-primary bg-primary/10 text-foreground font-medium";
              radioStyles = "border-primary bg-primary";
              radioDotVisible = true;
            }
          } else if (isSelected) {
            // Not yet submitted — highlight the student's radio pick
            outerStyles = "border-primary bg-primary/10 text-foreground font-medium";
            radioStyles = "border-primary bg-primary";
            radioDotVisible = true;
          }

          return (
            <button
              key={option.key}
              type="button"
              disabled={isSubmitting || isLocked}
              onClick={() => handleSelectOption(option.key)}
              className={`group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${outerStyles} ${
                isLocked ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
              }`}
            >
              {/* JAMB-style radio circle */}
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full transition-all ${radioStyles}`}
              >
                {radioDotVisible ? (
                  <span className="size-2 rounded-full bg-white opacity-90" />
                ) : null}
              </span>

              {/* Option letter badge */}
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary/80 font-mono text-xs font-bold text-muted-foreground">
                {option.key}
              </span>

              <MathText content={option.text} className="flex-1 leading-snug" />

              {/* Correct tick shown after answer reveal */}
              {submittedResult && showAnswer && isCorrectAnswer ? (
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ── Submit / View Answer Action Bar (shown when option selected but not yet submitted) ── */}
      {!submittedResult && selectedOption ? (
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitAnswer}
            className="h-9 gap-2 text-sm"
          >
            {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Submit Answer
          </Button>
          <span className="text-xs text-muted-foreground">
            Selected: <strong>{selectedOption}</strong> · You can change your selection before
            submitting.
          </span>
        </div>
      ) : null}

      {/* ── Post-Submission Result Banner ────────────────────────────────── */}
      {submittedResult ? (
        showAnswer ? (
          <div
            className={`mt-4 rounded-xl border p-3.5 text-sm transition-all ${
              submittedResult.isCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                : "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                {submittedResult.isCorrect ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Correct ✓</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-red-600 dark:text-red-400" />
                    <span>Not quite</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* View / Hide Answer toggle */}
                <button
                  type="button"
                  onClick={() => setShowAnswer(false)}
                  className="inline-flex items-center gap-1 rounded-lg bg-background/60 px-2.5 py-1 text-xs font-medium hover:bg-background transition-colors text-foreground"
                >
                  <EyeOff className="size-3" /> Hide Answer
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {selectedOption ? (
                <p>
                  Your answer: <span className="font-bold">{selectedOption}</span>
                </p>
              ) : null}
              {submittedResult.correctOption ? (
                <p>
                  Correct answer:{" "}
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {submittedResult.correctOption}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Answer hidden</span>
              {selectedOption ? (
                <span>
                  · Your selection: <strong className="text-foreground">{selectedOption}</strong>
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Eye className="size-3.5" /> View Answer
            </button>
          </div>
        )
      ) : null}

      {/* ── Explanation Section ────────────────────────────────────────────── */}
      {showExplanation ? (
        <div className="mt-4 rounded-xl border border-border/80 bg-secondary/30 p-4 text-sm">
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            Explanation
          </p>
          <div className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap">
            <MathText content={submittedResult?.explanation ?? revealedData?.explanation ?? ""} />
          </div>
        </div>
      ) : null}

      {/* ── Alert for missing explanation ────────────────────────────────── */}
      {submittedResult &&
      showAnswer &&
      !submittedResult.explanation &&
      !revealedData?.explanation ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 px-4 py-2.5 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 shrink-0" />
          No explanation available for this question yet.
        </div>
      ) : null}

      {/* ── Personal Note Dialog Popup Card ──────────────────────────────── */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FileText className="size-4 text-primary" />
              Personal Note — Question {question.number}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Private study notes visible only to you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <p className="text-[11px] text-muted-foreground">
              💡 Helpful prompts: Formula to remember · Why I missed this · Key concept
            </p>
            <Textarea
              placeholder="Write your note here..."
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              className="min-h-[120px] text-sm bg-background resize-y"
            />
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNoteOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSavingNote}
              onClick={async () => {
                await handleSaveNote();
                setNoteOpen(false);
              }}
              className="h-8 text-xs"
            >
              {isSavingNote ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
