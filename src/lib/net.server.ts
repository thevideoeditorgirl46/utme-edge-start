import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/** Publishable-key client for public, RLS-protected reads on the server. */
export function publicServerClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRegistrationId() {
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `NET-${code}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function assertAdmin(supabase: SupabaseClient<any, any, any>, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || data !== true) {
    throw new Error("Admin access required");
  }
}

export type ShareCheck = { verdict: "approved" | "pending"; note: string };

/**
 * Automated flyer-share check. Uses the Lovable AI gateway vision model; any
 * failure or low confidence falls back to manual admin review.
 */
export async function verifyShareScreenshot(dataUrl: string): Promise<ShareCheck> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { verdict: "pending", note: "Automatic check unavailable — sent for review." };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You verify screenshots proving a student shared a tutorial flyer. Reply with ONLY compact JSON: " +
              '{"shared": boolean, "confidence": number between 0 and 1, "reason": short string}. ' +
              "shared is true only when the screenshot clearly shows a messaging or social app (WhatsApp status/chat, Telegram, Instagram, Facebook, X) where an educational flyer or poster image has been posted or sent by the user.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Does this screenshot prove the flyer was shared?" },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return { verdict: "pending", note: "Automatic check unavailable — sent for review." };
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { verdict: "pending", note: "Could not read the screenshot — sent for review." };

    const parsed = JSON.parse(match[0]) as { shared?: boolean; confidence?: number; reason?: string };
    if (parsed.shared === true && (parsed.confidence ?? 0) >= 0.7) {
      return { verdict: "approved", note: parsed.reason ?? "Share confirmed automatically." };
    }
    return {
      verdict: "pending",
      note: parsed.reason ? `Needs review: ${parsed.reason}` : "Needs review.",
    };
  } catch {
    return { verdict: "pending", note: "Automatic check failed — sent for review." };
  }
}
