import type { APIRoute } from "astro";
import { SITE } from "@/config/site";

const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Bytespider",
] as const;

const getRobotsTxt = (site: URL, sitemapURL: URL) => `
User-agent: *
Allow: /

${AI_USER_AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n")}

# AI and machine-readable discovery
LLMS: ${new URL("llms.txt", site).href}
AI-Policy: ${new URL("ai.txt", site).href}
RSS: ${new URL("rss.xml", site).href}
Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const siteURL = site ?? new URL(SITE.url);
  const sitemapURL = new URL("sitemap-index.xml", siteURL);
  return new Response(getRobotsTxt(siteURL, sitemapURL), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
