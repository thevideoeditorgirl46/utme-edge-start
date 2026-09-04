import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PAGE_SIZE = 10;

export type Option = { key: "A" | "B" | "C" | "D"; text: string };

export type StudentQuestion = {
  id: string;
  number: number;
  prompt: string;
  options: Option[];
  imageUrl: string | null;
  bookmarked: boolean;
  note: string;
  attempt: { selected: string; isCorrect: boolean } | null;
};

type Db = {
  from: (table: string) => ReturnType<import("@supabase/supabase-js").SupabaseClient["from"]>;
};

/** Authoritative access check: approved share points must meet the configured threshold or reward unlock exists. */
async function accessState(supabase: Db, userId: string) {
  const [rows, settings, unlock] = await Promise.all([
    supabase
      .from("share_verifications")
      .select("claimed_points")
      .eq("student_id", userId)
      .eq("status", "approved"),
    supabase.from("verification_settings").select("required_points").eq("id", 1).maybeSingle(),
    supabase.from("reward_unlocks").select("user_id").eq("user_id", userId).maybeSingle(),
  ]);
  const verifiedPoints = ((rows.data ?? []) as { claimed_points: number }[]).reduce(
    (sum, r) => sum + (r.claimed_points ?? 0),
    0,
  );
  const requiredPoints =
    (settings.data as { required_points?: number } | null)?.required_points ?? 100;
  const unlocked = Boolean(unlock.data) || verifiedPoints >= requiredPoints;
  return { unlocked, verifiedPoints, requiredPoints };
}

async function requireAccess(supabase: Db, userId: string) {
  const state = await accessState(supabase, userId);
  if (!state.unlocked) throw new Error("Edge Practice is locked");
  return state;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type AccessStatus = "APPROVED" | "PENDING" | "DENIED" | "NOT_FOUND" | "ERROR";

export type VerifyNETAccessResult = {
  status: AccessStatus;
  message: string;
  studentName?: string;
  registrationId?: string;
  verifiedPoints: number;
  requiredPoints: number;
  pendingPoints: number;
};

export const verifyNETAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input?: { netId?: string }) => ({
    netId: input?.netId ? input.netId.trim().toUpperCase() : undefined,
  }))
  .handler(async ({ data, context }): Promise<VerifyNETAccessResult> => {
    const { supabase, userId } = context;
    const db = await admin();

    try {
      let targetUserId = userId;
      let regId: string | null = null;
      let fullName: string | null = null;

      if (data?.netId) {
        const profileRes = await db
          .from("profiles")
          .select("id, registration_id, full_name")
          .ilike("registration_id", data.netId)
          .maybeSingle();

        if (!profileRes.data) {
          return {
            status: "NOT_FOUND",
            message: `No registration found matching "${data.netId}". Please check your NET ID on your dashboard.`,
            verifiedPoints: 0,
            requiredPoints: 100,
            pendingPoints: 0,
          };
        }
        targetUserId = profileRes.data.id;
        regId = profileRes.data.registration_id;
        fullName = profileRes.data.full_name;
      } else {
        const myProfile = await supabase
          .from("profiles")
          .select("registration_id, full_name")
          .eq("id", userId)
          .maybeSingle();
        regId = myProfile.data?.registration_id ?? null;
        fullName = myProfile.data?.full_name ?? null;
      }

      const [rows, settings, unlock] = await Promise.all([
        db
          .from("share_verifications")
          .select("claimed_points, status")
          .eq("student_id", targetUserId),
        db.from("verification_settings").select("required_points").eq("id", 1).maybeSingle(),
        db.from("reward_unlocks").select("user_id").eq("user_id", targetUserId).maybeSingle(),
      ]);

      const submissions = (rows.data ?? []) as { claimed_points: number; status: string }[];
      const verifiedPoints = submissions
        .filter((r) => r.status === "approved")
        .reduce((sum, r) => sum + (r.claimed_points ?? 0), 0);
      const pendingPoints = submissions
        .filter((r) => r.status === "pending" || r.status === "needs_review")
        .reduce((sum, r) => sum + (r.claimed_points ?? 0), 0);
      const requiredPoints =
        (settings.data as { required_points?: number } | null)?.required_points ?? 100;

      const isUnlocked = Boolean(unlock.data) || verifiedPoints >= requiredPoints;

      if (isUnlocked) {
        return {
          status: "APPROVED",
          message: "Access verified. Welcome to Edge Practice!",
          studentName: fullName ?? undefined,
          registrationId: regId ?? undefined,
          verifiedPoints,
          requiredPoints,
          pendingPoints,
        };
      }

      if (pendingPoints > 0) {
        return {
          status: "PENDING",
          message: `Your flyer share proof (${pendingPoints} points) is currently awaiting verification. Once verified, Edge Practice will unlock automatically.`,
          studentName: fullName ?? undefined,
          registrationId: regId ?? undefined,
          verifiedPoints,
          requiredPoints,
          pendingPoints,
        };
      }

      return {
        status: "DENIED",
        message:
          "Edge Practice access requires completing the Foundational Class share & unlock reward (100 verified points).",
        studentName: fullName ?? undefined,
        registrationId: regId ?? undefined,
        verifiedPoints,
        requiredPoints,
        pendingPoints,
      };
    } catch {
      return {
        status: "ERROR",
        message:
          "Unable to verify access at this moment. Please check your connection and try again.",
        verifiedPoints: 0,
        requiredPoints: 100,
        pendingPoints: 0,
      };
    }
  });

