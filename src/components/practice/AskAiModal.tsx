import { Bot, Check, Copy, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
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
import { GOOGLE_GEMINI_URL } from "@/lib/ask-ai";

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  subjectName?: string | undefined;
  topicName?: string | undefined;
  questionNumber?: number | undefined;
}

export function AskAiModal({
  isOpen,
  onClose,
  prompt,
  subjectName,
  topicName,
  questionNumber,
}: AskAiModalProps) {
  const [copied, setCopied] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  function handleCopy() {
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setCopied(true);
        toast.success("AI Prompt copied to clipboard");
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => toast.error("Could not copy to clipboard"));
  }

  function handleOpenGemini() {
    window.open(GOOGLE_GEMINI_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold">Google AI / Gemini Handoff</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Get a step-by-step UTME tutorial and concept breakdown with Google Gemini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* Context pill */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-secondary/40 p-3 text-xs">
            {questionNumber ? (
              <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-bold">
                Q{questionNumber}
              </span>
            ) : null}
            {subjectName ? (
              <span className="font-semibold text-foreground">{subjectName}</span>
            ) : null}
            {topicName ? (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{topicName}</span>
              </>
            ) : null}
          </div>

          {/* Instructions card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Prompt prepared &amp; copied to clipboard!</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-0.5 leading-relaxed">
              <li>
                Switch to the <strong>Google Gemini</strong> tab (opened in your browser).
              </li>
              <li>
                Click in the message box and paste (
                <kbd className="rounded bg-secondary px-1 py-0.5 font-mono text-[10px]">
                  Ctrl + V
                </kbd>{" "}
                or tap <em>Paste</em> on mobile).
              </li>
              <li>
                Press <strong>Send</strong> to receive your patient tutor explanation.
              </li>
            </ol>
          </div>

          {/* Toggle prompt inspection */}
          <div>
            <button
              type="button"
              onClick={() => setShowPromptPreview((p) => !p)}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              {showPromptPreview ? "Hide prepared prompt" : "View prepared AI prompt"}
            </button>

            {showPromptPreview ? (
              <div className="mt-2 relative">
                <textarea
                  readOnly
                  value={prompt}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="absolute right-2 top-2 h-7 gap-1 text-[11px]"
                >
                  {copied ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copied ? "Copied" : "Copy Again"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 text-xs">
            Done
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              handleOpenGemini();
            }}
            className="h-9 gap-1.5 text-xs"
          >
            <ExternalLink className="size-3.5" />
            Open Google Gemini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
