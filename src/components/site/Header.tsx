import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const SECTIONS = [
  { href: "/#why", label: "Why Foundational" },
  { href: "/#pillars", label: "Pillars" },
  { href: "/#journey", label: "Journey" },
  { href: "/#mocks", label: "Mock Exams" },
  { href: "/#stories", label: "Success Stories" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
              <Link to="/practice">Edge Practice</Link>
            </Button>
          ) : null}

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={user ? "/dashboard" : "/register"}>
              {user ? "My Dashboard" : "Register Free"}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-xs">
              <div className="mt-8 flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {s.label}
                  </a>
                ))}
                <Link
                  to={user ? "/dashboard" : "/auth"}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {user ? "My Dashboard" : "Sign in"}
                </Link>
                <Button asChild className="mt-4 h-12 text-base">
                  <Link to="/register" onClick={() => setOpen(false)}>
                    Register Free
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
