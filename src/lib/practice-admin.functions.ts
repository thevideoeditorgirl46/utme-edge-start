import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { assertAdmin } from "./net.server";

export type AdminQuestionItem = {
  id: string;
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectName: string;
  subjectSlug: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  image_url: string | null;
  source: string | null;
  status: "draft" | "pending" | "approved" | "published" | "archived";
  revision: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const getAdminQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input?: {
      subjectSlug?: string | undefined;
      topicSlug?: string | undefined;
      status?: string | undefined;
      search?: string | undefined;
    }) =>
      input || {},
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch subjects and topics for filter dropdowns
    const [subjectsRes, topicsRes] = await Promise.all([
      supabaseAdmin.from("practice_subjects").select("id, slug, name").order("sort_order"),
      supabaseAdmin
        .from("practice_topics")
        .select("id, slug, name, subject_id")
        .order("sort_order"),
    ]);

    const subjects = subjectsRes.data ?? [];
    const topics = topicsRes.data ?? [];

    const subjectById = new Map(subjects.map((s) => [s.id, s]));
    const topicById = new Map(
      topics.map((t) => {
        const sub = subjectById.get(t.subject_id);
        return [
          t.id,
          {
            ...t,
            subjectName: sub?.name ?? "",
            subjectSlug: sub?.slug ?? "",
          },
        ];
      }),
    );

    // Build question query
    let query = supabaseAdmin
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status as "draft" | "pending" | "approved" | "published" | "archived");
    }

    if (data.topicSlug) {
      const matchedTopic = topics.find((t) => t.slug === data.topicSlug);
      if (matchedTopic) {
        query = query.eq("topic_id", matchedTopic.id);
      }
    } else if (data.subjectSlug) {
      const matchedSubject = subjects.find((s) => s.slug === data.subjectSlug);
      if (matchedSubject) {
        const topicIds = topics.filter((t) => t.subject_id === matchedSubject.id).map((t) => t.id);
        if (topicIds.length) {
          query = query.in("topic_id", topicIds);
        }
      }
    }

    type QuestionDbRow = {
      id: string;
      topic_id: string;
      prompt: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: "A" | "B" | "C" | "D";
      explanation: string | null;
      image_url: string | null;
      source: string | null;
      status: "draft" | "pending" | "approved" | "published" | "archived";
      revision: number;
      sort_order: number;
      created_at: string;
      updated_at: string;
    };

    const { data: rows, error: rowsError } = await query;
    if (rowsError) throw new Error(rowsError.message);

    let list: AdminQuestionItem[] = ((rows as unknown as QuestionDbRow[]) ?? []).map((q) => {
      const t = topicById.get(q.topic_id);
      return {
        id: q.id,
        topicId: q.topic_id,
        topicName: t?.name ?? "",
        topicSlug: t?.slug ?? "",
        subjectName: t?.subjectName ?? "",
        subjectSlug: t?.subjectSlug ?? "",
        prompt: q.prompt,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation ?? null,
        image_url: q.image_url ?? null,
        source: q.source ?? null,
        status: q.status,
        revision: q.revision ?? 1,
        sort_order: q.sort_order ?? 0,
        created_at: q.created_at,
        updated_at: q.updated_at,
      };
    });

    if (data.search?.trim()) {
      const term = data.search.trim().toLowerCase();
      list = list.filter(
        (q) =>
          q.prompt.toLowerCase().includes(term) ||
          q.subjectName.toLowerCase().includes(term) ||
          q.topicName.toLowerCase().includes(term),
      );
    }

    return {
      questions: list,
      subjects,
      topics,
    };
  });

export const updateAdminQuestionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      questionId: string;
      status: "draft" | "pending" | "approved" | "published" | "archived";
    }) => {
      if (!input?.questionId) throw new Error("Missing question ID");
      if (!["draft", "pending", "approved", "published", "archived"].includes(input?.status)) {
        throw new Error("Invalid status");
      }
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("questions")
      .update({
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.questionId);

    if (error) throw new Error(error.message);
    return { ok: true, status: data.status };
  });

export const upsertAdminQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
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
      sort_order?: number | undefined;
    }) => {
      if (!input.topic_id) throw new Error("Please select a topic");
      if (!input.prompt?.trim()) throw new Error("Question text is required");
      if (!input.option_a?.trim() || !input.option_b?.trim())
        throw new Error("Options A and B are required");
      if (!["A", "B", "C", "D"].includes(input.correct_option))
        throw new Error("Correct option must be A, B, C or D");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.id) {
      // Existing question update: increment revision and save revision snapshot
      const current = await supabaseAdmin
        .from("questions")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      const nextRev = (current.data?.revision ?? 1) + 1;

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("questions")
        .update({
          topic_id: data.topic_id,
          prompt: data.prompt.trim(),
          option_a: data.option_a.trim(),
          option_b: data.option_b.trim(),
          option_c: data.option_c.trim(),
          option_d: data.option_d.trim(),
          correct_option: data.correct_option,
          explanation: data.explanation?.trim() || null,
          source: data.source?.trim() || null,
          image_url: data.image_url?.trim() || null,
          status: data.status || current.data?.status || "pending",
          sort_order: data.sort_order ?? current.data?.sort_order ?? 0,
          revision: nextRev,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .select("*")
        .single();

      if (updateErr) throw new Error(updateErr.message);

      // Save revision snapshot
      await supabaseAdmin.from("question_revisions").insert({
        question_id: data.id,
        revision: nextRev,
        snapshot: updated,
        edited_by: userId,
      });

      return { id: data.id, revision: nextRev };
    } else {
      // New question insertion (starts as pending by default as per rule 27)
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("questions")
        .insert({
          topic_id: data.topic_id,
          prompt: data.prompt.trim(),
          option_a: data.option_a.trim(),
          option_b: data.option_b.trim(),
          option_c: data.option_c.trim(),
          option_d: data.option_d.trim(),
          correct_option: data.correct_option,
          explanation: data.explanation?.trim() || null,
          source: data.source?.trim() || null,
          image_url: data.image_url?.trim() || null,
          status: data.status || "pending",
          sort_order: data.sort_order ?? 0,
          revision: 1,
          created_by: userId,
        })
        .select("*")
        .single();

      if (insertErr) throw new Error(insertErr.message);

      await supabaseAdmin.from("question_revisions").insert({
        question_id: inserted.id,
        revision: 1,
        snapshot: inserted,
        edited_by: userId,
      });

      return { id: inserted.id, revision: 1 };
    }
  });
