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
    }) => input || {},
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
      query = query.eq(
        "status",
        data.status as "draft" | "pending" | "approved" | "published" | "archived",
      );
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

export type BulkQuestionInput = {
  topic_id: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation?: string | null;
  image_url?: string | null;
  source?: string | null;
  status?: "draft" | "pending" | "approved" | "published" | "archived";
};

export const bulkUpsertAdminQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { questions: BulkQuestionInput[] }) => {
    if (!Array.isArray(input?.questions) || input.questions.length === 0) {
      throw new Error("No questions provided for bulk upload");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const insertedIds: string[] = [];
    let count = 0;

    for (const q of data.questions) {
      if (!q.topic_id || !q.prompt?.trim() || !q.option_a?.trim() || !q.option_b?.trim()) {
        continue;
      }

      const correct = ["A", "B", "C", "D"].includes(q.correct_option) ? q.correct_option : "A";

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("questions")
        .insert({
          topic_id: q.topic_id,
          prompt: q.prompt.trim(),
          option_a: q.option_a.trim(),
          option_b: q.option_b.trim(),
          option_c: (q.option_c || "").trim(),
          option_d: (q.option_d || "").trim(),
          correct_option: correct,
          explanation: q.explanation?.trim() || null,
          source: q.source?.trim() || "Bulk AI/Text Import",
          image_url: q.image_url?.trim() || null,
          status: q.status || "approved",
          sort_order: count,
          revision: 1,
          created_by: userId,
        })
        .select("id, revision, prompt, topic_id")
        .single();

      if (insertErr) {
        console.error("Failed to insert bulk question:", insertErr);
        continue;
      }

      await supabaseAdmin.from("question_revisions").insert({
        question_id: inserted.id,
        revision: 1,
        snapshot: inserted,
        edited_by: userId,
      });

      insertedIds.push(inserted.id);
      count++;
    }

    return { ok: true, count, insertedIds };
  });

export const getAdminPracticePreview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input?: {
      subjectSlug?: string | undefined;
      topicSlug?: string | undefined;
      statusFilter?: string | undefined;
    }) => input || {},
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch subjects and topics
    const [subjectsRes, topicsRes] = await Promise.all([
      supabaseAdmin.from("practice_subjects").select("id, slug, name").order("sort_order"),
      supabaseAdmin
        .from("practice_topics")
        .select("id, slug, name, subject_id")
        .order("sort_order"),
    ]);

    const subjects = subjectsRes.data ?? [];
    const topics = topicsRes.data ?? [];

    const activeSubject = subjects.find((s) => s.slug === data.subjectSlug) ?? subjects[0];
    const availableTopics = topics.filter((t) =>
      activeSubject ? t.subject_id === activeSubject.id : true,
    );
    const activeTopic =
      availableTopics.find((t) => t.slug === data.topicSlug) ?? availableTopics[0];

    if (!activeTopic) {
      return {
        subjects,
        topics: availableTopics,
        activeSubject: activeSubject ?? null,
        activeTopic: null,
        questions: [],
      };
    }

    let query = supabaseAdmin
      .from("questions")
      .select("*")
      .eq("topic_id", activeTopic.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (data.statusFilter && data.statusFilter !== "all") {
      query = query.eq(
        "status",
        data.statusFilter as "draft" | "pending" | "approved" | "published" | "archived",
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    type QuestionRow = {
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
      status: string;
      revision: number;
      sort_order: number;
    };

    const studentQuestions = ((rows as unknown as QuestionRow[]) ?? []).map((q, idx) => ({
      id: q.id,
      number: idx + 1,
      prompt: q.prompt,
      imageUrl: q.image_url,
      options: [
        { key: "A" as const, text: q.option_a },
        { key: "B" as const, text: q.option_b },
        { key: "C" as const, text: q.option_c },
        { key: "D" as const, text: q.option_d },
      ],
      correctOption: q.correct_option,
      explanation: q.explanation,
      status: q.status,
      attempt: null,
      bookmarked: false,
      note: null,
    }));

    return {
      subjects,
      topics: availableTopics,
      activeSubject,
      activeTopic,
      questions: studentQuestions,
    };
  });

/**
 * Wipes old practice data and seeds the official JAMB UTME syllabus
 * (120 topics across 5 subjects) plus verified real past exam questions.
 */
export const seedOfficialJambSyllabus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { JAMB_SUBJECTS, JAMB_TOPICS, JAMB_QUESTIONS } = await import("./jamb-syllabus-data");

    // Prefer supabaseAdmin (bypass RLS), fall back to context.supabase (which has admin role)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let db: any = supabase;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) db = supabaseAdmin;
    } catch {
      // Fallback to user-scoped supabase client
    }

    // 1. Wipe existing questions, topics, subjects
    await db.from("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await db.from("practice_topics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await db.from("practice_subjects").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Insert subjects
    const insertedSubjects: Array<{ id: string; slug: string; name: string }> = [];
    for (const sub of JAMB_SUBJECTS) {
      const res = await db
        .from("practice_subjects")
        .insert({ slug: sub.slug, name: sub.name, sort_order: sub.sort_order })
        .select("id, slug, name")
        .single();
      if (res.data) {
        insertedSubjects.push(res.data);
      } else if (res.error) {
        throw new Error(`Failed to insert subject ${sub.name}: ${res.error.message}`);
      }
    }

    const subjectMap = new Map(insertedSubjects.map((s) => [s.slug, s.id]));

    // 3. Insert topics for each subject
    const insertedTopics: Array<{ id: string; slug: string; subject_id: string }> = [];
    for (const [subSlug, topics] of Object.entries(JAMB_TOPICS)) {
      const subjectId = subjectMap.get(subSlug);
      if (!subjectId) continue;

      const rowsToInsert = topics.map((t) => ({
        subject_id: subjectId,
        slug: t.slug,
        name: t.name,
        sort_order: t.sort_order,
      }));

      const res = await db
        .from("practice_topics")
        .insert(rowsToInsert)
        .select("id, slug, subject_id");

      if (res.data) {
        insertedTopics.push(...res.data);
      } else if (res.error) {
        throw new Error(`Failed to insert topics for ${subSlug}: ${res.error.message}`);
      }
    }

    // Map "subjectSlug:topicSlug" -> topicId
    const topicMap = new Map<string, string>();
    for (const t of insertedTopics) {
      const subSlug = insertedSubjects.find((s) => s.id === t.subject_id)?.slug;
      if (subSlug) {
        topicMap.set(`${subSlug}:${t.slug}`, t.id);
      }
    }

    // 4. Insert verified UTME questions
    const questionRows = JAMB_QUESTIONS.map((q) => {
      const topicId = topicMap.get(`${q.subjectSlug}:${q.topicSlug}`);
      if (!topicId) return null;
      return {
        topic_id: topicId,
        prompt: q.prompt,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation,
        status: "published" as const,
        source: "Verified JAMB UTME Past Questions",
        sort_order: q.sort_order,
      };
    }).filter(Boolean);

    if (questionRows.length > 0) {
      const res = await db.from("questions").insert(questionRows);
      if (res.error) {
        console.error("Failed to insert questions:", res.error.message);
      }
    }

    return {
      success: true,
      subjectsCount: insertedSubjects.length,
      topicsCount: insertedTopics.length,
      questionsCount: questionRows.length,
    };
  });
