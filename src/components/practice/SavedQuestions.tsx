import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark, Bot, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ContentProtection } from "@/components/practice/ContentProtection";
import { Button } from "@/components/ui/button";
import { MathText } from "@/components/ui/math-text";
import { buildAskAiPrompt, GOOGLE_GEMINI_URL } from "@/lib/ask-ai";
import { getSavedQuestions } from "@/lib/edge-practice.functions";

interface SavedQuestionsProps {
  onGoToTopic: (subjectSlug: string, topicSlug: string) => void;
}

export function SavedQuestions({ onGoToTopic }: SavedQuestionsProps) {
  const fetchSaved = useServerFn(getSavedQuestions);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["saved-questions"],
    queryFn: () => fetchSaved(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 py-8">
        <div className="h-6 w-36 animate-pulse rounded bg-muted" />
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-border bg-card/60 p-5"
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
          <p className="text-sm text-muted-foreground">We couldn't load your saved questions.</p>
          <Button onClick={() => refetch()} className="mt-4" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const items = data.items ?? [];

  async function handleAskAiForSavedItem(item: (typeof items)[number]) {
    const toastId = toast.loading("Preparing your AI explanation...");
    try {
      const prompt = buildAskAiPrompt({
        subjectName: item.subjectName,
        subjectSlug: item.subjectSlug,
        topicName: item.topicName,
        topicSlug: item.topicSlug,
        questionText: item.prompt,
        options: item.options,
      });

      // Silently prefill clipboard buffer in background as instant fallback
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
    <div className="mx-auto w-full max-w-2xl pb-16">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Saved Questions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Questions you bookmarked for review and personal notes
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
          <Bookmark className="mx-auto size-10 text-muted-foreground opacity-60" />
          <h3 className="mt-4 font-display text-base font-bold text-foreground">
            No saved questions yet
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Click the "Bookmark" icon on any question to save it for quick review.
          </p>
        </div>
      ) : (
        <ContentProtection className="mt-6 space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="protected-practice-content select-none rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {item.subjectName || "Subject"}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.topicName || "Topic"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAskAiForSavedItem(item)}
                    title="Get a detailed explanation for this question with AI"
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 text-[11px] font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
                  >
                    <Bot className="size-3 text-primary" />
                    <span>Ask AI</span>
                  </button>

                  {item.subjectSlug && item.topicSlug ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onGoToTopic(item.subjectSlug, item.topicSlug)}
                      className="h-7 text-xs"
                    >
                      Go to topic
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 font-medium text-sm text-foreground leading-relaxed">
                <MathText content={item.prompt} />
              </div>

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {item.options.map((opt) => (
                  <p key={opt.key}>
                    <span className="font-bold">{opt.key}.</span> <MathText content={opt.text} />
                  </p>
                ))}
              </div>

              {item.note ? (
                <div className="mt-4 rounded-xl border border-border/80 bg-secondary/30 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                    <FileText className="size-3.5" />
                    <span>Your Note:</span>
                  </div>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">{item.note}</p>
                </div>
              ) : null}
            </article>
          ))}
        </ContentProtection>
      )}
    </div>
  );
}
