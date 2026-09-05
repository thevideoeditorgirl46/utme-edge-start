import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "net_install_cta_dismissed";

/**
 * Call-to-action inviting students to install the app to their home screen.
 * Renders nothing when the app is already installed or the student dismissed it.
 */
export function InstallAppCTA({ variant = "banner" }: { variant?: "banner" | "compact" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    setIsIOS(ios);
    setHidden(standalone || dismissed);

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setHidden(true);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canPrompt = Boolean(deferredPrompt);
  if (hidden || (!canPrompt && !isIOS)) return null;

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    setShowIOSHelp((p) => !p);
  }

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  }

  if (variant === "compact") {
    return (
      <Button size="sm" variant="outline" onClick={handleInstall} className="gap-1.5 text-xs">
        <Download className="size-3.5" /> Get the App
      </Button>
    );
  }

  return (
    <div className="relative rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
      <button
        type="button"
        aria-label="Dismiss install prompt"
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <h3 className="font-display text-base font-bold text-foreground">Download the App</h3>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        Install Newton Edge on your phone for one-tap access to your dashboard, class links and Edge
        Practice — no app store needed.
      </p>

      <Button onClick={handleInstall} size="sm" className="mt-3 gap-2">
        <Download className="size-4" />
        {canPrompt ? "Install App" : "How to install"}
      </Button>

      {showIOSHelp && !canPrompt ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Share className="mt-0.5 size-3.5 shrink-0" />
          On iPhone: tap the Share button in Safari, then choose “Add to Home Screen”.
        </p>
      ) : null}
    </div>
  );
}
