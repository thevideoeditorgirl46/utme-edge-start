/** Server-only helpers for share verification: hashing, automated review, fraud scoring. */

export type ShareType = "friend" | "group";

export type AutomatedReview = {
  score: number; // confidence the evidence is genuine, 0..1
  recommendation: "AUTO-APPROVE" | "HUMAN REVIEW" | "REJECT";
  flags: string[];
};

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const b64 = dataUrl.slice(comma + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Hamming distance between two 64-bit hex fingerprints. */
export function hammingHex(a: string, b: string): number {
  if (!a || !b || a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    const x = parseInt(a[i]!, 16) ^ parseInt(b[i]!, 16);
    dist += (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1) + ((x >> 3) & 1);
  }
  return dist;
}

/**
 * Automated (AI vision) review. Advisory only — it produces a recommendation,
 * confidence and fraud indicators. Admins always have the final say.
 */
export async function automatedReview(
  dataUrl: string,
  shareType: ShareType,
): Promise<AutomatedReview> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return {
      score: 0,
      recommendation: "HUMAN REVIEW",
      flags: ["Automated check unavailable"],
    };
  }

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
              "You review screenshots submitted as evidence that a student shared a tutorial flyer/message. " +
              'Reply with ONLY compact JSON: {"shared": boolean, "destination": "friend"|"group"|"unclear", ' +
              '"confidence": number 0..1, "edited": boolean, "flags": string[], "reason": string}. ' +
              "shared is true only when a messaging/social app clearly shows the flyer image or the bootcamp message " +
              "posted or sent by the user. destination is 'group' when it is a group chat, channel or status broadcast, " +
              "'friend' when it is a one-to-one chat. Set edited true if the screenshot looks manipulated. " +
              "Screenshot is evidence, not proof: be conservative.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The student claims they shared to a ${shareType === "group" ? "educational group" : "friend"}. Assess the screenshot.`,
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return { score: 0, recommendation: "HUMAN REVIEW", flags: ["Automated check failed"] };
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return { score: 0, recommendation: "HUMAN REVIEW", flags: ["Unreadable automated result"] };
    }

    const parsed = JSON.parse(match[0]) as {
      shared?: boolean;
      destination?: string;
      confidence?: number;
      edited?: boolean;
      flags?: string[];
      reason?: string;
    };

    const flags: string[] = Array.isArray(parsed.flags) ? parsed.flags.slice(0, 6) : [];
    let score = Math.max(0, Math.min(1, Number(parsed.confidence ?? 0)));

    if (!parsed.shared) {
      flags.push("Evidence does not clearly show sharing context");
      score = Math.min(score, 0.4);
    }
    if (parsed.edited) {
      flags.push("Screenshot appears edited");
      score = Math.min(score, 0.3);
    }
    if (
      parsed.destination &&
      parsed.destination !== "unclear" &&
      parsed.destination !== shareType
    ) {
      flags.push(`Destination looks like a ${parsed.destination}, not the claimed ${shareType}`);
      score = Math.min(score, 0.45);
    }
    if (parsed.destination === "unclear") flags.push("Destination/group identity unclear");
    if (parsed.reason) flags.push(parsed.reason);

    const recommendation: AutomatedReview["recommendation"] =
      parsed.shared && score >= 0.85 && !parsed.edited
        ? "AUTO-APPROVE"
        : score <= 0.2
          ? "REJECT"
          : "HUMAN REVIEW";

    return { score, recommendation, flags };
  } catch {
    return { score: 0, recommendation: "HUMAN REVIEW", flags: ["Automated check failed"] };
  }
}
