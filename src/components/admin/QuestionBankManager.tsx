import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Archive,
  Check,
  CheckCircle,
  Copy,
  Edit2,
  Eye,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BulkQuestionUploader } from "@/components/admin/BulkQuestionUploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { AdminQuestionItem } from "@/lib/practice-admin.functions";
import {
  getAdminQuestions,
  updateAdminQuestionStatus,
  upsertAdminQuestion,
} from "@/lib/practice-admin.functions";

type AdminSubject = { id: string; slug: string; name: string };
type AdminTopic = {
  id: string;
  slug: string;
  name: string;
  subject_id: string;
  subjectName?: string;
  subjectSlug?: string;
};

const STATUS_BADGES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted-foreground/30",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  approved: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  archived: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30",
};

export function QuestionBankManager() {
  const queryClient = useQueryClient();
  const fetchQuestions = useServerFn(getAdminQuestions);
  const updateStatus = useServerFn(updateAdminQuestionStatus);
  const saveQuestion = useServerFn(upsertAdminQuestion);

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<AdminQuestionItem> | null>(null);
  const [formTopicId, setFormTopicId] = useState("");
  const [formPrompt, setFormPrompt] = useState("");
  const [formOptionA, setFormOptionA] = useState("");
  const [formOptionB, setFormOptionB] = useState("");
  const [formOptionC, setFormOptionC] = useState("");
  const [formOptionD, setFormOptionD] = useState("");
  const [formCorrect, setFormCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [formExplanation, setFormExplanation] = useState("");
  const [formExplanationImageUrl, setFormExplanationImageUrl] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<
    "draft" | "pending" | "approved" | "published" | "archived"
  >("pending");
  const [previewMathInModal, setPreviewMathInModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-questions", selectedSubject, selectedTopic, selectedStatus, searchTerm],
    queryFn: () =>
      fetchQuestions({
        data: {
          subjectSlug: selectedSubject !== "all" ? selectedSubject : undefined,
          topicSlug: selectedTopic !== "all" ? selectedTopic : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          search: searchTerm || undefined,
        },
      }),
  });

  const statusMutation = useMutation({
    mutationFn: (input: {
      questionId: string;
      status: "draft" | "pending" | "approved" | "published" | "archived";
    }) => updateStatus({ data: input }),
    onSuccess: (_, vars) => {
      toast.success(`Question status updated to ${vars.status}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveMutation = useMutation({
    mutationFn: (input: {
      id?: string | undefined;
      topic_id: string;
      prompt: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: "A" | "B" | "C" | "D";
      explanation?: string | undefined;
      source?: string | undefined;
      image_url?: string | undefined;
      status?: "draft" | "pending" | "approved" | "published" | "archived" | undefined;
    }) => saveQuestion({ data: input }),
    onSuccess: () => {
      toast.success(editingQuestion?.id ? "Question updated" : "Question created");
      setIsModalOpen(false);
      setEditingQuestion(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreateModal() {
    setEditingQuestion(null);
    setFormTopicId(data?.topics?.[0]?.id || "");
    setFormPrompt("");
    setFormOptionA("");
    setFormOptionB("");
    setFormOptionC("");
    setFormOptionD("");
    setFormCorrect("A");
    setFormExplanation("");
    setFormExplanationImageUrl("");
    setFormSource("NET Foundational Class Content");
    setFormImageUrl("");
    setFormStatus("pending");
    setPreviewMathInModal(false);
    setIsModalOpen(true);
  }

  function openEditModal(q: AdminQuestionItem) {
    setEditingQuestion(q);
    setFormTopicId(q.topicId);
    setFormPrompt(q.prompt);
    setFormOptionA(q.option_a);
    setFormOptionB(q.option_b);
    setFormOptionC(q.option_c);
    setFormOptionD(q.option_d);
    setFormCorrect(q.correct_option);

    // Extract any markdown image in explanation if present
    let cleanExp = q.explanation || "";
    let expImg = "";
    const imgMatch = cleanExp.match(/!\[(?:.*?)\]\((https?:\/\/\S+|\/\S+)\)/i);
    if (imgMatch) {
      expImg = imgMatch[1] ?? "";
      cleanExp = cleanExp.replace(imgMatch[0] ?? "", "").trim();
    }

    setFormExplanation(cleanExp);
    setFormExplanationImageUrl(expImg);
    setFormSource(q.source || "");
    setFormImageUrl(q.image_url || "");
    setFormStatus(q.status);
    setPreviewMathInModal(false);
    setIsModalOpen(true);
  }

  function handleSave() {
    if (!formTopicId) {
      toast.error("Please select a topic");
      return;
    }
    if (!formPrompt.trim()) {
      toast.error("Please enter a question prompt");
      return;
    }
    if (!formOptionA.trim() || !formOptionB.trim()) {
      toast.error("Options A and B are required");
      return;
    }

    let finalExplanation = formExplanation.trim();
    if (
      formExplanationImageUrl.trim() &&
      !finalExplanation.includes(formExplanationImageUrl.trim())
    ) {
      finalExplanation = finalExplanation
        ? `${finalExplanation}\n\n![Explanation Diagram](${formExplanationImageUrl.trim()})`
        : `![Explanation Diagram](${formExplanationImageUrl.trim()})`;
    }

    saveMutation.mutate({
      id: editingQuestion?.id,
      topic_id: formTopicId,
      prompt: formPrompt,
      option_a: formOptionA,
      option_b: formOptionB,
      option_c: formOptionC,
      option_d: formOptionD,
      correct_option: formCorrect,
      explanation: finalExplanation || undefined,
      source: formSource,
      image_url: formImageUrl.trim() || undefined,
      status: formStatus,
    });
  }

  const subjects: AdminSubject[] = (data?.subjects as AdminSubject[]) ?? [];
  const topics: AdminTopic[] = ((data?.topics as AdminTopic[]) ?? []).filter((t: AdminTopic) => {
    if (selectedSubject === "all") return true;
    const s = subjects.find((sub: AdminSubject) => sub.slug === selectedSubject);
    return s ? t.subject_id === s.id : true;
  });
  const questions = data?.questions ?? [];

  return (
    <section className="space-y-6">
      {/* Controls & Filter Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Filter */}
          <Select
            value={selectedSubject}
            onValueChange={(val) => {
              setSelectedSubject(val);
              setSelectedTopic("all");
            }}
          >
            <SelectTrigger className="w-40 text-xs">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s: AdminSubject) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Topic Filter */}
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-44 text-xs">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((t: AdminTopic) => (
                <SelectItem key={t.slug} value={t.slug}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-44 pl-8 text-xs sm:w-56"
            />
          </div>

          <Button
            onClick={() => setIsBulkOpen((prev) => !prev)}
            variant={isBulkOpen ? "secondary" : "outline"}
            size="sm"
            className="h-9 gap-1.5 text-xs"
          >
            <UploadCloud className="size-3.5" />
            {isBulkOpen ? "Back to Question List" : "Bulk AI Upload"}
          </Button>

          <Button onClick={openCreateModal} size="sm" className="h-9 gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Bulk Upload Mode or Standard Question List */}
      {isBulkOpen ? (
        <BulkQuestionUploader
          subjects={subjects}
          topics={(data?.topics as AdminTopic[]) ?? []}
          onSuccess={() => setIsBulkOpen(false)}
        />
      ) : isLoading ? (
        <div className="space-y-3 py-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No questions match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <article
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      STATUS_BADGES[q.status] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {q.status}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {q.subjectName}
                  </span>
                  <span className="text-xs text-muted-foreground">{q.topicName}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Rev {q.revision}
                  </span>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {q.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          statusMutation.mutate({ questionId: q.id, status: "approved" })
                        }
                        className="h-7 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400"
                      >
                        <Check className="mr-1 size-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          statusMutation.mutate({ questionId: q.id, status: "archived" })
                        }
                        className="h-7 text-xs text-zinc-500"
                      >
                        <Archive className="mr-1 size-3" /> Reject
                      </Button>
                    </>
                  ) : null}

                  {q.status === "approved" ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        statusMutation.mutate({ questionId: q.id, status: "published" })
                      }
                      className="h-7 bg-emerald-600 text-xs hover:bg-emerald-700"
                    >
                      <CheckCircle className="mr-1 size-3" /> Publish
                    </Button>
                  ) : null}

                  {q.status === "published" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        statusMutation.mutate({ questionId: q.id, status: "archived" })
                      }
                      className="h-7 text-xs text-zinc-500 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Archive className="mr-1 size-3" /> Archive
                    </Button>
                  ) : null}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(q)}
                    className="h-7 text-xs"
                  >
                    <Edit2 className="mr-1 size-3" /> Edit
                  </Button>
                </div>
              </div>

              {/* Prompt & Options */}
              <div className="mt-3">
                <div className="text-sm font-medium text-foreground whitespace-pre-wrap">
                  <MathText content={q.prompt} />
                </div>

                {q.image_url ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-border max-w-sm">
                    <img
                      src={q.image_url}
                      alt="Question diagram"
                      loading="lazy"
                      className="max-h-48 object-contain"
                    />
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div
                    className={`rounded-lg border p-2 ${
                      q.correct_option === "A"
                        ? "border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">A.</span> <MathText content={q.option_a} />
                  </div>
                  <div
                    className={`rounded-lg border p-2 ${
                      q.correct_option === "B"
                        ? "border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">B.</span> <MathText content={q.option_b} />
                  </div>
                  <div
                    className={`rounded-lg border p-2 ${
                      q.correct_option === "C"
                        ? "border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">C.</span> <MathText content={q.option_c} />
                  </div>
                  <div
                    className={`rounded-lg border p-2 ${
                      q.correct_option === "D"
                        ? "border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">D.</span> <MathText content={q.option_d} />
                  </div>
                </div>

                {q.explanation ? (
                  <div className="mt-3 rounded-lg border border-border/80 bg-secondary/30 p-2.5 text-xs">
                    <span className="font-semibold text-muted-foreground">Explanation: </span>
                    <span className="text-foreground">
                      <MathText content={q.explanation} />
                    </span>
                  </div>
                ) : null}

                {q.source ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">Source: {q.source}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Edit / Create Question Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion?.id
                ? `Edit Question (Rev ${editingQuestion.revision})`
                : "Add New Question"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Topic selector */}
            <div>
              <Label className="text-xs font-semibold">Topic</Label>
              <Select value={formTopicId} onValueChange={setFormTopicId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {((data?.topics as AdminTopic[]) ?? []).map((t: AdminTopic) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.subjectName} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Question Prompt (LaTeX math supported)
                </Label>
                <button
                  type="button"
                  onClick={() => setPreviewMathInModal((p) => !p)}
                  className="text-xs text-primary hover:underline"
                >
                  {previewMathInModal ? "Hide Math Preview" : "Show Math Preview"}
                </button>
              </div>
              <Textarea
                placeholder="Enter question text (e.g. Find the value of $x$ when $2x + 1 = 9$)..."
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                className="mt-1 min-h-[90px] text-sm"
              />
              {previewMathInModal && formPrompt ? (
                <div className="mt-2 rounded-xl border border-border/80 bg-secondary/30 p-3 text-sm">
                  <MathText content={formPrompt} />
                </div>
              ) : null}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold">Option A</Label>
                <Input
                  value={formOptionA}
                  onChange={(e) => setFormOptionA(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Option B</Label>
                <Input
                  value={formOptionB}
                  onChange={(e) => setFormOptionB(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Option C</Label>
                <Input
                  value={formOptionC}
                  onChange={(e) => setFormOptionC(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Option D</Label>
                <Input
                  value={formOptionD}
                  onChange={(e) => setFormOptionD(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            {/* Correct Option & Status */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold">Correct Option</Label>
                <Select
                  value={formCorrect}
                  onValueChange={(val) => setFormCorrect(val as "A" | "B" | "C" | "D")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Option A</SelectItem>
                    <SelectItem value="B">Option B</SelectItem>
                    <SelectItem value="C">Option C</SelectItem>
                    <SelectItem value="D">Option D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(val) =>
                    setFormStatus(
                      val as "draft" | "pending" | "approved" | "published" | "archived",
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Teaching Explanation */}
            <div>
              <Label className="text-xs font-semibold">Teaching Explanation (Worked Steps)</Label>
              <Textarea
                placeholder="Explain the step-by-step reasoning, formula, and key concept..."
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                className="mt-1 min-h-[80px] text-sm"
              />
              {previewMathInModal && formExplanation ? (
                <div className="mt-2 rounded-xl border border-border/80 bg-secondary/30 p-3 text-sm">
                  <MathText content={formExplanation} />
                </div>
              ) : null}
            </div>

            {/* Image URLs Grid (Question Diagram + Explanation Diagram) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Question Diagram URL */}
              <div>
                <Label className="text-xs font-semibold">Question Diagram URL (Optional)</Label>
                <Input
                  placeholder="https://... or /assets/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
                {formImageUrl ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border max-w-xs">
                    <img
                      src={formImageUrl}
                      alt="Question Diagram"
                      className="max-h-28 object-contain"
                    />
                  </div>
                ) : null}
              </div>

              {/* Explanation Diagram URL */}
              <div>
                <Label className="text-xs font-semibold">Explanation Diagram URL (Optional)</Label>
                <Input
                  placeholder="https://... (Worked solution chart/diagram)"
                  value={formExplanationImageUrl}
                  onChange={(e) => setFormExplanationImageUrl(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
                {formExplanationImageUrl ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border max-w-xs">
                    <img
                      src={formExplanationImageUrl}
                      alt="Explanation Diagram"
                      className="max-h-28 object-contain"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Source */}
            <div>
              <Label className="text-xs font-semibold">Source / Provenance</Label>
              <Input
                placeholder="e.g. NET JAMB Preparation Pipeline 2026"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {editingQuestion?.id ? "Save Revision" : "Create Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