export const getPracticeAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => accessState(context.supabase as never, context.userId));

/** Subject list with light metadata. */
export const getSubjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const access = await accessState(context.supabase as never, context.userId);
    if (!access.unlocked) return { ...access, subjects: [] };

    const db = await admin();
    const [subjects, topics, questions] = await Promise.all([
      db.from("practice_subjects").select("id, slug, name").order("sort_order"),
      db.from("practice_topics").select("id, subject_id"),
      db.from("questions").select("topic_id").eq("status", "published"),
    ]);

    const topicSubject = new Map(
      (topics.data ?? []).map((t: { id: string; subject_id: string }) => [t.id, t.subject_id]),
    );
    const questionCount = new Map<string, number>();
    for (const q of questions.data ?? []) {
      const subjectId = topicSubject.get(q.topic_id);
      if (subjectId) questionCount.set(subjectId, (questionCount.get(subjectId) ?? 0) + 1);
    }
    const topicCount = new Map<string, number>();
    for (const t of topics.data ?? []) {
      topicCount.set(t.subject_id, (topicCount.get(t.subject_id) ?? 0) + 1);
    }

    return {
      ...access,
      subjects: (subjects.data ?? []).map((s: { id: string; slug: string; name: string }) => ({
        slug: s.slug,
        name: s.name,
        topics: topicCount.get(s.id) ?? 0,
        questions: questionCount.get(s.id) ?? 0,
      })),
    };
  });

/** Topics of one subject, with per-topic question and progress counts. */
export const getTopics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { subject: string }) => {
    if (!input?.subject) throw new Error("Missing subject");
    return input;
  })
  .handler(async ({ data, context }) => {
    await requireAccess(context.supabase as never, context.userId);
    const db = await admin();

    const subject = await db
      .from("practice_subjects")
      .select("id, slug, name")
      .eq("slug", data.subject)
      .maybeSingle();
    if (!subject.data) throw new Error("Subject not found");

    const topics = await db
      .from("practice_topics")
      .select("id, slug, name")
      .eq("subject_id", subject.data.id)
      .order("sort_order");

    const topicIds = (topics.data ?? []).map((t: { id: string }) => t.id);
    const [questions, attempts] = await Promise.all([
      db.from("questions").select("topic_id").eq("status", "published").in("topic_id", topicIds),
      context.supabase
        .from("question_attempts")
        .select("topic_id")
        .eq("user_id", context.userId)
        .in("topic_id", topicIds),
    ]);

    const count = (rows: { topic_id: string }[]) => {
      const m = new Map<string, number>();
      for (const r of rows) m.set(r.topic_id, (m.get(r.topic_id) ?? 0) + 1);
      return m;
    };
    const qCount = count(questions.data ?? []);
    const aCount = count((attempts.data ?? []) as { topic_id: string }[]);

    return {
      subject: { slug: subject.data.slug, name: subject.data.name },
      topics: (topics.data ?? []).map((t: { id: string; slug: string; name: string }) => ({
        slug: t.slug,
        name: t.name,
        questions: qCount.get(t.id) ?? 0,
        attempted: aCount.get(t.id) ?? 0,
      })),
    };
  });

