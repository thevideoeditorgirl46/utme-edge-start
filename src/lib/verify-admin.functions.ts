import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { assertAdmin } from "./net.server";

export type QueueItem = {
  id: string;
  student_id: string;
  studentName: string;
  registrationId: string | null;
  email: string | null;
  share_type: string;
  claimed_points: number;
  status: string;
  automated_score: number | null;
  automated_recommendation: string | null;
  verification_method: string;
  fraud_score: number;
  fraud_flags: string[];
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  signedUrl: string | null;
  duplicateOf: number;
  previousSubmissions: number;
  totalApprovedPoints: number;
};

export const getVerificationAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const [rows, profiles, unlocks, settings, audit] = await Promise.all([
      supabase
        .from("share_verifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("profiles").select("id, full_name, email, registration_id, created_at"),
      supabase.from("reward_unlocks").select("user_id"),
      supabase.from("verification_settings").select("*").eq("id", 1).maybeSingle(),
      supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    const all = rows.data ?? [];
    const profileById = new Map((profiles.data ?? []).map((p) => [p.id, p]));
    const unlockedSet = new Set((unlocks.data ?? []).map((u) => u.user_id));

    const hashCounts = new Map<string, number>();
    for (const r of all) {
      if (r.image_hash) hashCounts.set(r.image_hash, (hashCounts.get(r.image_hash) ?? 0) + 1);
    }

    const approvedPointsByStudent = new Map<string, number>();
    const countByStudent = new Map<string, number>();
    for (const r of all) {
      countByStudent.set(r.student_id, (countByStudent.get(r.student_id) ?? 0) + 1);
      if (r.status === "approved") {
        approvedPointsByStudent.set(
          r.student_id,
          (approvedPointsByStudent.get(r.student_id) ?? 0) + (r.claimed_points ?? 0),
        );
      }
    }

    const queue: QueueItem[] = await Promise.all(
      all.map(async (r) => {
        const { data: signed } = await supabase.storage
          .from("share-proofs")
          .createSignedUrl(r.image_path, 60 * 30);
        const p = profileById.get(r.student_id);
        return {
          id: r.id,
          student_id: r.student_id,
          studentName: p?.full_name ?? "Unknown student",
          registrationId: p?.registration_id ?? null,
          email: p?.email ?? null,
          share_type: r.share_type,
          claimed_points: r.claimed_points,
          status: r.status,
          automated_score: r.automated_score,
          automated_recommendation: r.automated_recommendation,
          verification_method: r.verification_method,
          fraud_score: Number(r.fraud_score ?? 0),
          fraud_flags: r.fraud_flags ?? [],
          rejection_reason: r.rejection_reason,
          created_at: r.created_at,
          reviewed_at: r.reviewed_at,
          signedUrl: signed?.signedUrl ?? null,
          duplicateOf: (r.image_hash ? (hashCounts.get(r.image_hash) ?? 1) : 1) - 1,
          previousSubmissions: (countByStudent.get(r.student_id) ?? 1) - 1,
          totalApprovedPoints: approvedPointsByStudent.get(r.student_id) ?? 0,
        };
      }),
    );

    const students = (profiles.data ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      registration_id: p.registration_id,
      created_at: p.created_at,
      verifiedPoints: approvedPointsByStudent.get(p.id) ?? 0,
      pendingPoints: all
        .filter(
          (r) =>
            r.student_id === p.id && (r.status === "pending" || r.status === "needs_review"),
        )
        .reduce((s, r) => s + (r.claimed_points ?? 0), 0),
      unlocked: unlockedSet.has(p.id),
      submissionCount: countByStudent.get(p.id) ?? 0,
    }));

    return {
      queue,
      students,
      settings: settings.data,
      audit: audit.data ?? [],
      overview: {
        totalStudents: students.length,
        unlockedStudents: students.filter((s) => s.unlocked).length,
        pendingStudents: new Set(all.filter((r) => r.status === "pending").map((r) => r.student_id))
          .size,
        approvedShares: all.filter((r) => r.status === "approved").length,
        pendingSubmissions: all.filter((r) => r.status === "pending").length,
        rejectedSubmissions: all.filter((r) => r.status === "rejected").length,
        flaggedSubmissions: all.filter(
          (r) => r.status === "needs_review" || Number(r.fraud_score ?? 0) >= 0.5,
        ).length,
      },
    };
  });

export const reviewShareVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { id: string; decision: "approved" | "rejected" | "needs_review"; reason?: string }) => {
      if (!input?.id) throw new Error("Missing submission");
      if (!["approved", "rejected", "needs_review"].includes(input.decision))
        throw new Error("Invalid decision");
      if (input.decision === "rejected" && !input.reason?.trim())
        throw new Error("A rejection reason is required");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const current = await supabase
      .from("share_verifications")
      .select("id, status, student_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!current.data) throw new Error("Submission not found");

    const { error } = await supabase
      .from("share_verifications")
      .update({
        status: data.decision,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: data.decision === "rejected" ? (data.reason?.trim() ?? null) : null,
        verification_method: "MANUAL",
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: userId,
      action: `review:${data.decision}`,
      submission_id: data.id,
      target_user_id: current.data.student_id,
      previous_status: current.data.status,
      new_status: data.decision,
      reason: data.reason?.trim() || null,
    });

    return { ok: true };
  });

export const saveVerificationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      friend_points: number;
      group_points: number;
      required_points: number;
      auto_approve_enabled: boolean;
      auto_approve_min_confidence: number;
      auto_approve_max_fraud: number;
      auto_reject_min_fraud: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { error } = await supabase
      .from("verification_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: userId,
      action: "settings:update",
      reason: JSON.stringify(data),
    });

    return { ok: true };
  });
