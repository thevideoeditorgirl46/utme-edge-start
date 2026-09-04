# Newton Edge Tutorial — Foundational Class Platform

A mobile-first campaign website plus registration, student dashboard, practice reward and admin console for the Foundational Class (UTME candidates). Navy + gold identity taken from the Newton Edge logo; the flyer is used as a campaign anchor inside the page composition (no "see the flyer" button).

## Brand and design system

- Navy (deep academic blue) as the dominant surface/text colour, gold strictly as accent (rules, numbers, achievement, small highlights), warm off-white background.
- Condensed/geometric display face for headlines (matching the flyer's tall condensed lettering), a clean grotesk for body.
- Editorial layout: strong type hierarchy, generous whitespace, thin gold rules instead of heavy cards, restrained shadows, subtle reveal-on-scroll and count-up for scores only.
- Logo uploaded is used in nav, footer, dashboard header, and as the favicon.

## Pages

**Landing (`/`)** — minimal nav (Home, Foundational Class, Student Results, How It Works, FAQ + Register CTA; hamburger sheet on mobile) and these sections in order:

1. Hero — art-directed image of a focused Nigerian UTME candidate with calculator/worked calculations; "FOUNDATIONAL CLASS / FOR UTME CANDIDATES", headline "Build the foundation. Get the edge.", two CTAs.
2. Why Foundational? — concise gap copy, the real flyer presented as an editorial asset (original proportions, click to enlarge in a lightbox), and the progression Foundation → Understanding → Application → Speed → JAMB.
3. What you'll build — the five numbered pillars, editorial list style, one line each.
4. Learning journey — six-step vertical progression on mobile, staggered rail on desktop.
5. Mock exams — purpose only, no invented count.
6. Scholarship — "Perform. Stand out. Move forward.", Premium Class Scholarship for top mock performers, "Terms & conditions apply."
7. Real students. Real results. — Jonathan Faith Onome (314) as the featured story, Onabanjo Toluwanimi (318) and Kolawole Samuel (309) as supporting. Each shows photo, name, score count-up, a short verbatim excerpt, "View result" (lightbox on the supplied result image) and "Read full story" (full testimonial modal, kept word-for-word). The 314 testimonial is attributed to Jonathan Faith Onome. Result images are cropped/redacted to hide JAMB registration numbers before publishing.
8. How it works — 4 steps, explicitly automated, no approval step.
9. FAQ — accordion, only the listed topics.
10. Final CTA + footer (logo, brand line, nav, contact/social only once supplied).

**Register (`/register`)** — 4-step form with progress indicator, exactly the locked questions in the four given sections, per-step validation, back/next, clear errors. Duplicate email/WhatsApp blocked. Creates the account and profile in one submit.

**Success (`/register/success`)** — Registration ID, "class access is now available", CTA to dashboard.

**Dashboard (`/dashboard`, auth-required)** — welcome, Foundational Class status card (Registration: Confirmed / Class Access: Available), WhatsApp + Telegram join buttons available immediately, then the optional "Share & Unlock" block (download flyer → share → submit proof → practice access) with live submission status.

**Edge Practice (`/practice`, auth-required, unlocked by verified share)** — one question at a time, Question X of Y, A–D, submit, correct/incorrect + short explanation, next. Sample questions only until you supply real ones.

**Admin (`/admin`, admin role only)** — registrations table with all listed fields and CSV export, student management, class links + flyer management, share submissions with verification status and override, practice sets/questions editor, success-story content (photos, testimonials, result images with a crop/redact step before publishing).

## Accounts and access

- Email/password plus Google sign-in. Registration creates the account automatically — no pending-approval state anywhere.
- Students see only their own data; admin access is granted through a separate role table, never a flag on the profile.

## Share verification

Screenshot upload runs an automated check (flyer likeness + share-context/OCR signals). Confident pass unlocks practice instantly; anything unclear shows "Verification in progress" and lands in the admin queue. Class links are never gated on this.

## Content rules honoured

No ₦20,000 prize, no midterm assessment, no invented mock count, scholarship rules, dates, pricing, contacts, handles or testimonials. Missing information appears as an explicit placeholder.

## Technical notes

- TanStack Start routes; public pages SSR with per-route SEO metadata; `/dashboard`, `/practice`, `/admin` under the authenticated layout.
- Lovable Cloud backend. Tables: `profiles`, `registrations`, `class_links`, `success_stories`, `sharing_submissions`, `reward_unlocks`, `practice_sets`, `practice_questions`, `practice_attempts`, `user_roles`, with row-level security scoping students to their own rows and admin-only writes on content tables.
- Storage buckets: private `share-proofs`, public `site-assets` (flyer, story photos, redacted result images).
- Registration, duplicate checks, ID generation, share verification and admin reads run in server functions, not the browser.
- Performance: responsive/lazy images, no heavy animation libraries beyond light scroll reveals, images sized for low-end Android.

## Supplied content now in hand

- Testimonials for all three students, used verbatim (excerpt on the landing page, full text in the modal).
- Result images: Toluwanimi 318, Jonathan Faith Onome 314, Kolawole Samuel 309 — each redacted before use.
- Photos: the lady with purple braids is Jonathan Faith Onome. The two male photos are used for Kolawole Samuel and Onabanjo Toluwanimi — tell me which is which and I'll assign them; otherwise I'll leave both slots swappable from the admin story editor so you can correct in one click.

## Open items (blocking only the sections that need them)

- WhatsApp / Telegram class links — admin-editable fields with placeholders until you provide them.
- Real practice questions and any contact/social details.
