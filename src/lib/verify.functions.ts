import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ShareVerificationRow = {
  id: string;
  share_type: string;
  claimed_points: number;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type ShareStatus = {
  verifiedPoints: number;
  pendingPoints: number;
  requiredPoints: number;
  friendPoints: number;
  groupPoints: number;
  unlocked: boolean;
  approvedFriends: number;
  approvedGroups: number;
  submissions: ShareVerificationRow[];
};

const SELECT = "id, share_type, claimed_points, status, rejection_reason, created_at, reviewed_at";

/** Authoritative, server-computed share/unlock status for the signed-in student. */
export const getShareStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ShareStatus> => {
    const { supabase, userId } = context;

    const [rows, settings, unlock] = await Promise.all([
      supabase
        .from("share_verifications")
        .select(SELECT)
        .eq("student_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("verification_settings")
        .select("friend_points, group_points, required_points")
        .eq("id", 1)
        .maybeSingle(),
      supabase.from("reward_unlocks").select("user_id").eq("user_id", userId).maybeSingle(),
    ]);

    const submissions = (rows.data ?? []) as ShareVerificationRow[];
    const approved = submissions.filter((s) => s.status === "approved");

    return {
      verifiedPoints: approved.reduce((sum, s) => sum + (s.claimed_points ?? 0), 0),
      pendingPoints: submissions
        .filter((s) => s.status === "pending" || s.status === "review")
        .reduce((sum, s) => sum + (s.claimed_points ?? 0), 0),
      requiredPoints: settings.data?.required_points ?? 100,
      friendPoints: settings.data?.friend_points ?? 20,
      groupPoints: settings.data?.group_points ?? 50,
      unlocked: Boolean(unlock.data),
      approvedFriends: approved.filter((s) => s.share_type === "friend").length,
      approvedGroups: approved.filter((s) => s.share_type === "group").length,
      submissions,
    };
  });

type SubmitInput = {
  imagePath: string;
  dataUrl: string;
  shareType: "friend" | "group";
  perceptualHash: string;
};

export const submitShareVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SubmitInput) => {
    if (!input?.imagePath) throw new Error("Missing upload");
    if (!/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(input?.dataUrl ?? ""))
      throw new Error("Only JPG, PNG or WEBP screenshots are accepted");
    if (input.dataUrl.length > 8_000_000) throw new Error("Screenshot is too large");
    if (input.shareType !== "friend" && input.shareType !== "group")
      throw new Error("Select what you shared to");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (!data.imagePath.startsWith(`${userId}/`)) throw new Error("Invalid upload path");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { automatedReview, dataUrlToBytes, hammingHex, sha256Hex } = await import(
      "./verify.server"
    );

    const settings = await supabaseAdmin
      .from("verification_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    const cfg = settings.data;

    const bytes = dataUrlToBytes(data.dataUrl);
    const imageHash = await sha256Hex(bytes);
    const pHash = /^[0-9a-f]{16}$/i.test(data.perceptualHash ?? "")
      ? data.perceptualHash.toLowerCase()
      : "";

    const flags: string[] = [];
    let fraud = 0;

    // --- Duplicate / reuse protection -------------------------------------
    const priors = await supabaseAdmin
      .from("share_verifications")
      .select("id, student_id, image_hash, perceptual_hash, status, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    const all = priors.data ?? [];
    const exact = all.filter((r) => r.image_hash === imageHash);
    if (exact.length) {
      const own = exact.some((r) => r.student_id === userId);
      flags.push(own ? "Exact duplicate of your own earlier screenshot" : "Exact duplicate of another student's screenshot");
      fraud += own ? 0.7 : 0.9;
    } else if (pHash) {
      const near = all.filter(
        (r) => r.perceptual_hash && hammingHex(r.perceptual_hash, pHash) <= 6,
      );
      if (near.length) {
        const own = near.some((r) => r.student_id === userId);
        flags.push(own ? "Visually similar to your own earlier screenshot" : "Visually similar to another student's screenshot");
        fraud += own ? 0.5 : 0.75;
      }
    }
    if (!pHash) {
      flags.push("No perceptual fingerprint supplied");
      fraud += 0.1;
    }

    // --- Student-level abuse signals --------------------------------------
    const mine = all.filter((r) => r.student_id === userId);
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const recent = mine.filter((r) => new Date(r.created_at).getTime() > hourAgo).length;
    if (recent >= 5) {
      flags.push(`High submission frequency (${recent} in the last hour)`);
      fraud += 0.3;
    }
    const rejected = mine.filter((r) => r.status === "rejected").length;
    if (rejected >= 2) {
      flags.push(`${rejected} previously rejected submissions`);
      fraud += 0.2;
    }

    // --- Automated (advisory) review --------------------------------------
    const review = await automatedReview(data.dataUrl, data.shareType);
    flags.push(...review.flags);
    if (review.recommendation === "REJECT") fraud += 0.3;
    else if (review.recommendation === "HUMAN REVIEW") fraud += 0.1;

    fraud = Math.min(1, Number(fraud.toFixed(2)));

    let status: "pending" | "approved" | "rejected" | "review" = "pending";
    if (fraud >= (cfg?.auto_reject_min_fraud ?? 0.9)) status = "review";
    else if (
      (cfg?.auto_approve_enabled ?? true) &&
      review.recommendation === "AUTO-APPROVE" &&
      review.score >= (cfg?.auto_approve_min_confidence ?? 0.85) &&
      fraud <= (cfg?.auto_approve_max_fraud ?? 0.2)
    ) {
      status = "approved";
    } else if (fraud >= 0.5) status = "review";

    const { data: inserted, error } = await supabaseAdmin
      .from("share_verifications")
      .insert({
        student_id: userId,
        share_type: data.shareType,
        image_path: data.imagePath,
        image_hash: imageHash,
        perceptual_hash: pHash || null,
        status,
        automated_score: review.score,
        automated_recommendation: review.recommendation,
        verification_method: "HYBRID",
        fraud_score: fraud,
        fraud_flags: Array.from(new Set(flags)).slice(0, 10),
        reviewed_at: status === "approved" ? new Date().toISOString() : null,
      })
      .select("id, status")
      .single();

    if (error) throw new Error(error.message);

    return { status: inserted.status as string };
  });
