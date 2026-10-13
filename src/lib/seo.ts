/** Shared SEO head builder: title, description, robots, Open Graph, Twitter and canonical. */
export const SITE_URL = "https://utme-edge-start.lovable.app";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function pageHead(opts: {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "robots", content: opts.noindex ? "noindex, nofollow" : "index, follow" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "Newton Edge Tutorial" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
