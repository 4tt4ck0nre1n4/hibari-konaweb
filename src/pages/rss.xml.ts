import type { APIRoute } from "astro";
import { BLOG_PAGE_API, buildSkipWordPress } from "@/api/headlessCms";
import { SITE } from "@/config/site";
import { stripHtml } from "@/util/jsonLd";

interface FeedPost {
  title: string;
  slug: string;
  description: string;
  date: string;
  modified?: string;
}

const WORDPRESS_TOTAL_PAGES_HEADER = "x-wp-totalpages";
const RSS_MAX_WORDPRESS_PAGES = 20;

function getSiteBase(site: URL | undefined): string {
  return (site?.href ?? SITE.url).replace(/\/$/, "");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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

function toRssDate(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? new Date().toUTCString() : new Date(timestamp).toUTCString();
}

function getFeedPostDateSource(post: FeedPost): string {
  if (typeof post.modified === "string" && post.modified !== "") {
    return post.modified;
  }
  if (post.date !== "") {
    return post.date;
  }
  return new Date().toISOString();
}

function getFeedPostTimestamp(post: FeedPost): number {
  const timestamp = Date.parse(getFeedPostDateSource(post));
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function buildFeedPageUrl(page: number): string {
  const url = new URL(BLOG_PAGE_API);
  url.searchParams.set("page", String(page));
  return url.href;
}

function parseTotalPages(response: Response): number {
  const raw = response.headers.get(WORDPRESS_TOTAL_PAGES_HEADER);
  if (raw === null) {
    return 1;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, RSS_MAX_WORDPRESS_PAGES);
}

function parseFeedPosts(value: unknown): FeedPost[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): FeedPost | undefined => {
      const record = getRecord(item);
      if (record === undefined) {
        return undefined;
      }

      const slug = getString(record.slug);
      const title = getRenderedText(record.title);
      if (slug === "" || title === "") {
        return undefined;
      }

      const acfDescription = getAcfDescription(record);
      const excerpt = getRenderedText(record.excerpt);
      const description = acfDescription !== "" ? acfDescription : excerpt;
      const date = getString(record.date);
      const modified = getString(record.modified);

      return {
        title,
        slug,
        description,
        date,
        modified: modified !== "" ? modified : undefined,
      };
    })
    .filter((post): post is FeedPost => post !== undefined);
}

async function fetchFeedPosts(): Promise<FeedPost[]> {
  try {
    const firstResponse = await fetch(buildFeedPageUrl(1));
    if (!firstResponse.ok) {
      if (buildSkipWordPress) {
        return [];
      }
      throw new Error(`Failed to fetch RSS posts: ${firstResponse.status} ${firstResponse.statusText}`);
    }

    const firstJson: unknown = await firstResponse.json();
    const posts = parseFeedPosts(firstJson);
    const totalPages = parseTotalPages(firstResponse);

    for (let page = 2; page <= totalPages; page++) {
      const response = await fetch(buildFeedPageUrl(page));
      if (!response.ok) {
        if (buildSkipWordPress) {
          break;
        }
        throw new Error(`Failed to fetch RSS posts page ${page}: ${response.status} ${response.statusText}`);
      }

      const json: unknown = await response.json();
      posts.push(...parseFeedPosts(json));
    }

    return posts;
  } catch (error) {
    if (buildSkipWordPress) {
      return [];
    }
    throw error;
  }
}

function buildRssXml(siteBase: string, posts: FeedPost[]): string {
  const feedUrl = `${siteBase}/rss.xml`;
  const blogUrl = `${siteBase}/blog`;
  const sortedPosts = [...posts].sort((a, b) => getFeedPostTimestamp(b) - getFeedPostTimestamp(a));
  const latestDate = sortedPosts[0] !== undefined ? getFeedPostDateSource(sortedPosts[0]) : new Date().toISOString();

  const items = sortedPosts
    .map((post) => {
      const postUrl = `${siteBase}/blog/${encodeURIComponent(post.slug)}`;
      const description = post.description !== "" ? post.description : SITE.blog.description;
      const pubDate = toRssDate(getFeedPostDateSource(post));

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${escapeXml(pubDate)}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.blog.title)}</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>${escapeXml(SITE.blog.description)}</description>
    <language>ja-JP</language>
    <lastBuildDate>${escapeXml(toRssDate(latestDate))}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export const GET: APIRoute = async ({ site }) => {
  const siteBase = getSiteBase(site);
  const posts = await fetchFeedPosts();

  return new Response(buildRssXml(siteBase, posts), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
