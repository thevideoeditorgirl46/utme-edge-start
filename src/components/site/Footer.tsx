import { Link } from "@tanstack/react-router";

import { BRAND_ASSETS } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_ASSETS.logo}
                alt="Newton Edge Tutorial"
                width={48}
                height={48}
                loading="lazy"
                className="size-11 rounded-full ring-2 ring-gold/70"
              />
              <div>
                <p className="font-display text-base font-bold">NEWTON EDGE TUTORIAL</p>
                <p className="text-xs tracking-[0.2em] text-gold">BUILD THE FOUNDATION</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70">
              Foundational Class for UTME candidates — classes delivered via Telegram and WhatsApp.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <a href="/#why" className="text-primary-foreground/75 hover:text-gold">
              Why Foundational
            </a>
            <a href="/#pillars" className="text-primary-foreground/75 hover:text-gold">
              What you'll build
            </a>
            <a href="/#journey" className="text-primary-foreground/75 hover:text-gold">
              Learning journey
            </a>
            <a href="/#mocks" className="text-primary-foreground/75 hover:text-gold">
              Mock exams
            </a>
            <a href="/#stories" className="text-primary-foreground/75 hover:text-gold">
              Student results
            </a>
            <a href="/#faq" className="text-primary-foreground/75 hover:text-gold">
              FAQ
            </a>
            <Link to="/register" className="text-primary-foreground/75 hover:text-gold">
              Register
            </Link>
            <Link to="/auth" className="text-primary-foreground/75 hover:text-gold">
              Sign in
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Newton Edge Tutorial. All rights reserved.</p>
          <p>Registration is free. Terms &amp; conditions apply to scholarships.</p>
        </div>
      </div>
    </footer>
  );
}
