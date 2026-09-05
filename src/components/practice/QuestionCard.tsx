import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Bookmark,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
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

  // Local state initialized with server question state
  const [selectedOption, setSelectedOption] = useState<string | null>(
    question.attempt?.selected ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctOption: string;
    explanation: string | null;
  } | null>(
    question.attempt
      ? {
          isCorrect: question.attempt.isCorrect,
          correctOption: revealedData?.correctOption ?? "",
          explanation: revealedData?.explanation ?? null,
        }
      : revealedData
        ? {
            isCorrect: selectedOption === revealedData.correctOption,
            correctOption: revealedData.correctOption,
            explanation: revealedData.explanation,
          }
        : null,
  );

  // Answer change confirmation state
  const [isChangingAnswer, setIsChangingAnswer] = useState(false);
  const [pendingOption, setPendingOption] = useState<string | null>(null);

  // Bookmark state
  const [bookmarked, setBookmarked] = useState(question.bookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Note state
  const [noteOpen, setNoteOpen] = useState(Boolean(question.note));
  const [noteBody, setNoteBody] = useState(question.note || "");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Sync with revealed data if forceReveal or revealedData updates
  useEffect(() => {
    if (revealedData) {
      setResult((prev) => ({
        isCorrect: selectedOption ? selectedOption === revealedData.correctOption : false,
        correctOption: revealedData.correctOption,
        explanation: revealedData.explanation,
      }));
    }
  }, [revealedData, selectedOption]);

  // Immediate answer selection handler
  async function handleSelectOption(key: "A" | "B" | "C" | "D") {
    // If already locked and not in change-flow, do nothing
    if (result && !isChangingAnswer) return;

    if (result && isChangingAnswer) {
      setPendingOption(key);
      return;
    }

    // Immediate submission
    setSelectedOption(key);
    setIsSubmitting(true);
    try {
      const res = await submit({ data: { questionId: question.id, selected: key } });
      setResult({
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        explanation: res.explanation,
      });
      setIsChangingAnswer(false);
      setPendingOption(null);
      onAttemptRecorded?.(question.id, key, res.isCorrect);
    } catch {
      toast.error("Failed to evaluate answer. Please try again.");
      setSelectedOption(question.attempt?.selected ?? null);
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
      setResult({
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        explanation: res.explanation,
      });
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

  const isLocked = Boolean(result) && !isChangingAnswer;
  const isAnswered = Boolean(selectedOption) || Boolean(result);
  const showExplanation = Boolean(result?.explanation) || forceReveal;

  return (
    <article
      id={`question-${question.number}`}
      className={`rounded-2xl border bg-card p-5 shadow-sm transition-all sm:p-6 ${
        result
          ? result.isCorrect
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

      {/* Option List */}
      <div className="mt-5 space-y-2.5">
        {question.options.map((option: Option) => {
          const isSelected = selectedOption === option.key;
          const isPending = isChangingAnswer && pendingOption === option.key;
          const isCorrectAnswer = result?.correctOption === option.key;
          const isWrongSelected = isSelected && result && !result.isCorrect && result.correctOption;

          let btnStyles = "border-border bg-card hover:bg-secondary/60 text-foreground";
          let badgeStyles = "bg-secondary text-muted-foreground";

          if (result) {
            if (isCorrectAnswer) {
              btnStyles =
                "border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium";
              badgeStyles = "bg-emerald-600 text-white";
            } else if (isWrongSelected) {
              btnStyles = "border-red-500/60 bg-red-500/10 text-red-950 dark:text-red-200";
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
              disabled={isSubmitting || (isLocked && !isChangingAnswer)}
              onClick={() => handleSelectOption(option.key)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${btnStyles} ${
                isLocked ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${badgeStyles}`}
              >
                {option.key}
              </span>
              <MathText content={option.text} className="mt-0.5 flex-1 leading-snug" />
              {isCorrectAnswer ? (
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Immediate Result Feedback Banner */}
      {result ? (
        <div
          className={`mt-4 rounded-xl border p-3.5 text-sm transition-all ${
            result.isCorrect
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold">
              {result.isCorrect ? (
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

            {/* Deliberate Change Answer Action */}
            {!isChangingAnswer ? (
              <button
                type="button"
                onClick={() => setIsChangingAnswer(true)}
                className="inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline opacity-80 hover:opacity-100"
              >
                <Edit3 className="size-3" />
                Change answer
              </button>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {selectedOption ? (
              <p>
                Your answer: <span className="font-bold">{selectedOption}</span>
              </p>
            ) : null}
            {result.correctOption ? (
              <p>
                Correct answer: <span className="font-bold">{result.correctOption}</span>
              </p>
            ) : null}
          </div>

          {/* Change Answer Confirmation prompt */}
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

      {/* Explanation Section */}
      {showExplanation && result?.explanation ? (
        <div className="mt-4 rounded-xl border border-border/80 bg-secondary/30 p-4 text-sm">
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            Explanation
          </p>
          <div className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap">
            <MathText content={result.explanation} />
          </div>
        </div>
      ) : null}

      {/* Personal Note Editor */}
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
