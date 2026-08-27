import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { generateRegistrationId } from "./net.server";

export type RegistrationInput = {
  fullName: string;
  whatsappNumber: string;
  telegramUsername?: string;
  utmeYear: string;
  writtenBefore: boolean;
  previousScore?: number | null;
  challengeAreas: string[];
  subjects: string[];
  improvementGoal?: string;
  referralSource: string;
};

function validate(input: RegistrationInput): RegistrationInput {
  if (!input.fullName?.trim()) throw new Error("Full name is required");
  if (!input.whatsappNumber?.trim()) throw new Error("WhatsApp number is required");
  if (!input.utmeYear) throw new Error("UTME year is required");
  if (!input.referralSource) throw new Error("Please tell us how you found us");
  return input;
}

export const submitRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email ?? "";

    const existing = await supabase
      .from("profiles")
      .select("registration_id")
      .eq("id", userId)
      .maybeSingle();

    let registrationId = existing.data?.registration_id ?? null;

    if (!registrationId) {
      for (let attempt = 0; attempt < 5 && !registrationId; attempt++) {
        const candidate = generateRegistrationId();
        const { error } = await supabase.from("profiles").insert({
          id: userId,
          full_name: data.fullName.trim(),
          email,
          whatsapp_number: data.whatsappNumber.trim(),
          telegram_username: data.telegramUsername?.trim() || null,
          registration_id: candidate,
        });
        if (!error) registrationId = candidate;
        else if (!error.message.includes("registration_id")) throw new Error(error.message);
      }
      if (!registrationId) throw new Error("Could not generate a registration ID. Please retry.");
    } else {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName.trim(),
          whatsapp_number: data.whatsappNumber.trim(),
          telegram_username: data.telegramUsername?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw new Error(error.message);
    }

    const payload = {
      user_id: userId,
      utme_year: data.utmeYear,
      written_before: data.writtenBefore,
      previous_score: data.writtenBefore ? (data.previousScore ?? null) : null,
      challenge_areas: data.challengeAreas,
      subjects: data.subjects,
      improvement_goal: data.improvementGoal?.trim() || null,
      referral_source: data.referralSource,
    };

    const hasRegistration = await supabase
      .from("registrations")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const { error: regError } = hasRegistration.data
      ? await supabase.from("registrations").update(payload).eq("user_id", userId)
      : await supabase.from("registrations").insert(payload);

    if (regError) throw new Error(regError.message);

    return { registrationId };
  });

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profile, registration, unlock, submissions, links, admin] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("registrations").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("reward_unlocks").select("unlocked_at").eq("user_id", userId).maybeSingle(),
      supabase
        .from("sharing_submissions")
        .select("id, status, verification_note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("class_links")
        .select("whatsapp_url, telegram_url, flyer_url")
        .eq("id", 1)
        .maybeSingle(),
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    ]);

    return {
      profile: profile.data,
      registration: registration.data,
      unlocked: Boolean(unlock.data),
      submissions: submissions.data ?? [],
      links: links.data ?? null,
      isAdmin: admin.data === true,
    };
  });
