import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { verifyShareScreenshot } from "./net.server";

type Input = { imagePath: string; dataUrl: string };

export const submitShareProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Input) => {
    if (!input?.imagePath) throw new Error("Missing upload");
    if (!input?.dataUrl?.startsWith("data:image/")) throw new Error("Invalid image");
    if (input.dataUrl.length > 8_000_000) throw new Error("Screenshot is too large");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (!data.imagePath.startsWith(`${userId}/`)) throw new Error("Invalid upload path");

    const check = await verifyShareScreenshot(data.dataUrl);

    const { error } = await supabase.from("sharing_submissions").insert({
      user_id: userId,
      image_path: data.imagePath,
      status: check.verdict,
      verification_note: check.note,
      reviewed_at: check.verdict === "approved" ? new Date().toISOString() : null,
    });
    if (error) throw new Error(error.message);

    if (check.verdict === "approved") {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("reward_unlocks")
        .upsert({ user_id: userId, source: "flyer_share" }, { onConflict: "user_id" });
    }

    return { status: check.verdict, note: check.note };
  });
