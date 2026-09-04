import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, CheckCircle2, Clock, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VerifyNETAccessResult } from "@/lib/edge-practice.functions";
import { verifyNETAccess } from "@/lib/edge-practice.functions";

interface AccessGateProps {
  initialStatus?: VerifyNETAccessResult | null;
  onAccessGranted: () => void;
}

export function AccessGate({ initialStatus, onAccessGranted }: AccessGateProps) {
  const verify = useServerFn(verifyNETAccess);
  const [netIdInput, setNetIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<VerifyNETAccessResult | null>(
    initialStatus ?? null,
  );

  async function handleVerify(idToVerify?: string) {
    setLoading(true);
    try {
      const res = await verify({
        data: { netId: idToVerify ?? (netIdInput.trim() || undefined) },
      });
      setStatusResult(res);
      if (res.status === "APPROVED") {
        toast.success(res.message);
        onAccessGranted();
      }
    } catch {
      setStatusResult({
        status: "ERROR",
        message: "We couldn't verify your access. Please check your connection and try again.",
        verifiedPoints: 0,
        requiredPoints: 100,
        pendingPoints: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  const status = statusResult?.status ?? "DENIED";

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Edge Practice Access</h2>
            <p className="text-xs text-muted-foreground">Newton Edge Foundational Class</p>
          </div>
        </div>

        {status === "APPROVED" ? (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Access Approved</p>
                <p className="mt-1 text-xs">{statusResult?.message}</p>
                <Button
                  onClick={onAccessGranted}
                  className="mt-3 h-10 w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Start Practicing
                </Button>
              </div>
            </div>
          </div>
        ) : status === "PENDING" ? (
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Verification in Progress</p>
                <p className="mt-1 text-xs leading-relaxed">{statusResult?.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleVerify()}
                    className="h-9 gap-1.5"
                  >
                    {loading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    Check Again
                  </Button>
                  <Button asChild size="sm" variant="secondary" className="h-9">
                    <Link to="/dashboard">View Dashboard</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-semibold text-sm text-foreground">Edge Practice is Locked</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {statusResult?.message ||
                    "Edge Practice is unlocked by verified flyer shares in the Foundational Class (100 points needed)."}
                </p>
                <Button asChild className="mt-4 h-10 w-full text-sm">
                  <Link to="/dashboard">Go to Share &amp; Unlock</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enter NET ID manual verification / lookup */}
        <div className="mt-8 border-t border-border pt-6">
          <Label
            htmlFor="net-id"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Or verify using your NET ID
          </Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="net-id"
              placeholder="e.g. NET-GWQ2JM"
              value={netIdInput}
              onChange={(e) => setNetIdInput(e.target.value.toUpperCase())}
              className="font-mono text-sm tracking-wide uppercase"
              disabled={loading}
            />
            <Button
              type="button"
              variant="outline"
              disabled={loading || !netIdInput.trim()}
              onClick={() => handleVerify()}
              className="shrink-0"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            You can find your Registration ID on your Foundational Class dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
