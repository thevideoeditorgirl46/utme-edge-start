import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  FileCode,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MathText } from "@/components/ui/math-text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BulkQuestionInput } from "@/lib/practice-admin.functions";
import { bulkUpsertAdminQuestions } from "@/lib/practice-admin.functions";

export type StagedQuestion = {
  id: string; // local staging ID
  topicId: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
  imageUrl: string;
  explanationImageUrl: string;
  source: string;
  previewMath: boolean;
};

interface BulkQuestionUploaderProps {
  subjects: Array<{ id: string; slug: string; name: string }>;
  topics: Array<{
    id: string;
    slug: string;
    name: string;
    subject_id: string;
    subjectName?: string;
  }>;
  onSuccess?: () => void;
}

const SAMPLE_TEXT = `1. In a right-angled triangle, if the opposite side is $3\\text{ cm}$ and the adjacent side is $4\\text{ cm}$, what is the hypotenuse?
A. $5\\text{ cm}$
B. $7\\text{ cm}$
C. $12\\text{ cm}$
D. $25\\text{ cm}$
Correct: A
Explanation: By Pythagoras theorem, $c^2 = a^2 + b^2 = 3^2 + 4^2 = 9 + 16 = 25$, so $c = \\sqrt{25} = 5\\text{ cm}$.

2. Which of the following is the balanced equation for the combustion of methane?
A. $\\text{CH}_4 + \\text{O}_2 \\rightarrow \\text{CO}_2 + \\text{H}_2\\text{O}$
B. $\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$
C. $2\\text{CH}_4 + 3\\text{O}_2 \\rightarrow 2\\text{CO}_2 + 4\\text{H}_2\\text{O}$
D. $\\text{CH}_4 + 3\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$
Correct: B
Explanation: Methane combusts with oxygen yielding carbon dioxide and water: $\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$.`;

