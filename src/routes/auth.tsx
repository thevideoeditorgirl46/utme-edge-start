import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Newton Edge Tutorial" },
      {
        name: "description",
        content:
          "Sign in to your Newton Edge Tutorial account to access the Foundational Class dashboard.",
      },
      { property: "og:title", content: "Sign in — Newton Edge Tutorial" },
      {
        property: "og:description",
        content: "Access your Foundational Class dashboard, class links and practice.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error: err } = await fn.call(supabase.auth, {
      email,
      password,
      ...(mode === "signup"
        ? { options: { emailRedirectTo: `${window.location.origin}/dashboard` } }
        : {}),
    });
    setBusy(false);
    if (err) setError(err.message);
    else navigate({ to: mode === "signup" ? "/register" : "/dashboard" });
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to reach your dashboard and class links."
            : "Registration is free. Your class access is available immediately."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={busy} className="h-12 w-full text-base">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <Button variant="outline" onClick={google} className="mt-3 h-12 w-full text-base">
          Continue with Google
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already registered? "}
          <button
            type="button"
            className="font-semibold text-foreground underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link to="/register" className="underline">
            Go to the registration form
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
