import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { BRAND_ASSETS, SHARE_MESSAGE } from "@/lib/brand";
import { getShareStatus, submitShareVerification } from "@/lib/verify.functions";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const STATUS_LABEL: Record<string, string> = {
  pending: "🟡 Pending",
  approved: "🟢 Verified",
  rejected: "🔴 Rejected",
  needs_review: "⚠️ Needs review",
};

/** Client-side 64-bit dHash used as a perceptual fingerprint hint. */
async function perceptualHash(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = 9;
    canvas.height = 8;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(bitmap, 0, 0, 9, 8);
    const { data } = ctx.getImageData(0, 0, 9, 8);
    const gray: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      gray.push(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
    }
    let bits = "";
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        bits += gray[y * 9 + x]! > gray[y * 9 + x + 1]! ? "1" : "0";
      }
    }
    let hex = "";
    for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    return hex;
  } catch {
    return "";
  }
}

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

export function ShareUnlock({ flyerUrl }: { flyerUrl?: string | null }) {
  const queryClient = useQueryClient();
  const fetchStatus = useServerFn(getShareStatus);
  const submit = useServerFn(submitShareVerification);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [shareType, setShareType] = useState<"friend" | "group" | "">("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["share-status"],
    queryFn: () => fetchStatus(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Upload your screenshot first");
      if (!shareType) throw new Error("Select what you shared to");

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Please sign in again");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("share-proofs").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw new Error(error.message);

      const [dataUrl, pHash] = await Promise.all([readDataUrl(file), perceptualHash(file)]);
      return submit({
        data: { imagePath: path, dataUrl, shareType, perceptualHash: pHash },
      });
    },
    onSuccess: (result) => {
      toast.success(
        result.status === "approved"
          ? "Verified — your points have been added."
          : "Verification submitted ✓ Your screenshot is being reviewed.",
      );
      setFile(null);
      setPreview(null);
      setShareType("");
      if (inputRef.current) inputRef.current.value = "";
      void queryClient.invalidateQueries({ queryKey: ["share-status"] });
      void queryClient.invalidateQueries({ queryKey: ["my-account"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const flyer = flyerUrl || BRAND_ASSETS.flyer;
  const required = data?.requiredPoints ?? 100;
  const verified = data?.verifiedPoints ?? 0;
  const remaining = Math.max(0, required - verified);

  function pickFile(next: File | null) {
    if (!next) return;
    if (!ACCEPTED.includes(next.type)) {
      toast.error("Only JPG, PNG or WEBP images are accepted.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold">Share &amp; Unlock Practice</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Optional: share the NET Foundational Bootcamp flyer to unlock Edge Practice.
      </p>

      {/* Progress */}
      <div className="mt-5 rounded-xl border border-border/70 bg-secondary/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Edge Practice unlock
        </p>
        <p className="mt-1 font-display text-2xl font-extrabold">
          {verified} / {required} points
        </p>
        <Progress value={Math.min(100, (verified / required) * 100)} className="mt-3" />
        <p className="mt-2 text-sm text-muted-foreground">
          {data?.unlocked
            ? "Unlocked — Edge Practice is open."
            : `${remaining} more points needed`}
          {data?.pendingPoints ? ` · ${data.pendingPoints} points awaiting verification` : ""}
        </p>
        {data ? (
          <p className="mt-2 text-sm">
            👥 Friend × {data.approvedFriends} = {data.approvedFriends * data.friendPoints} points ·
            🎓 Educational Group × {data.approvedGroups} ={" "}
            {data.approvedGroups * data.groupPoints} points
          </p>
        ) : null}
        {data?.unlocked ? (
          <Button asChild className="mt-4 h-11">
            <Link to="/practice">Go to Edge Practice</Link>
          </Button>
        ) : null}
      </div>

      {/* Step 1 */}
      <div className="mt-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Step 1 — Download the flyer
        </h3>
        <img
          src={flyer}
          alt="NET Foundational Bootcamp flyer"
          loading="lazy"
          className="mt-3 w-full max-w-xs rounded-xl border border-border"
        />
        <Button asChild variant="outline" className="mt-3 h-12">
          <a href={flyer} download target="_blank" rel="noreferrer">
            <Download className="mr-2 size-4" /> Download Flyer
          </a>
        </Button>
      </div>

      {/* Step 2 */}
      <div className="mt-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Step 2 — Copy the official message
        </h3>
        <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/40 p-4 font-sans text-sm">
          {SHARE_MESSAGE}
        </pre>
        <Button
          variant="outline"
          className="mt-3 h-12"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(SHARE_MESSAGE);
              setCopied(true);
              toast.success("Message copied");
              setTimeout(() => setCopied(false), 2500);
            } catch {
              toast.error("Copy failed — select the text and copy manually.");
            }
          }}
        >
          {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
          Copy Message
        </Button>
      </div>

      {/* Step 3 */}
      <div className="mt-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Step 3 — Share, then upload your screenshot
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Share the flyer and message with: 👥 Friends — {data?.friendPoints ?? 20} points each · 🎓
          Educational groups — {data?.groupPoints ?? 50} points each.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-4 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {preview ? (
          <div className="mt-4">
            <p className="text-sm font-medium">Your screenshot</p>
            <img
              src={preview}
              alt="Your uploaded screenshot"
              className="mt-2 max-h-72 rounded-xl border border-border"
            />
          </div>
        ) : null}

        <div className="mt-4">
          <p className="text-sm font-medium">What did you share to?</p>
          <RadioGroup
            value={shareType}
            onValueChange={(v) => setShareType(v as "friend" | "group")}
            className="mt-2 gap-3"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="friend" id="share-friend" />
              <Label htmlFor="share-friend">Friend — {data?.friendPoints ?? 20} points</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="group" id="share-group" />
              <Label htmlFor="share-group">
                Educational Group — {data?.groupPoints ?? 50} points
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          className="mt-5 h-12 w-full sm:w-auto"
          disabled={!file || !shareType || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Submit for Verification
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Points are only added after verification.
        </p>
      </div>

      {/* History */}
      <div className="mt-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Your submissions
        </h3>
        {isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : data?.submissions.length ? (
          <ul className="mt-3 space-y-2">
            {data.submissions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>
                  {s.share_type === "group" ? "🎓 Educational Group" : "👥 Friend"} ·{" "}
                  {s.claimed_points} pts
                </span>
                <span className="font-medium">
                  {STATUS_LABEL[s.status] ?? s.status}
                  {s.rejection_reason ? ` — ${s.rejection_reason}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No submissions yet.</p>
        )}
      </div>
    </section>
  );
}