export function BulkQuestionUploader({ subjects, topics, onSuccess }: BulkQuestionUploaderProps) {
  const queryClient = useQueryClient();
  const bulkSave = useServerFn(bulkUpsertAdminQuestions);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics.find((t) => t.subject_id === (subjects[0]?.id || ""))?.id || topics[0]?.id || "",
  );

  const [rawText, setRawText] = useState<string>("");
  const [stagedQuestions, setStagedQuestions] = useState<StagedQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<"input" | "preview">("input");
  const [targetStatus, setTargetStatus] = useState<"approved" | "published" | "pending" | "draft">(
    "approved",
  );

  // Filter topics for the selected subject
  const currentTopics = topics.filter((t) =>
    selectedSubjectId ? t.subject_id === selectedSubjectId : true,
  );

  const bulkMutation = useMutation({
    mutationFn: (questionsToSave: BulkQuestionInput[]) =>
      bulkSave({ data: { questions: questionsToSave } }),
    onSuccess: (res) => {
      toast.success(`Successfully imported and saved ${res.count} questions!`);
      void queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      setStagedQuestions([]);
      setRawText("");
      setActiveTab("input");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(`Bulk import error: ${err.message}`);
    },
  });

  // Smart Parser for Bulk Text & JSON
  function parseBulkInput() {
    const text = rawText.trim();
    if (!text) {
      toast.error("Please paste or type question text to parse");
      return;
    }

    if (!selectedTopicId) {
      toast.error("Please select a target Topic before parsing");
      return;
    }

    // Try parsing as JSON first
    if (text.startsWith("[") && text.endsWith("]")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const items: StagedQuestion[] = parsed.map((item, idx) => ({
            id: `json-${idx}-${Date.now()}`,
            topicId: item.topic_id || item.topicId || selectedTopicId,
            prompt: item.prompt || item.question || "",
            optionA: item.option_a || item.optionA || item.a || "",
            optionB: item.option_b || item.optionB || item.b || "",
            optionC: item.option_c || item.optionC || item.c || "",
            optionD: item.option_d || item.optionD || item.d || "",
            correctOption: (item.correct_option || item.correct || item.answer || "A")
              .toString()
              .toUpperCase()
              .slice(0, 1) as "A" | "B" | "C" | "D",
            explanation: item.explanation || "",
            imageUrl: item.image_url || item.imageUrl || "",
            explanationImageUrl: item.explanation_image_url || item.explanationImageUrl || "",
            source: item.source || "Bulk JSON Import",
            previewMath: false,
          }));

          setStagedQuestions(items);
          setActiveTab("preview");
          toast.success(`Parsed ${items.length} questions from JSON`);
          return;
        }
      } catch (e) {
        console.warn("JSON parse attempt failed, falling back to text regex parser", e);
      }
    }

    // Fallback: Smart Regex Text Parser
    // Matches question blocks separated by blank lines or numbers
    const questionBlocks = text.split(/\n\s*(?=(?:\d+[.)]|Q\d+[.):]|Question\s*\d+[.):]))/i);
    const parsedList: StagedQuestion[] = [];

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i]?.trim();
      if (!block) continue;

      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) continue;

      let prompt = "";
      let optA = "";
      let optB = "";
      let optC = "";
      let optD = "";
      let correctOpt: "A" | "B" | "C" | "D" = "A";
      let explanation = "";
      let imageUrl = "";
      let explanationImageUrl = "";
      const source = "Bulk Text Import";

      let collectingPrompt = true;

      for (const line of lines) {
        // Check for Options: A., A), [A], etc.
        const optMatch = line.match(/^([A-D])[.)]\s*(.*)$/i);
        if (optMatch && optMatch[1] && optMatch[2] !== undefined) {
          collectingPrompt = false;
          const letter = optMatch[1].toUpperCase();
          const optText = optMatch[2].trim();
          if (letter === "A") optA = optText;
          if (letter === "B") optB = optText;
          if (letter === "C") optC = optText;
          if (letter === "D") optD = optText;
          continue;
        }

        // Check for Correct Answer
        const ansMatch = line.match(/^(?:Correct|Answer|Ans|Key)\s*[:=-]?\s*([A-D])/i);
        if (ansMatch && ansMatch[1]) {
          collectingPrompt = false;
          correctOpt = ansMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
          continue;
        }

        // Check for Explanation
        const expMatch = line.match(/^(?:Explanation|Exp|Reason|Working)\s*[:=-]?\s*(.*)$/i);
        if (expMatch && expMatch[1] !== undefined) {
          collectingPrompt = false;
          explanation = expMatch[1].trim();
          continue;
        }

        // Check for Image URL
        const imgMatch = line.match(
          /^(?:Image|Diagram|Photo|Img)\s*[:=-]?\s*(https?:\/\/\S+|\/\S+)/i,
        );
        if (imgMatch && imgMatch[1]) {
          collectingPrompt = false;
          imageUrl = imgMatch[1].trim();
          continue;
        }

        // Check for Explanation Image URL
        const expImgMatch = line.match(
          /^(?:Explanation\s*Image|Exp\s*Diagram|Exp\s*Image)\s*[:=-]?\s*(https?:\/\/\S+|\/\S+)/i,
        );
        if (expImgMatch && expImgMatch[1]) {
          collectingPrompt = false;
          explanationImageUrl = expImgMatch[1].trim();
          continue;
        }

        // If still in prompt phase, strip leading numbering (e.g. "1.", "Q1)") and append
        if (collectingPrompt) {
          const cleanLine = line.replace(/^(?:\d+[.)]|Q\d+[.):]|Question\s*\d+[.):])\s*/i, "");
          prompt = prompt ? `${prompt}\n${cleanLine}` : cleanLine;
        } else if (explanation) {
          // If explanation is ongoing, append line
          explanation += `\n${line}`;
        }
      }

      if (prompt) {
        parsedList.push({
          id: `parsed-${i}-${Date.now()}`,
          topicId: selectedTopicId,
          prompt,
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD,
          correctOption: correctOpt,
          explanation,
          imageUrl,
          explanationImageUrl,
          source,
          previewMath: false,
        });
      }
    }

    if (parsedList.length === 0) {
      toast.error("Could not parse questions. Please check the format and try again.");
      return;
    }

    setStagedQuestions(parsedList);
    setActiveTab("preview");
    toast.success(`Successfully parsed ${parsedList.length} questions into Google Forms preview!`);
  }

  // Inline Question Updates
  function updateQuestionField<K extends keyof StagedQuestion>(
    id: string,
    field: K,
    value: StagedQuestion[K],
  ) {
    setStagedQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  }

  function deleteQuestion(id: string) {
    setStagedQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.info("Question removed from preview");
  }

  function duplicateQuestion(index: number) {
    const original = stagedQuestions[index];
    if (!original) return;
    const clone: StagedQuestion = {
      ...original,
      id: `clone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      prompt: `${original.prompt} (Copy)`,
    };
    const next = [...stagedQuestions];
    next.splice(index + 1, 0, clone);
    setStagedQuestions(next);
    toast.success("Question duplicated");
  }

  function addNewBlankQuestion() {
    const newQ: StagedQuestion = {
      id: `new-${Date.now()}`,
      topicId: selectedTopicId,
      prompt: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      explanation: "",
      imageUrl: "",
      explanationImageUrl: "",
      source: "Manual Card Entry",
      previewMath: false,
    };
    setStagedQuestions((prev) => [...prev, newQ]);
  }

  // Batch Save / Approval
  function handleBatchSubmit(status: "approved" | "published" | "draft") {
    if (stagedQuestions.length === 0) {
      toast.error("No questions in preview to save");
      return;
    }

    // Validate questions
    const invalidList = stagedQuestions.filter(
      (q) => !q.prompt.trim() || !q.optionA.trim() || !q.optionB.trim(),
    );

    if (invalidList.length > 0) {
      toast.error(
        `There are ${invalidList.length} invalid questions (missing prompt or options). Please review cards highlighted with red indicators.`,
      );
      return;
    }

    const payload: BulkQuestionInput[] = stagedQuestions.map((q) => {
      // If explanation image is provided and not already in explanation markdown, append it
      let finalExp = q.explanation.trim();
      if (q.explanationImageUrl && !finalExp.includes(q.explanationImageUrl)) {
        finalExp = finalExp
          ? `${finalExp}\n\n![Explanation Diagram](${q.explanationImageUrl})`
          : `![Explanation Diagram](${q.explanationImageUrl})`;
      }

      return {
        topic_id: q.topicId || selectedTopicId,
        prompt: q.prompt,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_option: q.correctOption,
        explanation: finalExp || null,
        image_url: q.imageUrl.trim() || null,
        source: q.source || "Bulk Import",
        status,
      };
    });

    bulkMutation.mutate(payload);
  }

  const validCount = stagedQuestions.filter(
    (q) => q.prompt.trim() && q.optionA.trim() && q.optionB.trim(),
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Nav Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Bulk Question Importer & AI Review
            </h2>
            <p className="text-xs text-muted-foreground">
              Paste AI output, edit in Google Forms view, and batch-approve into the question bank.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeTab === "input" ? "default" : "outline"}
            onClick={() => setActiveTab("input")}
            className="h-8 gap-1.5 text-xs"
          >
            <FileCode className="size-3.5" />
            1. Text / AI Input
          </Button>

          <Button
            size="sm"
            variant={activeTab === "preview" ? "default" : "outline"}
            onClick={() => {
              if (stagedQuestions.length === 0 && rawText.trim()) {
                parseBulkInput();
              } else {
                setActiveTab("preview");
              }
            }}
            className="h-8 gap-1.5 text-xs"
          >
            <FileText className="size-3.5" />
            2. Google Forms Bulk Preview
            {stagedQuestions.length > 0 ? (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold">
                {stagedQuestions.length}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {/* TAB 1: TEXT / AI RAW INPUT */}
      {activeTab === "input" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Subject Target */}
            <div>
              <Label className="text-xs font-semibold">Target Subject</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={(val) => {
                  setSelectedSubjectId(val);
                  const firstT = topics.find((t) => t.subject_id === val);
                  if (firstT) setSelectedTopicId(firstT.id);
                }}
              >
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Target */}
            <div>
              <Label className="text-xs font-semibold">Target Topic</Label>
              <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {currentTopics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Paste Raw Questions (AI Output, JSON array, or Past Exam text)
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRawText(SAMPLE_TEXT)}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Load Sample Math/Chem Questions
              </Button>
            </div>

            <Textarea
              placeholder={`Example format:\n1. What is the value of $x$ in $2x + 5 = 15$?\nA. $3$\nB. $5$\nC. $7$\nD. $10$\nCorrect: B\nExplanation: Subtract 5: $2x = 10 \\implies x = 5$.\nImage: https://...\nExp_Image: https://...`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="mt-2 min-h-[300px] font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              💡 LaTeX math notation (`$...$` and `$$...$$`) and image links are preserved
              automatically.
            </p>

            <Button
              type="button"
              onClick={parseBulkInput}
              disabled={!rawText.trim()}
              className="gap-2 text-xs"
            >
              <Sparkles className="size-3.5" />
              Parse & Open Google Forms Preview
            </Button>
          </div>
        </div>
      ) : null}

      {/* TAB 2: GOOGLE FORMS-STYLE INLINE EDITABLE BULK PREVIEW */}
      {activeTab === "preview" ? (
        <div className="space-y-6">
          {/* Action & Batch Bar */}
          <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
                {validCount} / {stagedQuestions.length} Questions Ready
              </span>
              <span className="text-xs text-muted-foreground">
                All questions are staged in review until approved.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={addNewBlankQuestion}
                className="h-9 gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                Add Blank Question
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={bulkMutation.isPending}
                onClick={() => handleBatchSubmit("draft")}
                className="h-9 text-xs"
              >
                Save as Drafts
              </Button>

              <Button
                size="sm"
                disabled={bulkMutation.isPending || stagedQuestions.length === 0}
                onClick={() => handleBatchSubmit("approved")}
                className="h-9 gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                {bulkMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Approve & Import All ({validCount})
              </Button>
            </div>
          </div>

          {stagedQuestions.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">No questions currently staged.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("input")}
                className="mt-3 text-xs"
              >
                Go to Text Input
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {stagedQuestions.map((q, idx) => {
                const isValid =
                  q.prompt.trim().length > 0 &&
                  q.optionA.trim().length > 0 &&
                  q.optionB.trim().length > 0;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border bg-card p-5 shadow-sm transition-all sm:p-6 ${
                      isValid
                        ? "border-border hover:border-primary/40"
                        : "border-red-500/40 bg-red-500/5"
                    }`}
                  >
                    {/* Card Header (Google Forms Style) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-bold text-foreground">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          Question Item
                        </span>
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
                            <AlertCircle className="size-3" /> Needs Attention
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Toggle LaTeX Preview */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuestionField(q.id, "previewMath", !q.previewMath)}
                          className={`h-7 px-2 text-xs ${
                            q.previewMath ? "bg-primary/10 text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <Eye className="mr-1 size-3" />
                          {q.previewMath ? "Live Math Preview On" : "Preview Math"}
                        </Button>

                        {/* Duplicate */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateQuestion(idx)}
                          className="h-7 px-2 text-xs text-muted-foreground"
                          title="Duplicate question"
                        >
                          <Copy className="size-3" />
                        </Button>

                        {/* Delete */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(q.id)}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          title="Delete question"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="mt-4 space-y-4">
                      {/* Question Prompt */}
                      <div>
                        <Label className="text-xs font-semibold">
                          Question Prompt (LaTeX supported)
                        </Label>
                        <Textarea
                          value={q.prompt}
                          onChange={(e) => updateQuestionField(q.id, "prompt", e.target.value)}
                          placeholder="e.g. Calculate the derivative of $f(x) = x^3 + 2x$..."
                          className="mt-1 min-h-[80px] text-sm leading-relaxed"
                        />
                        {q.previewMath && q.prompt ? (
                          <div className="mt-2 rounded-xl border border-border/80 bg-secondary/30 p-3 text-sm">
                            <MathText content={q.prompt} />
                          </div>
                        ) : null}
                      </div>

                      {/* Question Diagram Image URL */}
                      <div>
                        <Label className="text-xs font-semibold">
                          Question Diagram Image URL (Optional)
                        </Label>
                        <Input
                          value={q.imageUrl}
                          onChange={(e) => updateQuestionField(q.id, "imageUrl", e.target.value)}
                          placeholder="https://... (URL to circuit diagram, apparatus illustration, etc.)"
                          className="mt-1 font-mono text-xs"
                        />
                        {q.imageUrl ? (
                          <div className="mt-2 overflow-hidden rounded-xl border border-border max-w-sm">
                            <img
                              src={q.imageUrl}
                              alt="Diagram Preview"
                              loading="lazy"
                              className="max-h-40 object-contain"
                            />
                          </div>
                        ) : null}
                      </div>

                      {/* Options Grid with Correct Answer Selector */}
                      <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                        <Label className="text-xs font-semibold">
                          Options & Correct Answer Key (Click letter radio to mark correct)
                        </Label>

                        <div className="mt-3 space-y-2.5">
                          {(["A", "B", "C", "D"] as const).map((letter) => {
                            const isCorrect = q.correctOption === letter;
                            const fieldKey =
                              letter === "A"
                                ? "optionA"
                                : letter === "B"
                                  ? "optionB"
                                  : letter === "C"
                                    ? "optionC"
                                    : "optionD";

                            return (
                              <div
                                key={letter}
                                className={`flex items-center gap-2.5 rounded-xl border p-2 transition-colors ${
                                  isCorrect
                                    ? "border-emerald-500/50 bg-emerald-500/10"
                                    : "border-border bg-card"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => updateQuestionField(q.id, "correctOption", letter)}
                                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-transform active:scale-95 ${
                                    isCorrect
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                  }`}
                                  title={`Mark option ${letter} as correct`}
                                >
                                  {letter}
                                </button>

                                <Input
                                  value={q[fieldKey]}
                                  onChange={(e) =>
                                    updateQuestionField(q.id, fieldKey, e.target.value)
                                  }
                                  placeholder={`Option ${letter} text...`}
                                  className="h-8 border-0 bg-transparent text-sm shadow-none focus-visible:ring-1"
                                />

                                {isCorrect ? (
                                  <span className="mr-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Correct
                                  </span>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation & Explanation Diagram Image */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-semibold">
                            Teaching Explanation (Worked Steps)
                          </Label>
                          <Textarea
                            value={q.explanation}
                            onChange={(e) =>
                              updateQuestionField(q.id, "explanation", e.target.value)
                            }
                            placeholder="Explain the formula, key principles, and why the correct answer holds..."
                            className="mt-1 min-h-[85px] text-xs"
                          />
                          {q.previewMath && q.explanation ? (
                            <div className="mt-2 rounded-xl border border-border/80 bg-secondary/30 p-2.5 text-xs">
                              <MathText content={q.explanation} />
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <Label className="text-xs font-semibold">
                            Explanation Diagram Image URL (Optional)
                          </Label>
                          <Input
                            value={q.explanationImageUrl}
                            onChange={(e) =>
                              updateQuestionField(q.id, "explanationImageUrl", e.target.value)
                            }
                            placeholder="https://... (Worked solution chart or diagram)"
                            className="mt-1 font-mono text-xs"
                          />
                          {q.explanationImageUrl ? (
                            <div className="mt-2 overflow-hidden rounded-xl border border-border max-w-xs">
                              <img
                                src={q.explanationImageUrl}
                                alt="Explanation Diagram Preview"
                                loading="lazy"
                                className="max-h-32 object-contain"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
