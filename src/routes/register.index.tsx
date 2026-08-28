import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { submitRegistration } from "@/lib/account.functions";
import {
  CHALLENGE_OPTIONS,
  REFERRAL_OPTIONS,
  SUBJECT_OPTIONS,
  UTME_YEAR_OPTIONS,
} from "@/lib/brand";

export const Route = createFileRoute("/register/")({
  head: () => ({
    meta: [
      { title: "Register free — Foundational Class | Newton Edge Tutorial" },
      {
        name: "description",
        content:
          "Register free for the Newton Edge Tutorial Foundational Class for UTME candidates. Four quick steps, instant class access.",
      },
      { property: "og:title", content: "Register free — Foundational Class" },
      {
        property: "og:description",
        content: "Four quick steps and your Foundational Class access is available immediately.",
      },
    ],
  }),
  component: RegisterPage,
});

const STEPS = ["About you", "Your UTME journey", "Your goals", "How you found us"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const submit = useServerFn(submitRegistration);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsapp] = useState("");
  const [telegramUsername, setTelegram] = useState("");
  const [utmeYear, setUtmeYear] = useState("");
  const [writtenBefore, setWrittenBefore] = useState(false);
  const [previousScore, setPreviousScore] = useState("");
  const [challengeAreas, setChallenges] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [improvementGoal, setGoal] = useState("");
  const [referralSource, setReferral] = useState("");

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  function validateStep() {
    if (step === 0) {
      if (!fullName.trim()) return "Please enter your full name.";
      if (!whatsappNumber.trim()) return "Please enter your WhatsApp number.";
      if (!user) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
          return "Please enter a valid email address.";
        if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase())
          return "Your email addresses don't match. Please re-check them.";
        if (password.length < 6) return "Password must be at least 6 characters.";
      }
    }
    if (step === 1 && !utmeYear) return "Please choose the year you're writing UTME.";
    if (step === 2 && subjects.length === 0) return "Please select at least one subject.";
    if (step === 3 && !referralSource) return "Please tell us how you found us.";
    return null;
  }

  function next() {
    const problem = validateStep();
    if (problem) return setError(problem);
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function finish() {
    const problem = validateStep();
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      if (!user) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (signUpError) throw new Error(signUpError.message);
      }
      const result = await submit({
        data: {
          fullName,
          whatsappNumber,
          telegramUsername,
          utmeYear,
          writtenBefore,
          previousScore: previousScore ? Number(previousScore) : null,
          challengeAreas,
          subjects,
          improvementGoal,
          referralSource,
        },
      });
      navigate({ to: "/register/success", search: { id: result.registrationId ?? "" } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Register for the Foundational Class
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Free registration. Four short steps — access is granted instantly.
        </p>

        <div className="mt-6 flex gap-2" aria-hidden>
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-gold" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>

        <div className="mt-8 space-y-5">
          {step === 0 ? (
            <>
              <Field label="Full name" id="fullName">
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
              {!loading && !user ? (
                <>
                  <Field label="Email" id="email">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field label="Create a password" id="password">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                </>
              ) : null}
              <Field label="WhatsApp number" id="whatsapp">
                <Input
                  id="whatsapp"
                  inputMode="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </Field>
              <Field label="Telegram username (optional)" id="telegram">
                <Input
                  id="telegram"
                  value={telegramUsername}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <fieldset>
                <legend className="text-sm font-medium">Which year are you writing UTME?</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {UTME_YEAR_OPTIONS.map((year) => (
                    <Chip
                      key={year}
                      active={utmeYear === year}
                      onClick={() => setUtmeYear(year)}
                      label={year}
                    />
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={writtenBefore}
                  onCheckedChange={(v) => setWrittenBefore(v === true)}
                />
                I have written UTME before
              </label>
              {writtenBefore ? (
                <Field label="Previous score" id="score">
                  <Input
                    id="score"
                    inputMode="numeric"
                    value={previousScore}
                    onChange={(e) => setPreviousScore(e.target.value)}
                  />
                </Field>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <fieldset>
                <legend className="text-sm font-medium">Your UTME subjects</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map((s) => (
                    <Chip
                      key={s}
                      active={subjects.includes(s)}
                      onClick={() => setSubjects(toggle(subjects, s))}
                      label={s}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium">Where do you struggle most?</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CHALLENGE_OPTIONS.map((c) => (
                    <Chip
                      key={c}
                      active={challengeAreas.includes(c)}
                      onClick={() => setChallenges(toggle(challengeAreas, c))}
                      label={c}
                    />
                  ))}
                </div>
              </fieldset>
              <Field label="What would you like to improve most? (optional)" id="goal">
                <Textarea id="goal" value={improvementGoal} onChange={(e) => setGoal(e.target.value)} />
              </Field>
            </>
          ) : null}

          {step === 3 ? (
            <fieldset>
              <legend className="text-sm font-medium">How did you hear about us?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {REFERRAL_OPTIONS.map((r) => (
                  <Chip
                    key={r}
                    active={referralSource === r}
                    onClick={() => setReferral(r)}
                    label={r}
                  />
                ))}
              </div>
            </fieldset>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            {step > 0 ? (
              <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <Button className="h-12 flex-1 text-base" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button className="h-12 flex-1 text-base" disabled={busy} onClick={finish}>
                {busy ? "Submitting…" : "Complete registration"}
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-gold bg-gold/15 font-semibold text-foreground"
          : "border-border text-muted-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}