/** One page of 10 questions. Correct answers and explanations are never included here. */
export const getQuestionPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { subject: string; topic: string; page?: number }) => {
    if (!input?.subject || !input?.topic) throw new Error("Missing topic");
    return { ...input, page: Math.max(1, Math.floor(Number(input.page) || 1)) };
  })
  .handler(async ({ data, context }) => {
    await requireAccess(context.supabase as never, context.userId);
    const db = await admin();

    const subject = await db
      .from("practice_subjects")
      .select("id, slug, name")
      .eq("slug", data.subject)
      .maybeSingle();
    if (!subject.data) throw new Error("Subject not found");

    const topic = await db
      .from("practice_topics")
      .select("id, slug, name")
      .eq("subject_id", subject.data.id)
      .eq("slug", data.topic)
      .maybeSingle();
    if (!topic.data) throw new Error("Topic not found");

    const from = (data.page - 1) * PAGE_SIZE;

    const rows = await db
      .from("questions")
      .select("id, prompt, option_a, option_b, option_c, option_d, image_url", { count: "exact" })
      .eq("topic_id", topic.data.id)
      .eq("status", "published")
      .order("sort_order")
      .order("created_at")
      .range(from, from + PAGE_SIZE - 1);

    const ids = (rows.data ?? []).map((q: { id: string }) => q.id);
    const [bookmarks, notes, attempts] = await Promise.all([
      context.supabase
        .from("question_bookmarks")
        .select("question_id")
        .eq("user_id", context.userId)
        .in("question_id", ids),
      context.supabase
        .from("question_notes")
        .select("question_id, body")
        .eq("user_id", context.userId)
        .in("question_id", ids),
      context.supabase
        .from("question_attempts")
        .select("question_id, selected_option, is_correct")
        .eq("user_id", context.userId)
        .in("question_id", ids),
    ]);

    const bookmarked = new Set(
      ((bookmarks.data ?? []) as { question_id: string }[]).map((b) => b.question_id),
    );
    const noteBy = new Map(
      ((notes.data ?? []) as { question_id: string; body: string }[]).map((n) => [
        n.question_id,
        n.body,
      ]),
    );
    const attemptBy = new Map(
      (
        (attempts.data ?? []) as {
          question_id: string;
          selected_option: string;
          is_correct: boolean;
        }[]
      ).map((a) => [a.question_id, { selected: a.selected_option, isCorrect: a.is_correct }]),
    );

    const total = rows.count ?? 0;

    type PageQuestionRow = {
      id: string;
      prompt: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      image_url: string | null;
    };

    const questions: StudentQuestion[] = ((rows.data as unknown as PageQuestionRow[]) ?? []).map(
      (q, i) => ({
        id: q.id,
        number: from + i + 1,
        prompt: q.prompt,
        options: [
          { key: "A" as const, text: q.option_a },
          { key: "B" as const, text: q.option_b },
          { key: "C" as const, text: q.option_c },
          { key: "D" as const, text: q.option_d },
        ],
        imageUrl: q.image_url ?? null,
        bookmarked: bookmarked.has(q.id),
        note: noteBy.get(q.id) ?? "",
        attempt: attemptBy.get(q.id) ?? null,
      }),
    );

    return {
      subject: { slug: subject.data.slug, name: subject.data.name },
      topic: { slug: topic.data.slug, name: topic.data.name },
      page: data.page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      questions,
    };
  });

/** Answer one question. The correct option is only returned after the student commits an answer. */
export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { questionId: string; selected: string }) => {
    if (!input?.questionId) throw new Error("Missing question");
    if (!["A", "B", "C", "D"].includes(input?.selected)) throw new Error("Pick an option");
    return input;
  })
  .handler(async ({ data, context }) => {
    await requireAccess(context.supabase as never, context.userId);
    const db = await admin();

    const q = await db
      .from("questions")
      .select("id, topic_id, correct_option, explanation, status")
      .eq("id", data.questionId)
      .eq("status", "published")
      .maybeSingle();
    if (!q.data) throw new Error("Question not found");

    const isCorrect = q.data.correct_option === data.selected;

    await context.supabase.from("question_attempts").upsert(
      {
        user_id: context.userId,
        question_id: q.data.id,
        topic_id: q.data.topic_id,
        selected_option: data.selected,
        is_correct: isCorrect,
      },
      { onConflict: "user_id,question_id" },
    );

    return {
      questionId: q.data.id,
      isCorrect,
      correctOption: q.data.correct_option as string,
      explanation: (q.data.explanation as string | null) ?? null,
    };
  });

/** Reveal answers + explanations for the questions currently on screen. */
export const revealAnswers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { questionIds: string[] }) => {
    const ids = Array.isArray(input?.questionIds) ? input.questionIds.slice(0, PAGE_SIZE) : [];
    if (!ids.length) throw new Error("No questions to reveal");
    return { questionIds: ids };
  })
  .handler(async ({ data, context }) => {
    await requireAccess(context.supabase as never, context.userId);
    const db = await admin();

    const rows = await db
      .from("questions")
      .select("id, correct_option, explanation")
      .eq("status", "published")
      .in("id", data.questionIds);

    return {
      answers: (rows.data ?? []).map(
        (q: { id: string; correct_option: string; explanation: string | null }) => ({
          questionId: q.id,
          correctOption: q.correct_option,
          explanation: q.explanation ?? null,
        }),
      ),
    };
  });

