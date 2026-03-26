import type { GetStaticPaths } from "astro";
import { z } from "zod";
import { BLOG_POST_API, headlessCmsUrl } from "./headlessCms";

/**
 * `fetch failed` / ECONNREFUSED などネットワーク失敗時に、SSG ビルド向けの対処ヒントを付与する
 */
function rethrowIfWordPressUnreachable(requestUrl: string, error: unknown): never {
  const msg = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause != null ? error.cause : undefined;
  const code =
    cause !== null &&
    typeof cause === "object" &&
    "code" in cause &&
    typeof (cause as { code?: unknown }).code === "string"
      ? (cause as { code: string }).code
      : "";
  const looksNetwork =
    error instanceof TypeError ||
    msg.includes("fetch failed") ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT";

  if (looksNetwork) {
    throw new Error(
      [
        `[Blog build] WordPress REST に接続できません。`,
        `  リクエスト: ${requestUrl}`,
        `  ベース URL: ${headlessCmsUrl}`,
        `  静的ビルド（astro build）では、ビルドを実行する環境から上記 URL に HTTP で到達できる必要があります。`,
        `  対処: Local / Docker で WordPress を起動する、または .env の PUBLIC_API_URL を到達可能な URL（本番の https://… など）に変更してからビルドする。`,
        `  Netlify では Environment Variables の PUBLIC_API_URL がビルド時に使われます。`,
        `  詳細: ${msg}${code !== "" ? ` [${code}]` : ""}`,
      ].join("\n"),
    );
  }
  throw error;
}

async function fetchOkOrThrow(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch (e) {
    rethrowIfWordPressUnreachable(url, e);
  }
}

/** getStaticPaths 用: 全文の blogPostSchema は厳しすぎて本番 WP の一部投稿で全落ち→404 になるため slug のみ検証 */
const wordPressPostSlugSchema = z.object({
  slug: z.string().min(1),
});

function parseSlugsFromWordPressPosts(raw: unknown[], apiName: string): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const result = wordPressPostSlugSchema.safeParse(raw[i]);
    if (result.success) {
      slugs.push(result.data.slug);
    } else {
      console.warn(`⚠️ [API Validation] ${apiName}: skipping post at index ${i} (no slug):`, result.error.format());
    }
  }
  return slugs;
}

/**
 * ビルド時用: WordPress `posts` を `per_page=100` で取得し、100 件超は `page` を進めて全件結合する。
 */
export async function fetchAllBlogPostsRawForBuild(): Promise<unknown[]> {
  const firstResponse = await fetchOkOrThrow(BLOG_POST_API);
  if (!firstResponse.ok) {
    throw new Error(`Failed to fetch blog posts: ${firstResponse.status} ${firstResponse.statusText}`);
  }

  const parsedTotal = parseInt(firstResponse.headers.get("x-wp-totalpages") ?? "1", 10);
  const totalPages = Number.isNaN(parsedTotal) || parsedTotal < 1 ? 1 : parsedTotal;

  const firstJson: unknown = await firstResponse.json();
  const all: unknown[] = [];
  if (Array.isArray(firstJson)) {
    for (const item of firstJson) {
      all.push(item);
    }
  }

  for (let page = 2; page <= totalPages; page++) {
    const url = `${BLOG_POST_API}&page=${page}`;
    const res = await fetchOkOrThrow(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch blog posts (page ${page}): ${res.status} ${res.statusText}`);
    }
    const pageJson: unknown = await res.json();
    if (Array.isArray(pageJson)) {
      for (const item of pageJson) {
        all.push(item);
      }
    }
  }

  return all;
}

/**
 * 全件取得 → slug 一覧。詳細ページの本文は `[slug].astro` 内の別 fetch で取得する。
 * API に件数があるのに slug が 0 件ならビルド失敗。
 */
export async function fetchBlogSlugsForStaticPaths(): Promise<string[]> {
  const raw: unknown[] = await fetchAllBlogPostsRawForBuild();
  const slugs = parseSlugsFromWordPressPosts(raw, "Blog Posts API (getStaticPaths)");

  if (raw.length > 0 && slugs.length === 0) {
    throw new Error(
      "Blog getStaticPaths: no posts contained a valid slug. Check WordPress REST response (posts collection).",
    );
  }

  return slugs;
}

/** スラッグ重複を除いた Astro `getStaticPaths` 用パラメータ配列 */
export function buildUniqueBlogSlugPaths(slugs: string[]): Array<{ params: { slug: string } }> {
  const seen = new Set<string>();
  const paths: Array<{ params: { slug: string } }> = [];
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    paths.push({ params: { slug } });
  }
  return paths;
}

/** `[slug].astro` 用: 型解決と no-unsafe-call 回避のためロジックを .ts に集約 */
export const getBlogSlugStaticPaths: GetStaticPaths = async () => {
  const slugs = await fetchBlogSlugsForStaticPaths();

  if (slugs.length === 0) {
    console.warn("No posts found for blog static paths.");
    return [];
  }

  const paths = buildUniqueBlogSlugPaths(slugs);

  console.log(`✅ [Blog Slug] Generated ${paths.length} paths:`, paths.map((p) => p.params.slug).join(", "));

  return paths;
};
