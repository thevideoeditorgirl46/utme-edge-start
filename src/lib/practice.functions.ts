import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PracticeQuestion = {
  id: string;
  prompt: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
};

/** Authoritative unlock check: approved share points must meet the configured threshold. */
async function hasUnlocked(
  supabase: { from: (t: string) => any },
  userId: string,
): Promise<boolean> {
  const [rows, settings] = await Promise.all([
    supabase
      .from("share_verifications")
      .select("claimed_points")
      .eq("student_id", userId)
      .eq("status", "approved"),
    supabase.from("verification_settings").select("required_points").eq("id", 1).maybeSingle(),
  ]);
  const points = ((rows.data ?? []) as { claimed_points: number }[]).reduce(
    (sum, r) => sum + (r.claimed_points ?? 0),
    0,
  );
  const required = (settings.data as { required_points?: number } | null)?.required_points ?? 100;
  return points >= required;
}

export const getPracticeQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const unlocked = await hasUnlocked(supabase as never, userId);

    if (!unlocked) return { unlocked: false, setTitle: null, questions: [] as PracticeQuestion[] };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const set = await supabaseAdmin
      .from("practice_sets")
      .select("id, title")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!set.data) return { unlocked: true, setTitle: null, questions: [] as PracticeQuestion[] };

    const rows = await supabaseAdmin
      .from("practice_questions")
      .select("id, prompt, option_a, option_b, option_c, option_d, sort_order")
      .eq("set_id", set.data.id)
      .order("sort_order", { ascending: true });

    const questions: PracticeQuestion[] = (rows.data ?? []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: [
        { key: "A", text: q.option_a },
        { key: "B", text: q.option_b },
        { key: "C", text: q.option_c },
        { key: "D", text: q.option_d },
      ],
    }));

    return { unlocked: true, setTitle: set.data.title, questions };
  });

export const answerQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { questionId: string; selected: string }) => {
    if (!input?.questionId) throw new Error("Missing question");
    if (!["A", "B", "C", "D"].includes(input?.selected)) throw new Error("Pick an option");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const unlock = await supabase
      .from("reward_unlocks")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!unlock.data) throw new Error("Practice is locked");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const q = await supabaseAdmin
      .from("practice_questions")
      .select("correct_option, explanation")
      .eq("id", data.questionId)
      .maybeSingle();

    if (!q.data) throw new Error("Question not found");

    const isCorrect = q.data.correct_option.toUpperCase() === data.selected;

    await supabase.from("practice_attempts").insert({
      user_id: userId,
      question_id: data.questionId,
      selected_option: data.selected,
      is_correct: isCorrect,
    });

    return {
      isCorrect,
      correctOption: q.data.correct_option.toUpperCase(),
      explanation: q.data.explanation,
    };
  });