export const toggleBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { questionId: string; bookmarked: boolean }) => {
    if (!input?.questionId) throw new Error("Missing question");
    return input;
  })
  .handler(async ({ data, context }) => {
    await requireAccess(context.supabase as never, context.userId);
    if (data.bookmarked) {
      await context.supabase
        .from("question_bookmarks")
        .upsert(
          { user_id: context.userId, question_id: data.questionId },
          { onConflict: "user_id,question_id" },
        );
    } else {
      await context.supabase
        .from("question_bookmarks")
        .delete()
        .eq("user_id", context.userId)
        .eq("question_id", data.questionId);
    }
    return { bookmarked: data.bookmarked };
  });

export const saveNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { questionId: string; body: string }) => {
    if (!input?.questionId) throw new Error("Missing question");
    return { questionId: input.questionId, body: (input.body ?? "").slice(0, 4000) };
  })
  .handler(async ({ data, context }) => {
    await requireAccess(context.supabase as never, context.userId);
    if (!data.body.trim()) {
      await context.supabase
        .from("question_notes")
        .delete()
        .eq("user_id", context.userId)
        .eq("question_id", data.questionId);
      return { saved: true };
    }
    const { error } = await context.supabase
      .from("question_notes")
      .upsert(
        { user_id: context.userId, question_id: data.questionId, body: data.body },
        { onConflict: "user_id,question_id" },
      );
    if (error) throw new Error(error.message);
    return { saved: true };
  });

/** Questions the student saved, with their note and subject/topic labels. */
export const getSavedQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAccess(context.supabase as never, context.userId);
    const db = await admin();

    const [bookmarks, notes] = await Promise.all([
      context.supabase
        .from("question_bookmarks")
        .select("question_id, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(100),
      context.supabase
        .from("question_notes")
        .select("question_id, body")
        .eq("user_id", context.userId),
    ]);

    const ids = ((bookmarks.data ?? []) as { question_id: string }[]).map((b) => b.question_id);
    if (!ids.length) return { items: [] };

    const rows = await db
      .from("questions")
      .select("id, prompt, option_a, option_b, option_c, option_d, topic_id")
      .eq("status", "published")
      .in("id", ids);

    type JoinedTopic = {
      id: string;
      name: string;
      slug: string;
      subject_id: string;
      practice_subjects: { name: string; slug: string } | null;
    };

    type SavedQuestionRow = {
      id: string;
      prompt: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      topic_id: string;
    };

    const topicById = new Map(
      ((topics.data as unknown as JoinedTopic[]) ?? []).map((t) => [t.id, t]),
    );
    const noteBy = new Map(
      ((notes.data ?? []) as { question_id: string; body: string }[]).map((n) => [
        n.question_id,
        n.body,
      ]),
    );

    return {
      items: ((rows.data as unknown as SavedQuestionRow[]) ?? []).map((q) => {
        const t = topicById.get(q.topic_id);
        return {
          id: q.id,
          prompt: q.prompt,
          options: [
            { key: "A" as const, text: q.option_a },
            { key: "B" as const, text: q.option_b },
            { key: "C" as const, text: q.option_c },
            { key: "D" as const, text: q.option_d },
          ],
          note: noteBy.get(q.id) ?? "",
          topicName: t?.name ?? "",
          topicSlug: t?.slug ?? "",
          subjectName: t?.practice_subjects?.name ?? "",
          subjectSlug: t?.practice_subjects?.slug ?? "",
        };
      }),
    };
  });

/** Simple, plain-language progress figures. */
export const getMyProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAccess(context.supabase as never, context.userId);
    const db = await admin();

    const attempts = await context.supabase
      .from("question_attempts")
      .select("topic_id, is_correct")
      .eq("user_id", context.userId);

    const rows = (attempts.data ?? []) as { topic_id: string; is_correct: boolean }[];
    type ProgressTopic = {
      id: string;
      name: string;
      subject_id: string;
      practice_subjects: { name: string } | null;
    };

    const topics = await db
      .from("practice_topics")
      .select("id, name, subject_id, practice_subjects(name)");
    const topicById = new Map(
      ((topics.data as unknown as ProgressTopic[]) ?? []).map((t) => [t.id, t]),
    );

    const perTopic = new Map<
      string,
      { name: string; subject: string; total: number; correct: number }
    >();
    for (const r of rows) {
      const t = topicById.get(r.topic_id);
      const key = r.topic_id;
      const entry = perTopic.get(key) ?? {
        name: t?.name ?? "Topic",
        subject: t?.practice_subjects?.name ?? "",
        total: 0,
        correct: 0,
      };
      entry.total += 1;
      if (r.is_correct) entry.correct += 1;
      perTopic.set(key, entry);
    }

    const attempted = rows.length;
    const correct = rows.filter((r) => r.is_correct).length;

    return {
      attempted,
      correct,
      wrong: attempted - correct,
      accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
      topics: [...perTopic.values()].sort((a, b) => b.total - a.total),
    };
  });
