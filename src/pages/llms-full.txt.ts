import type { APIRoute } from "astro";
import { BLOG_PAGE_API, buildSkipWordPress } from "@/api/headlessCms";
import { SITE } from "@/config/site";
import { stripHtml } from "@/util/jsonLd";

interface FullPost {
  title: string;
  slug: string;
  description: string;
  date: string;
  categories: string[];
}

const WORDPRESS_TOTAL_PAGES_HEADER = "x-wp-totalpages";
const LLMS_MAX_WORDPRESS_PAGES = 20;

function getSiteBase(site: URL | undefined): string {
  return (site?.href ?? SITE.url).replace(/\/$/, "");
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function getRenderedText(value: unknown): string {
  const record = getRecord(value);
  return stripHtml(record?.rendered);
}

function getAcfDescription(value: unknown): string {
  const record = getRecord(value);
  const acf = getRecord(record?.acf);
  return stripHtml(acf?.description);
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getCategories(value: unknown): string[] {
  const record = getRecord(value);
  const embedded = getRecord(record?._embedded);
  const terms = embedded?.["wp:term"];
  if (!Array.isArray(terms) || terms.length === 0) return [];
  const taxTerms: unknown = terms[0];
  if (!Array.isArray(taxTerms)) return [];
  return taxTerms.map((term) => getString(getRecord(term)?.name)).filter((name) => name !== "");
}

function buildFeedPageUrl(page: number): string {
  const url = new URL(BLOG_PAGE_API);
  url.searchParams.set("page", String(page));
  return url.href;
}

function parseTotalPages(response: Response): number {
  const raw = response.headers.get(WORDPRESS_TOTAL_PAGES_HEADER);
  if (raw === null) return 1;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, LLMS_MAX_WORDPRESS_PAGES);
}

function parseFullPosts(value: unknown): FullPost[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): FullPost | undefined => {
      const record = getRecord(item);
      if (record === undefined) return undefined;

      const slug = getString(record.slug);
      const title = getRenderedText(record.title);
      if (slug === "" || title === "") return undefined;

      const acfDescription = getAcfDescription(record);
      const excerpt = getRenderedText(record.excerpt);
      const description = acfDescription !== "" ? acfDescription : excerpt;
      const date = getString(record.date);
      const categories = getCategories(record);

      return { title, slug, description, date, categories };
    })
    .filter((post): post is FullPost => post !== undefined);
}

async function fetchFullPosts(): Promise<FullPost[]> {
  try {
    const firstResponse = await fetch(buildFeedPageUrl(1));
    if (!firstResponse.ok) {
      if (buildSkipWordPress) return [];
      throw new Error(`Failed to fetch posts: ${firstResponse.status} ${firstResponse.statusText}`);
    }

    const firstJson: unknown = await firstResponse.json();
    const posts = parseFullPosts(firstJson);
    const totalPages = parseTotalPages(firstResponse);

    for (let page = 2; page <= totalPages; page++) {
      const response = await fetch(buildFeedPageUrl(page));
      if (!response.ok) {
        if (buildSkipWordPress) break;
        throw new Error(`Failed to fetch posts page ${page}: ${response.status} ${response.statusText}`);
      }
      const json: unknown = await response.json();
      posts.push(...parseFullPosts(json));
    }

    return posts;
  } catch (error) {
    if (buildSkipWordPress) return [];
    throw error;
  }
}

function toDateString(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? "" : new Date(timestamp).toISOString().slice(0, 10);
}

function buildLlmsFullTxt(siteBase: string, posts: FullPost[]): string {
  const sortedPosts = [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const articleLines = sortedPosts.map((post) => {
    const url = `${siteBase}/blog/${encodeURIComponent(post.slug)}`;
    const date = toDateString(post.date);
    const cats = post.categories.length > 0 ? ` [${post.categories.join(", ")}]` : "";
    const desc = post.description !== "" ? `\n  ${post.description}` : "";
    return `- [${post.title}](${url})${cats} (${date})${desc}`;
  });

  return `# ${SITE.og.site_name} — Full Article Index

> ${SITE.og.description}
> This file lists all published blog articles for AI and machine-readable discovery.
> このファイルはすべての公開ブログ記事を一覧します。AI・機械読み取りによる記事発見を目的としています。

- Canonical origin: ${siteBase}
- Language: ja-JP
- Full index URL: ${siteBase}/llms-full.txt
- Summary index: ${siteBase}/llms.txt
- Last generated: ${new Date().toISOString().slice(0, 10)}
- Total articles: ${String(sortedPosts.length)}

## Blog Articles

${articleLines.join("\n\n")}

## Discovery

- Sitemap: ${siteBase}/sitemap-index.xml
- RSS: ${siteBase}/rss.xml
- Summary (llms.txt): ${siteBase}/llms.txt
- AI Policy: ${siteBase}/ai.txt
`;
}

export const GET: APIRoute = async ({ site }) => {
  const siteBase = getSiteBase(site);
  const posts = await fetchFullPosts();

  return new Response(buildLlmsFullTxt(siteBase, posts), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
