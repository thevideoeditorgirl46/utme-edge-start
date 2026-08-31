import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { assertAdmin } from "./net.server";

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const [profiles, registrations, stories, links, submissions, unlocks, sets, questions] =
      await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("registrations").select("*"),
        supabase.from("success_stories").select("*").order("sort_order", { ascending: true }),
        supabase.from("class_links").select("*").eq("id", 1).maybeSingle(),
        supabase
          .from("sharing_submissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("reward_unlocks").select("user_id"),
        supabase.from("practice_sets").select("*").order("sort_order", { ascending: true }),
        supabase
          .from("practice_questions")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

    const signed = await Promise.all(
      (submissions.data ?? []).map(async (s) => {
        const { data } = await supabase.storage
          .from("share-proofs")
          .createSignedUrl(s.image_path, 60 * 30);
        return { ...s, signedUrl: data?.signedUrl ?? null };
      }),
    );

    const regByUser = new Map((registrations.data ?? []).map((r) => [r.user_id, r]));
    const unlockedSet = new Set((unlocks.data ?? []).map((u) => u.user_id));

    return {
      students: (profiles.data ?? []).map((p) => ({
        ...p,
        registration: regByUser.get(p.id) ?? null,
        unlocked: unlockedSet.has(p.id),
      })),
      stories: stories.data ?? [],
      links: links.data ?? null,
      submissions: signed,
      sets: sets.data ?? [],
      questions: questions.data ?? [],
    };
  });

export const saveClassLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      whatsapp_channel: string;
      whatsapp_group: string;
      telegram_physics: string;
      telegram_chemistry: string;
      telegram_math: string;
      telegram_english: string;
      telegram_biology: string;
      flyer: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { error } = await supabase
      .from("class_links")
      .update({
        whatsapp_channel_url: data.whatsapp_channel.trim() || null,
        whatsapp_group_url: data.whatsapp_group.trim() || null,
        telegram_physics_url: data.telegram_physics.trim() || null,
        telegram_chemistry_url: data.telegram_chemistry.trim() || null,
        telegram_math_url: data.telegram_math.trim() || null,
        telegram_english_url: data.telegram_english.trim() || null,
        telegram_biology_url: data.telegram_biology.trim() || null,
        flyer_url: data.flyer.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      student_name: string;
      utme_score: number;
      photo_url: string | null;
      result_image_url: string | null;
      excerpt: string;
      full_story: string;
      featured: boolean;
      published: boolean;
      sort_order: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { id, ...fields } = data;
    const { error } = await supabase.from("success_stories").update(fields).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reviewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; userId: string; approve: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { error } = await supabase
      .from("sharing_submissions")
      .update({
        status: data.approve ? "approved" : "rejected",
        verification_note: data.approve ? "Approved by admin." : "Rejected by admin.",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.approve) {
      await supabase
        .from("reward_unlocks")
        .upsert({ user_id: data.userId, source: "flyer_share" }, { onConflict: "user_id" });
    } else {
      await supabase.from("reward_unlocks").delete().eq("user_id", data.userId);
    }
    return { ok: true };
  });

export const saveQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      set_id: string;
      prompt: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: string;
      explanation: string;
      sort_order: number;
    }) => {
      if (!input.prompt?.trim()) throw new Error("Question text is required");
      if (!["A", "B", "C", "D"].includes(input.correct_option))
        throw new Error("Correct option must be A, B, C or D");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { id, ...fields } = data;
    const { error } = id
      ? await supabase.from("practice_questions").update(fields).eq("id", id)
      : await supabase.from("practice_questions").insert(fields);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("practice_questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
