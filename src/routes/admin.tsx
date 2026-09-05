import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { QuestionBankManager } from "@/components/admin/QuestionBankManager";
import { PracticeAdminPreview } from "@/components/admin/PracticeAdminPreview";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  getVerificationAdminData,
  reviewShareVerification,
  saveVerificationSettings,
} from "@/lib/verify-admin.functions";

const FILTERS = ["pending", "needs_review", "approved", "rejected", "high_risk", "all"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABEL: Record<Filter, string> = {
  pending: "Pending",
  needs_review: "Needs Review",
  approved: "Approved",
  rejected: "Rejected",
  high_risk: "High Risk",
  all: "All",
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — Newton Edge Tutorial" },
      {
        name: "description",
        content:
          "Staff-only console for reviewing flyer-share verifications, student unlock status and verification settings.",
      },
      { property: "og:title", content: "Admin console — Newton Edge Tutorial" },
      { property: "og:description", content: "Staff-only verification and student management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const fetchData = useServerFn(getVerificationAdminData);
  const review = useServerFn(reviewShareVerification);
  const saveSettings = useServerFn(saveVerificationSettings);

  const [filter, setFilter] = useState<Filter>("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-verification"],
    queryFn: () => fetchData(),
    enabled: Boolean(user),
    retry: false,
  });

  const decide = useMutation({
    mutationFn: (input: {
      id: string;
      decision: "approved" | "rejected" | "needs_review";
      reason?: string;
    }) => review({ data: input }),
    onSuccess: () => {
      toast.success("Decision recorded");
      void queryClient.invalidateQueries({ queryKey: ["admin-verification"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!loading && user && error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
          <h1 className="font-display text-2xl font-extrabold">Not authorised</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted to Newton Edge administrators.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const queue = (data?.queue ?? []).filter((q) => {
    if (filter === "all") return true;
    if (filter === "high_risk") return q.fraud_score >= 0.5;
    return q.status === filter;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold">Admin console</h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : !data ? null : (
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Question bank</TabsTrigger>
              <TabsTrigger value="preview">Practice preview</TabsTrigger>
              <TabsTrigger value="queue">Verification queue</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="audit">Audit log</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Registered students" value={data.overview.totalStudents} />
              <Metric label="Students unlocked" value={data.overview.unlockedStudents} />
              <Metric label="Students pending" value={data.overview.pendingStudents} />
              <Metric label="Approved shares" value={data.overview.approvedShares} />
              <Metric label="Pending submissions" value={data.overview.pendingSubmissions} />
              <Metric label="Rejected submissions" value={data.overview.rejectedSubmissions} />
              <Metric label="Flagged submissions" value={data.overview.flaggedSubmissions} />
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
              <QuestionBankManager />
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <PracticeAdminPreview />
            </TabsContent>

            <TabsContent value="queue" className="mt-6">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "default" : "outline"}
                    onClick={() => setFilter(f)}
                  >
                    {FILTER_LABEL[f]}
                  </Button>
                ))}
              </div>

              <div className="mt-4 space-y-4">
                {queue.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing in this view.</p>
                ) : null}
                {queue.map((q) => (
                  <article key={q.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                      {q.signedUrl ? (
                        <a href={q.signedUrl} target="_blank" rel="noreferrer">
                          <img
                            src={q.signedUrl}
                            alt={`Share evidence from ${q.studentName}`}
                            className="max-h-64 w-full rounded-lg border border-border object-contain"
                          />
                        </a>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border p-6 text-xs text-muted-foreground">
                          Screenshot unavailable
                        </div>
                      )}

                      <div className="text-sm">
                        <p className="font-display text-base font-bold">{q.studentName}</p>
                        <p className="text-muted-foreground">
                          {q.registrationId ?? q.student_id} · {q.email ?? "no email"}
                        </p>
                        <p className="mt-2">
                          {q.share_type === "group" ? "🎓 Educational Group" : "👥 Friend"} ·
                          claimed {q.claimed_points} pts · status <strong>{q.status}</strong>
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Submitted {new Date(q.created_at).toLocaleString()} · previous
                          submissions: {q.previousSubmissions} · total approved:{" "}
                          {q.totalApprovedPoints} pts
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Automated: {q.automated_recommendation ?? "—"} (confidence{" "}
                          {q.automated_score ?? 0}) · method {q.verification_method} · fraud score{" "}
                          {q.fraud_score}
                          {q.duplicateOf > 0
                            ? ` · ${q.duplicateOf} identical image(s) on file`
                            : ""}
                        </p>
                        {q.fraud_flags.length ? (
                          <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                            {q.fraud_flags.map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Input
                            placeholder="Rejection reason"
                            className="h-9 max-w-xs"
                            value={reasons[q.id] ?? ""}
                            onChange={(e) => setReasons((r) => ({ ...r, [q.id]: e.target.value }))}
                          />
                          <Button
                            size="sm"
                            disabled={decide.isPending}
                            onClick={() => decide.mutate({ id: q.id, decision: "approved" })}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={decide.isPending}
                            onClick={() =>
                              decide.mutate({
                                id: q.id,
                                decision: "rejected",
                                reason: reasons[q.id] ?? "",
                              })
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={decide.isPending}
                            onClick={() => decide.mutate({ id: q.id, decision: "needs_review" })}
                          >
                            Request review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="py-2">Student</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Verified</th>
                    <th>Pending</th>
                    <th>Unlocked</th>
                    <th>Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2">{s.full_name}</td>
                      <td>{s.email}</td>
                      <td>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td>{s.verifiedPoints}</td>
                      <td>{s.pendingPoints}</td>
                      <td>{s.unlocked ? "Yes" : "No"}</td>
                      <td>{s.submissionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsForm
                settings={data.settings}
                onSave={async (values) => {
                  await saveSettings({ data: values });
                  toast.success("Settings saved");
                  void queryClient.invalidateQueries({ queryKey: ["admin-verification"] });
                }}
              />
            </TabsContent>

            <TabsContent value="audit" className="mt-6 space-y-2 text-sm">
              {data.audit.length === 0 ? (
                <p className="text-muted-foreground">No admin actions yet.</p>
              ) : (
                data.audit.map((a) => (
                  <p key={a.id} className="rounded-lg border border-border px-3 py-2">
                    {new Date(a.created_at).toLocaleString()} · {a.action} ·{" "}
                    {a.previous_status ?? "—"} → {a.new_status ?? "—"}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </p>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

type Settings = {
  friend_points: number;
  group_points: number;
  required_points: number;
  auto_approve_enabled: boolean;
  auto_approve_min_confidence: number;
  auto_approve_max_fraud: number;
  auto_reject_min_fraud: number;
};

function SettingsForm({
  settings,
  onSave,
}: {
  settings: Settings | null;
  onSave: (values: Settings) => Promise<void>;
}) {
  const [form, setForm] = useState<Settings>({
    friend_points: settings?.friend_points ?? 20,
    group_points: settings?.group_points ?? 50,
    required_points: settings?.required_points ?? 100,
    auto_approve_enabled: settings?.auto_approve_enabled ?? true,
    auto_approve_min_confidence: settings?.auto_approve_min_confidence ?? 0.85,
    auto_approve_max_fraud: settings?.auto_approve_max_fraud ?? 0.2,
    auto_reject_min_fraud: settings?.auto_reject_min_fraud ?? 0.9,
  });

  const fields: [keyof Settings, string, number][] = [
    ["friend_points", "Points per friend share", 1],
    ["group_points", "Points per educational group share", 1],
    ["required_points", "Points required to unlock", 1],
    ["auto_approve_min_confidence", "Auto-approve min confidence", 0.01],
    ["auto_approve_max_fraud", "Auto-approve max fraud score", 0.01],
    ["auto_reject_min_fraud", "Auto flag/reject min fraud score", 0.01],
  ];

  return (
    <div className="grid max-w-xl gap-4">
      {fields.map(([key, label, step]) => (
        <div key={key}>
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type="number"
            step={step}
            value={String(form[key])}
            onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
            className="mt-1"
          />
        </div>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.auto_approve_enabled}
          onChange={(e) => setForm((f) => ({ ...f, auto_approve_enabled: e.target.checked }))}
        />
        Enable automated auto-approval
      </label>
      <Button className="h-12 w-fit" onClick={() => void onSave(form)}>
        Save settings
      </Button>
    </div>
  );
}
