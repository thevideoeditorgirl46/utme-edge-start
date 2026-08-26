import { Link } from "@tanstack/react-router";

import { BRAND, BRAND_ASSETS } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label={BRAND.name}>
      <img
        src={BRAND_ASSETS.logo}
        alt={`${BRAND.name} logo`}
        width={44}
        height={44}
        className="size-10 rounded-full ring-2 ring-gold/70"
      />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-sm font-bold tracking-tight",
            variant === "light" ? "text-primary-foreground" : "text-foreground",
          )}
        >
          NEWTON EDGE
        </span>
        <span className="block text-[0.68rem] font-semibold tracking-[0.22em] text-gold-deep dark:text-gold">
          TUTORIAL
        </span>
      </span>
    </Link>
  );
}
