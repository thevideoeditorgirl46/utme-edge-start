import { createServerFn } from "@tanstack/react-start";

import { publicServerClient } from "./net.server";

export type SuccessStory = {
  id: string;
  student_name: string;
  utme_score: number;
  photo_url: string | null;
  result_image_url: string | null;
  excerpt: string;
  full_story: string;
  featured: boolean;
};

export type ClassLinks = {
  whatsapp_url: string | null;
  telegram_url: string | null;
  flyer_url: string | null;
};

export const getLandingContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicServerClient();

  const [stories, links] = await Promise.all([
    supabase
      .from("success_stories")
      .select(
        "id, student_name, utme_score, photo_url, result_image_url, excerpt, full_story, featured",
      )
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase.from("class_links").select("whatsapp_url, telegram_url, flyer_url").eq("id", 1).maybeSingle(),
  ]);

  return {
    stories: (stories.data ?? []) as SuccessStory[],
    links: (links.data ?? null) as ClassLinks | null,
  };
});
