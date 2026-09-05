import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
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

// ── Types ─────────────────────────────────────────────────────────────────────

export type StagedQuestion = {
  id: string; // local staging ID
  topicId: string; // resolved DB topic ID
  subjectId: string; // for per-card selector display
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

type ActiveTab = "input" | "csv" | "preview";

// ── CSV column spec ───────────────────────────────────────────────────────────
// subject_slug, topic_slug, prompt, option_a, option_b, option_c, option_d,
// correct_option, explanation, image_url, explanation_image_url, source
const CSV_HEADERS = [
  "subject_slug",
  "topic_slug",
  "prompt",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "explanation",
  "image_url",
  "explanation_image_url",
  "source",
] as const;

const CSV_TEMPLATE = [
  CSV_HEADERS.join(","),
  [
    "mathematics",
    "trigonometry",
    "If sin θ = 3/5 what is cos θ?",
    "2/5",
    "3/4",
    "4/5",
    "5/4",
    "C",
    "By Pythagoras adj=4 so cosθ=4/5.",
    "",
    "",
    "JAMB 2023",
  ].join(","),
  [
    "physics",
    "motion",
    "A car accelerates from rest to 20 m/s in 5 s. Find acceleration.",
    "2 m/s²",
    "4 m/s²",
    "5 m/s²",
    "100 m/s²",
    "B",
    "a = (v-u)/t = 20/5 = 4 m/s²",
    "",
    "",
    "JAMB 2022",
  ].join(","),
].join("\n");

// ── Smart text parser (reused from original) ─────────────────────────────────
const SAMPLE_TEXT = `1. In a right-angled triangle, if the opposite side is $3\\text{ cm}$ and the adjacent side is $4\\text{ cm}$, what is the hypotenuse?
A. $5\\text{ cm}$
B. $7\\text{ cm}$
C. $12\\text{ cm}$
D. $25\\text{ cm}$
Correct: A
Explanation: By Pythagoras theorem, $c^2 = a^2 + b^2 = 9 + 16 = 25$, so $c = \\sqrt{25} = 5\\text{ cm}$.

2. Which of the following is the balanced equation for the combustion of methane?
A. $\\text{CH}_4 + \\text{O}_2 \\rightarrow \\text{CO}_2 + \\text{H}_2\\text{O}$
B. $\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$
C. $2\\text{CH}_4 + 3\\text{O}_2 \\rightarrow 2\\text{CO}_2 + 4\\text{H}_2\\text{O}$
D. $\\text{CH}_4 + 3\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$
Correct: B
Explanation: Methane combusts with oxygen: $\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$.`;

// ── CSV parse helper ───────────────────────────────────────────────────────────
/**
 * Robust CSV parser that handles quoted fields with embedded commas/newlines.
 * Returns [string[], ...] rows (first row is the header).
 */
function parseCSV(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuote = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        if (ch === "\r") i++;
        row.push(cell.trim());
        if (row.some((c) => c.length > 0)) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += ch;
      }
    }
  }
  // last cell / row
  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);

  return rows;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BulkQuestionUploader({ subjects, topics, onSuccess }: BulkQuestionUploaderProps) {
  const queryClient = useQueryClient();
  const bulkSave = useServerFn(bulkUpsertAdminQuestions);
  const csvFileRef = useRef<HTMLInputElement>(null);

  // Default subject / topic selectors (for text/AI tab)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics.find((t) => t.subject_id === (subjects[0]?.id || ""))?.id || topics[0]?.id || "",
  );

  const [rawText, setRawText] = useState<string>("");
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [stagedQuestions, setStagedQuestions] = useState<StagedQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("input");

  // Filter topics for the currently selected subject (text/AI tab default)
  const currentTopics = topics.filter((t) =>
    selectedSubjectId ? t.subject_id === selectedSubjectId : true,
  );

  // Build slug → id lookup maps for CSV parsing
  const subjectBySlug = new Map(subjects.map((s) => [s.slug, s]));
  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));

  // ── Batch save mutation ──────────────────────────────────────────────────
  const bulkMutation = useMutation({
    mutationFn: (questionsToSave: BulkQuestionInput[]) =>
      bulkSave({ data: { questions: questionsToSave } }),
    onSuccess: (res) => {
      toast.success(`Successfully imported and saved ${res.count} questions!`);
      void queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      setStagedQuestions([]);
      setRawText("");
      setCsvFileName("");
      setActiveTab("input");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(`Bulk import error: ${err.message}`);
    },
  });

  // ── Text / AI parser ─────────────────────────────────────────────────────
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

    // Try JSON first
    if (text.startsWith("[") && text.endsWith("]")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const items: StagedQuestion[] = parsed.map((item, idx) => {
            const tId = item.topic_id || item.topicId || selectedTopicId;
            const t = topics.find((tp) => tp.id === tId);
            return {
              id: `json-${idx}-${Date.now()}`,
              topicId: tId,
              subjectId: t?.subject_id || selectedSubjectId,
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
            };
          });
          setStagedQuestions(items);
          setActiveTab("preview");
          toast.success(`Parsed ${items.length} questions from JSON`);
          return;
        }
      } catch {
        // fall through to text parser
      }
    }

    // Smart regex text parser
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
      let collectingPrompt = true;

      for (const line of lines) {
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
        const ansMatch = line.match(/^(?:Correct|Answer|Ans|Key)\s*[:=-]?\s*([A-D])/i);
        if (ansMatch && ansMatch[1]) {
          collectingPrompt = false;
          correctOpt = ansMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
          continue;
        }
        const expMatch = line.match(/^(?:Explanation|Exp|Reason|Working)\s*[:=-]?\s*(.*)$/i);
        if (expMatch && expMatch[1] !== undefined) {
          collectingPrompt = false;
          explanation = expMatch[1].trim();
          continue;
        }
        const imgMatch = line.match(
          /^(?:Image|Diagram|Photo|Img)\s*[:=-]?\s*(https?:\/\/\S+|\/\S+)/i,
        );
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1].trim();
          continue;
        }
        const expImgMatch = line.match(
          /^(?:Explanation\s*Image|Exp\s*Diagram|Exp\s*Image)\s*[:=-]?\s*(https?:\/\/\S+|\/\S+)/i,
        );
        if (expImgMatch && expImgMatch[1]) {
          explanationImageUrl = expImgMatch[1].trim();
          continue;
        }
        if (collectingPrompt) {
          const cleanLine = line.replace(/^(?:\d+[.)]|Q\d+[.):]|Question\s*\d+[.):])\\s*/i, "");
          prompt = prompt ? `${prompt}\n${cleanLine}` : cleanLine;
        } else if (explanation) {
          explanation += `\n${line}`;
        }
      }

      if (prompt) {
        parsedList.push({
          id: `parsed-${i}-${Date.now()}`,
          topicId: selectedTopicId,
          subjectId: selectedSubjectId,
          prompt,
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD,
          correctOption: correctOpt,
          explanation,
          imageUrl,
          explanationImageUrl,
          source: "Bulk Text Import",
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
    toast.success(`Parsed ${parsedList.length} questions into Google Forms preview!`);
  }

  // ── CSV parser ───────────────────────────────────────────────────────────
  function parseCSVInput(raw: string, filename: string) {
    const rows = parseCSV(raw);
    if (rows.length < 2) {
      toast.error("CSV must have a header row and at least one data row.");
      return;
    }

    // Normalise header row
    const header = rows[0]!.map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    const colIdx = (name: string) => header.indexOf(name);

    // Validate required columns
    const requiredCols = [
      "prompt",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_option",
    ];
    const missing = requiredCols.filter((c) => colIdx(c) === -1);
    if (missing.length > 0) {
      toast.error(`CSV is missing required columns: ${missing.join(", ")}`);
      return;
    }

    const parsedList: StagedQuestion[] = [];
    let skipped = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]!;
      if (row.length < 5) {
        skipped++;
        continue;
      }

      const get = (col: string) => (colIdx(col) >= 0 ? (row[colIdx(col)] ?? "").trim() : "");

      const subjectSlug = get("subject_slug");
      const topicSlug = get("topic_slug");

      // Resolve subject → topic IDs
      let topicId = selectedTopicId;
      let subjectId = selectedSubjectId;

      if (topicSlug) {
        const resolved = topicBySlug.get(topicSlug);
        if (resolved) {
          topicId = resolved.id;
          subjectId = resolved.subject_id;
        } else {
          // Try fallback: subjectSlug + best match
          const sub = subjectSlug ? subjectBySlug.get(subjectSlug) : undefined;
          if (sub) {
            const fallbackTopic = topics.find((t) => t.subject_id === sub.id);
            if (fallbackTopic) {
              topicId = fallbackTopic.id;
              subjectId = sub.id;
            }
          }
        }
      } else if (subjectSlug) {
        const sub = subjectBySlug.get(subjectSlug);
        if (sub) {
          subjectId = sub.id;
          const firstTopic = topics.find((t) => t.subject_id === sub.id);
          if (firstTopic) topicId = firstTopic.id;
        }
      }

      const correct = get("correct_option").toUpperCase().slice(0, 1) as "A" | "B" | "C" | "D";

      parsedList.push({
        id: `csv-${i}-${Date.now()}`,
        topicId,
        subjectId,
        prompt: get("prompt"),
        optionA: get("option_a"),
        optionB: get("option_b"),
        optionC: get("option_c"),
        optionD: get("option_d"),
        correctOption: ["A", "B", "C", "D"].includes(correct) ? correct : "A",
        explanation: get("explanation"),
        imageUrl: get("image_url"),
        explanationImageUrl: get("explanation_image_url"),
        source: get("source") || `CSV: ${filename}`,
        previewMath: false,
      });
    }

    if (parsedList.length === 0) {
      toast.error("No valid rows found in CSV. Check column headers and data.");
      return;
    }

    if (skipped > 0) toast.info(`Skipped ${skipped} malformed row(s).`);

    setStagedQuestions(parsedList);
    setActiveTab("preview");
    toast.success(`Imported ${parsedList.length} questions from CSV`);
  }

  function handleCSVFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const raw = evt.target?.result as string;
      parseCSVInput(raw, file.name);
    };
    reader.readAsText(file, "utf-8");
    // Reset file input so re-uploading same file triggers onChange
    e.target.value = "";
  }

  function downloadCSVTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jamb_questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Inline card editors ──────────────────────────────────────────────────
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
      subjectId: selectedSubjectId,
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

  // ── Batch save ───────────────────────────────────────────────────────────
  function handleBatchSubmit(status: "approved" | "published" | "draft") {
    if (stagedQuestions.length === 0) {
      toast.error("No questions in preview to save");
      return;
    }
    const invalidList = stagedQuestions.filter(
      (q) => !q.prompt.trim() || !q.optionA.trim() || !q.optionB.trim(),
    );
    if (invalidList.length > 0) {
      toast.error(
        `${invalidList.length} question(s) are missing prompt or options. Fix them before saving.`,
      );
      return;
    }

    const payload: BulkQuestionInput[] = stagedQuestions.map((q) => {
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Top Nav Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Bulk Question Importer &amp; AI Review
            </h2>
            <p className="text-xs text-muted-foreground">
              Paste AI output, upload CSV, edit inline, and batch-approve into the question bank.
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
            1. Text / AI
          </Button>

          <Button
            size="sm"
            variant={activeTab === "csv" ? "default" : "outline"}
            onClick={() => setActiveTab("csv")}
            className="h-8 gap-1.5 text-xs"
          >
            <FileSpreadsheet className="size-3.5" />
            2. CSV Upload
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
            3. Review &amp; Approve
            {stagedQuestions.length > 0 ? (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold">
                {stagedQuestions.length}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {/* ══ TAB 1: TEXT / AI RAW INPUT ══════════════════════════════════════ */}
      {activeTab === "input" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Subject */}
            <div>
              <Label className="text-xs font-semibold">Default Target Subject</Label>
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

            {/* Topic */}
            <div>
              <Label className="text-xs font-semibold">Default Target Topic</Label>
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
                Load Sample
              </Button>
            </div>

            <Textarea
              placeholder={`Example:\n1. What is the value of $x$ in $2x + 5 = 15$?\nA. $3$\nB. $5$\nC. $7$\nD. $10$\nCorrect: B\nExplanation: Subtract 5: $2x = 10$, $x = 5$.`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="mt-2 min-h-[300px] font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              💡 LaTeX math (<code>$...$</code>, <code>$$...$$</code>) and image links are preserved
              automatically.
            </p>
            <Button
              type="button"
              onClick={parseBulkInput}
              disabled={!rawText.trim()}
              className="gap-2 text-xs"
            >
              <Sparkles className="size-3.5" />
              Parse &amp; Open Review
            </Button>
          </div>
        </div>
      ) : null}

      {/* ══ TAB 2: CSV UPLOAD ═══════════════════════════════════════════════ */}
      {activeTab === "csv" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
            <h3 className="text-sm font-semibold text-foreground">CSV Format</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Each row is one question. Include{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[11px]">
                subject_slug
              </code>{" "}
              and{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[11px]">
                topic_slug
              </code>{" "}
              to assign different subjects per row — perfect for mixed uploads.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card p-3 font-mono text-[11px] leading-5 text-muted-foreground">
              {CSV_HEADERS.join(", ")}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={downloadCSVTemplate}
                className="h-8 gap-1.5 text-xs"
              >
                <Upload className="size-3.5" />
                Download Template CSV
              </Button>
              <span className="text-xs text-muted-foreground">
                Fill in the template and re-upload.
              </span>
            </div>
          </div>

          {/* Fallback default selectors for rows missing subject/topic slugs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold">
                Fallback Subject{" "}
                <span className="text-muted-foreground font-normal">(if row has no slug)</span>
              </Label>
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
            <div>
              <Label className="text-xs font-semibold">
                Fallback Topic{" "}
                <span className="text-muted-foreground font-normal">(if row has no slug)</span>
              </Label>
              <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics
                    .filter((t) => t.subject_id === selectedSubjectId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File drop zone */}
          <div
            onClick={() => csvFileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && csvFileRef.current?.click()}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border p-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary/30"
          >
            <FileSpreadsheet className="size-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {csvFileName ? `✓ ${csvFileName}` : "Click to upload a CSV file"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                .csv files only · UTF-8 encoding · Quoted fields supported
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                csvFileRef.current?.click();
              }}
              className="gap-1.5 text-xs"
            >
              <UploadCloud className="size-3.5" />
              Choose File
            </Button>
            <input
              ref={csvFileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCSVFileChange}
            />
          </div>

          {stagedQuestions.length > 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ {stagedQuestions.length} questions imported from CSV
              </p>
              <Button
                size="sm"
                onClick={() => setActiveTab("preview")}
                className="h-8 gap-1.5 text-xs"
              >
                Review &amp; Approve →
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ══ TAB 3: GOOGLE FORMS-STYLE INLINE EDITABLE BULK PREVIEW ═════════ */}
      {activeTab === "preview" ? (
        <div className="space-y-6">
          {/* Sticky batch action bar */}
          <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
                {validCount} / {stagedQuestions.length} Ready
              </span>
              <span className="text-xs text-muted-foreground">
                Staged for review — approve to add to question bank.
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
                Add Blank
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
                Approve &amp; Import ({validCount})
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

                // Resolved topic and subject names for display
                const topicObj = topics.find((t) => t.id === q.topicId);
                const subjectObj = subjects.find((s) => s.id === q.subjectId);
                const topicsForCard = topics.filter((t) => t.subject_id === q.subjectId);

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border bg-card p-5 shadow-sm transition-all sm:p-6 ${
                      isValid
                        ? "border-border hover:border-primary/40"
                        : "border-red-500/40 bg-red-500/5"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-bold text-foreground">
                          {idx + 1}
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuestionField(q.id, "previewMath", !q.previewMath)}
                          className={`h-7 px-2 text-xs ${q.previewMath ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                        >
                          <Eye className="mr-1 size-3" />
                          {q.previewMath ? "Math On" : "Preview Math"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateQuestion(idx)}
                          className="h-7 px-2 text-xs text-muted-foreground"
                          title="Duplicate"
                        >
                          <Copy className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(q.id)}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="mt-4 space-y-4">
                      {/* ── Per-card Subject + Topic selectors ─────────── */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-semibold">Subject</Label>
                          <Select
                            value={q.subjectId}
                            onValueChange={(val) => {
                              const firstT = topics.find((t) => t.subject_id === val);
                              updateQuestionField(q.id, "subjectId", val);
                              if (firstT) updateQuestionField(q.id, "topicId", firstT.id);
                            }}
                          >
                            <SelectTrigger className="mt-1 h-8 text-xs">
                              <SelectValue placeholder="Subject" />
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
                        <div>
                          <Label className="text-xs font-semibold">Topic</Label>
                          <Select
                            value={q.topicId}
                            onValueChange={(val) => updateQuestionField(q.id, "topicId", val)}
                          >
                            <SelectTrigger className="mt-1 h-8 text-xs">
                              <SelectValue placeholder="Topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {topicsForCard.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Topic chip label */}
                      {topicObj && subjectObj ? (
                        <p className="text-[11px] text-muted-foreground">
                          → {subjectObj.name} · {topicObj.name}
                        </p>
                      ) : null}

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

                      {/* Question Image URL */}
                      <div>
                        <Label className="text-xs font-semibold">
                          Question Diagram URL (Optional)
                        </Label>
                        <Input
                          value={q.imageUrl}
                          onChange={(e) => updateQuestionField(q.id, "imageUrl", e.target.value)}
                          placeholder="https://... (circuit diagram, apparatus illustration)"
                          className="mt-1 font-mono text-xs"
                        />
                        {q.imageUrl ? (
                          <div className="mt-2 max-w-sm overflow-hidden rounded-xl border border-border">
                            <img
                              src={q.imageUrl}
                              alt="Diagram Preview"
                              loading="lazy"
                              className="max-h-40 object-contain"
                            />
                          </div>
                        ) : null}
                      </div>

                      {/* Options Grid */}
                      <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                        <Label className="text-xs font-semibold">
                          Options &amp; Answer Key — click letter to mark correct
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
                                  title={`Mark ${letter} as correct`}
                                >
                                  {letter}
                                </button>
                                <Input
                                  value={q[fieldKey]}
                                  onChange={(e) =>
                                    updateQuestionField(q.id, fieldKey, e.target.value)
                                  }
                                  placeholder={`Option ${letter}...`}
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

                      {/* Explanation + Explanation Diagram */}
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
                            placeholder="Explain the formula, principles, and why the answer is correct..."
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
                            Explanation Diagram URL (Optional)
                          </Label>
                          <Input
                            value={q.explanationImageUrl}
                            onChange={(e) =>
                              updateQuestionField(q.id, "explanationImageUrl", e.target.value)
                            }
                            placeholder="https://... (worked solution chart)"
                            className="mt-1 font-mono text-xs"
                          />
                          {q.explanationImageUrl ? (
                            <div className="mt-2 max-w-xs overflow-hidden rounded-xl border border-border">
                              <img
                                src={q.explanationImageUrl}
                                alt="Explanation Diagram"
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
