import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Bookmark,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MathText } from "@/components/ui/math-text";
import { Textarea } from "@/components/ui/textarea";
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
}

export function QuestionCard({
  question,
  forceReveal = false,
  revealedData,
  onAttemptRecorded,
  onBookmarkToggled,
  onNoteSaved,
}: QuestionCardProps) {
  const submit = useServerFn(submitAnswer);
  const toggleBm = useServerFn(toggleBookmark);
  const saveStudentNote = useServerFn(saveNote);

  // ── JAMB-style state ────────────────────────────────────────────────────────
  // selectedOption: the radio the student clicked (highlight only, no server call yet)
  const [selectedOption, setSelectedOption] = useState<string | null>(
    question.attempt?.selected ?? null,
  );

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

  // Change-answer flow (only available after submission)
  const [isChangingAnswer, setIsChangingAnswer] = useState(false);
  const [pendingOption, setPendingOption] = useState<string | null>(null);

  // Bookmark state
  const [bookmarked, setBookmarked] = useState(question.bookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Note state
  const [noteOpen, setNoteOpen] = useState(Boolean(question.note));
  const [noteBody, setNoteBody] = useState(question.note || "");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // ── Sync forceReveal / revealedData from parent ──────────────────────────
  useEffect(() => {
    if (revealedData && !submittedResult) {
      // Parent bulk-revealed — treat as auto-submitted
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
  }, [revealedData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (forceReveal && submittedResult) {
      setShowAnswer(true);
    }
  }, [forceReveal, submittedResult]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** JAMB click = radio highlight only. No server call yet. */
  function handleSelectOption(key: "A" | "B" | "C" | "D") {
    if (submittedResult && !isChangingAnswer) return; // locked after submission
    if (isSubmitting) return;

    if (isChangingAnswer) {
      setPendingOption(key);
      return;
    }

    setSelectedOption(key);
  }

  /** User deliberately submits their selected option. */
  async function handleSubmitAnswer() {
    if (!selectedOption || isSubmitting) return;

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
      // Automatically show answer after submission so feedback is visible
      setShowAnswer(true);
      setIsChangingAnswer(false);
      setPendingOption(null);
      onAttemptRecorded?.(question.id, selectedOption, res.isCorrect);
    } catch {
      toast.error("Failed to evaluate answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmChangeAnswer() {
    if (!pendingOption) return;
    setIsSubmitting(true);
    try {
      const res = await submit({
        data: { questionId: question.id, selected: pendingOption },
      });
      setSelectedOption(pendingOption);
      setSubmittedResult({
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        explanation: res.explanation,
      });
      setShowAnswer(true);
      setIsChangingAnswer(false);
      setPendingOption(null);
      onAttemptRecorded?.(question.id, pendingOption, res.isCorrect);
      toast.success("Answer updated");
    } catch {
      toast.error("Failed to update answer");
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

  function handleCopyQuestion() {
    const optionsText = question.options.map((o) => `${o.key}. ${o.text}`).join("\n");
    const fullText = `Question ${question.number}\n${question.prompt}\n\n${optionsText}`;
    navigator.clipboard
      .writeText(fullText)
      .then(() => toast.success("Question copied to clipboard"))
      .catch(() => toast.error("Could not copy to clipboard"));
  }

  // ── Derived display flags ──────────────────────────────────────────────────
  const isLocked = Boolean(submittedResult) && !isChangingAnswer;
  const showExplanation =
    (showAnswer || forceReveal) &&
    Boolean(submittedResult?.explanation ?? revealedData?.explanation);

  return (
    <article
      id={`question-${question.number}`}
      className={`rounded-2xl border bg-card p-5 shadow-sm transition-all sm:p-6 ${
        submittedResult
          ? submittedResult.isCorrect
            ? "border-emerald-500/30 dark:border-emerald-500/20"
            : "border-red-500/30 dark:border-red-500/20"
          : "border-border"
      }`}
    >
      {/* Header: Question Number & Actions */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question {question.number}
        </span>

        <div className="flex items-center gap-1">
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
            <span className="hidden sm:inline">{bookmarked ? "Bookmarked" : "Bookmark"}</span>
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
            <span className="hidden sm:inline">{question.note ? "Note Added" : "Note"}</span>
          </button>

          {/* Copy Question Button */}
          <button
            type="button"
            onClick={handleCopyQuestion}
            title="Copy question text"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Copy className="size-3.5" />
            <span className="hidden sm:inline">Copy</span>
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
          const isPending = isChangingAnswer && pendingOption === option.key;
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
            // Submitted but answer panel hidden — show muted selected state
            if (isSelected) {
              outerStyles = "border-primary/40 bg-primary/5 text-foreground";
              radioStyles = "border-primary bg-primary/40";
              radioDotVisible = true;
            }
          } else if (isSelected || isPending) {
            // Not yet submitted — highlight the student's radio pick
            outerStyles = "border-primary bg-primary/10 text-foreground font-medium";
            radioStyles = "border-primary bg-primary";
            radioDotVisible = true;
          }

          return (
            <button
              key={option.key}
              type="button"
              disabled={isSubmitting || (isLocked && !isChangingAnswer)}
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
                onClick={() => setShowAnswer((p) => !p)}
                className="inline-flex items-center gap-1 rounded-lg bg-background/60 px-2.5 py-1 text-xs font-medium hover:bg-background transition-colors"
              >
                {showAnswer ? (
                  <>
                    <EyeOff className="size-3" /> Hide Answer
                  </>
                ) : (
                  <>
                    <Eye className="size-3" /> View Answer
                  </>
                )}
              </button>

              {/* Change Answer */}
              {!isChangingAnswer ? (
                <button
                  type="button"
                  onClick={() => setIsChangingAnswer(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline opacity-80 hover:opacity-100"
                >
                  <Edit3 className="size-3" />
                  Change
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {selectedOption ? (
              <p>
                Your answer: <span className="font-bold">{selectedOption}</span>
              </p>
            ) : null}
            {showAnswer && submittedResult.correctOption ? (
              <p>
                Correct answer:{" "}
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {submittedResult.correctOption}
                </span>
              </p>
            ) : null}
          </div>

          {/* Change Answer Confirmation */}
          {isChangingAnswer ? (
            <div className="mt-3 border-t border-border/40 pt-3">
              <p className="text-xs font-medium">Select a new option above, then click confirm:</p>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  disabled={!pendingOption || isSubmitting}
                  onClick={confirmChangeAnswer}
                  className="h-8 text-xs"
                >
                  {isSubmitting ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
                  Confirm new answer ({pendingOption || "none"})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsChangingAnswer(false);
                    setPendingOption(null);
                  }}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>
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

      {/* ── Personal Note Editor ──────────────────────────────────────────── */}
      {noteOpen ? (
        <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Personal Note
            </span>
            <span className="text-[11px] text-muted-foreground">Private to you</span>
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground">
            Prompts: What I understood · Don't forget · Why I got this wrong
          </p>

          <Textarea
            placeholder="Write your note here (e.g. Formula to remember, key concept)..."
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            className="mt-2 min-h-[80px] text-sm bg-background"
          />

          <div className="mt-2.5 flex items-center justify-between">
            <Button
              type="button"
              size="sm"
              disabled={isSavingNote}
              onClick={handleSaveNote}
              className="h-8 text-xs"
            >
              {isSavingNote ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
              Save Note
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setNoteOpen(false)}
              className="h-8 text-xs text-muted-foreground"
            >
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
