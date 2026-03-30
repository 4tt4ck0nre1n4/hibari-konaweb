import type { GetStaticPaths } from "astro";
import { buildSkipWordPress, headlessCmsApiPrefix, headlessCmsUrl } from "./headlessCms";
import { rethrowIfWordPressUnreachable } from "./blogPostsBuild";
import { worksSchema, type Works } from "../schemas/api.schema";

const WORKS_LIST_BUILD_QUERY = "works?context=embed&acf_format=standard&per_page=100";

function worksListUrl(page: number): string {
  const base = `${headlessCmsUrl}${headlessCmsApiPrefix}${WORKS_LIST_BUILD_QUERY}`;
  if (page <= 1) {
    return base;
  }
  return `${base}&page=${page}`;
}

/**
 * ビルド用 fetch。リトライ付き。`buildSkipWordPress` 時は失敗で `null`。
 */
async function fetchResponseForWorksBuild(url: string): Promise<Response | null> {
  const retries = 3;
  const delayMs = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (response.status >= 500 && i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      return response;
    } catch (e) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      if (buildSkipWordPress) {
        return null;
      }
      rethrowIfWordPressUnreachable(url, e);
    }
  }
  if (buildSkipWordPress) {
    return null;
  }
  throw new Error(`Works build: max retries reached for ${url}`);
}

/**
 * WordPress `works` を全件取得（100 件超は `page` を進める）。
 */
export async function fetchAllWorksForBuild(): Promise<Works[]> {
  const firstResponse = await fetchResponseForWorksBuild(worksListUrl(1));
  if (firstResponse === null) {
    return [];
  }
  if (!firstResponse.ok) {
    if (buildSkipWordPress) {
      return [];
    }
    throw new Error(`Failed to fetch works: ${firstResponse.status} ${firstResponse.statusText}`);
  }

  const parsedTotal = parseInt(firstResponse.headers.get("x-wp-totalpages") ?? "1", 10);
  const totalPages = Number.isNaN(parsedTotal) || parsedTotal < 1 ? 1 : parsedTotal;

  const firstJson: unknown = await firstResponse.json();
  const raw: unknown[] = [];
  if (Array.isArray(firstJson)) {
    for (const item of firstJson) {
      raw.push(item);
    }
  }

  for (let page = 2; page <= totalPages; page++) {
    const url = worksListUrl(page);
    const res = await fetchResponseForWorksBuild(url);
    if (res === null) {
      break;
    }
    if (!res.ok) {
      if (buildSkipWordPress) {
        break;
      }
      throw new Error(`Failed to fetch works (page ${page}): ${res.status} ${res.statusText}`);
    }
    const pageJson: unknown = await res.json();
    if (Array.isArray(pageJson)) {
      for (const item of pageJson) {
        raw.push(item);
      }
    }
  }

  const out: Works[] = [];
  for (let i = 0; i < raw.length; i++) {
    const result = worksSchema.safeParse(raw[i]);
    if (result.success) {
      out.push(result.data);
    } else if (import.meta.env.DEV) {
      console.warn(`⚠️ [Works build] skipped invalid item at index ${i}`);
    }
  }

  return out;
}

export const getWorksSlugStaticPaths: GetStaticPaths = async () => {
  const dataWorks = await fetchAllWorksForBuild();

  if (dataWorks.length === 0) {
    if (import.meta.env.DEV) {
      console.warn("⚠️ [Works build] No works for static paths.");
    }
    return [];
  }

  const paths = dataWorks.map((work) => ({
    params: { slug: work.slug },
    props: { work },
  }));

  if (import.meta.env.DEV) {
    console.log(`✅ [Works build] Generated ${paths.length} work detail paths`);
  }

  return paths;
};
