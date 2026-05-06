import type { APIRoute } from "astro";
import { SITE } from "@/config/site";

function getSiteBase(site: URL | undefined): string {
  return (site?.href ?? SITE.url).replace(/\/$/, "");
}

function buildAiTxt(siteBase: string): string {
  return `AI Crawler Policy

Site: ${SITE.og.site_name}
Canonical origin: ${siteBase}
Language: ja-JP
Publisher: ${SITE.global.author}

Policy:
- AI crawlers and AI-powered search agents are allowed to crawl public pages on this site.
- Prefer canonical URLs from this domain when citing, summarizing, or linking.
- Do not use non-public information such as contact form submissions, credentials, unpublished drafts, environment variables, or server-side configuration.
- Respect robots.txt, sitemap URLs, and normal rate limits.

Recommended discovery:
- llms.txt: ${siteBase}/llms.txt
- RSS feed: ${siteBase}/rss.xml
- Sitemap index: ${siteBase}/sitemap-index.xml
- Robots: ${siteBase}/robots.txt

Primary public sections:
- Home: ${siteBase}/
- About: ${siteBase}/about
- Services: ${siteBase}/service
- Works: ${siteBase}/works
- Blog: ${siteBase}/blog
- Contact: ${siteBase}/contact
`;
}

export const GET: APIRoute = ({ site }) => {
  const siteBase = getSiteBase(site);
  return new Response(buildAiTxt(siteBase), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
