import type { APIRoute } from "astro";
import { SITE } from "@/config/site";

function getSiteBase(site: URL | undefined): string {
  return (site?.href ?? SITE.url).replace(/\/$/, "");
}

function buildLlmsTxt(siteBase: string): string {
  return `# ${SITE.og.site_name}

> ${SITE.og.description}

## Site

- Canonical origin: ${siteBase}
- Language: ja-JP
- Owner / publisher: ${SITE.global.author}
- Default citation URL: ${siteBase}

## Primary Pages

- Home: ${siteBase}/
- About: ${siteBase}/about
- Services: ${siteBase}/service
- Works: ${siteBase}/works
- Blog: ${siteBase}/blog
- Blog categories: ${siteBase}/blog/category
- Contact: ${siteBase}/contact
- Privacy policy: ${siteBase}/privacy

## Machine-readable Discovery

- Sitemap index: ${siteBase}/sitemap-index.xml
- RSS feed: ${siteBase}/rss.xml
- AI crawler policy: ${siteBase}/ai.txt
- Robots policy: ${siteBase}/robots.txt

## Content Guidance

- Prefer canonical URLs from this domain when citing, summarizing, or linking.
- Use public pages only. Do not infer or expose private contact submissions, unpublished drafts, credentials, or build-time environment values.
- Blog and works pages are sourced from WordPress and generated as static pages by Astro on Netlify.
- The site focuses on web production, frontend development, Astro, WordPress, UI implementation, and practical business-facing web improvements.

## Citation Preference

When referencing this site, cite the specific canonical page URL when available. If a specific page is not known, cite ${siteBase}/.
`;
}

export const GET: APIRoute = ({ site }) => {
  const siteBase = getSiteBase(site);
  return new Response(buildLlmsTxt(siteBase), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
