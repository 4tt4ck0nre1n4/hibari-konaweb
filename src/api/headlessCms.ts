import { validateEnv } from "../schemas/env.schema";

/**
 * Vite は `.env` に無い `PUBLIC_*` を `import.meta.env` に載せないことがある。
 * `PUBLIC_BUILD_SKIP_WORDPRESS` は CI / シェルでだけ渡す場合もあるため `process.env` を優先マージする。
 */
function mergeImportMetaWithProcessEnv(): Record<string, unknown> {
  const raw = { ...(import.meta.env as unknown as Record<string, unknown>) };
  if (typeof process !== "undefined" && process.env.PUBLIC_BUILD_SKIP_WORDPRESS !== undefined) {
    raw.PUBLIC_BUILD_SKIP_WORDPRESS = process.env.PUBLIC_BUILD_SKIP_WORDPRESS;
  }
  return raw;
}

// 環境変数を検証（Zodスキーマによる型安全な検証）
const env = validateEnv(mergeImportMetaWithProcessEnv());

export const headlessCmsUrl = env.PUBLIC_API_URL;
export const headlessCmsApiPrefix = env.PUBLIC_API_PREFIX;

/** `true` のとき、ブログ静的パス生成で WP 取得失敗してもビルドを止めない */
export const buildSkipWordPress = env.PUBLIC_BUILD_SKIP_WORDPRESS;

if (buildSkipWordPress && import.meta.env.DEV) {
  console.warn(
    "⚠️ [API Config] PUBLIC_BUILD_SKIP_WORDPRESS is enabled: if WordPress is unreachable, blog post routes may be skipped during `astro build` (empty paths). Do not set this on production Netlify.",
  );
}

// ビルド時に環境変数をログ出力（開発環境のみ）
if (env.DEV) {
  console.log("🔧 [API Config] WordPress API URL:", headlessCmsUrl);
  console.log("🔧 [API Config] API Prefix:", headlessCmsApiPrefix);
}

export const worksPageApi = "works?context=embed&acf_format=standard&per_page=20";
export const worksSlugApi = "works?context=embed&acf_format=standard&slug=";
export const worksPathApi = "works?context=embed&acf_format=standard";
export const WORKS_PAGE_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksPageApi}`;
export const WORKS_SLUG_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksSlugApi}`;
export const WORKS_PATH_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksPathApi}`;

// Contact Form 7環境変数（Zodスキーマで検証済み）
let wpcf7ApiPrefix: string = env.PUBLIC_WPCF7_API_PREFIX;
let wpcf7ApiId: string = env.PUBLIC_WPCF7_API_ID;

// 環境変数の値に不要な接頭辞や接尾辞が含まれていないかチェック
if (wpcf7ApiPrefix.startsWith("/wp-json/")) {
  console.warn("⚠️ [API Config] PUBLIC_WPCF7_API_PREFIX should not start with '/wp-json/'. Removing it.");
  wpcf7ApiPrefix = wpcf7ApiPrefix.replace(/^\/wp-json\//, "");
}
if (wpcf7ApiPrefix.startsWith("/")) {
  console.warn("⚠️ [API Config] PUBLIC_WPCF7_API_PREFIX should not start with '/'. Removing it.");
  wpcf7ApiPrefix = wpcf7ApiPrefix.replace(/^\//, "");
}
if (!wpcf7ApiPrefix.endsWith("/")) {
  wpcf7ApiPrefix = `${wpcf7ApiPrefix}/`;
}

// wpcf7ApiIdから不要な接尾辞を削除
if (wpcf7ApiId.includes("/feedback")) {
  console.warn("⚠️ [API Config] PUBLIC_WPCF7_API_ID should not include '/feedback'. Removing it.");
  wpcf7ApiId = wpcf7ApiId.replace(/\/feedback.*$/, "");
}

export { wpcf7ApiPrefix, wpcf7ApiId };

// Contact Form 7のREST APIエンドポイントは /wp-json/contact-form-7/v1/contact-forms/{ID}/feedback
// headlessCmsApiPrefix (/wp-json/wp/v2/) は使用しない
export const CONTACT_WPCF7_API = `${headlessCmsUrl}/wp-json/${wpcf7ApiPrefix}${wpcf7ApiId}/feedback`;

// デバッグ用: Contact Form 7 APIエンドポイントをログ出力（開発環境のみ）
if (env.DEV) {
  console.log("🔧 [API Config] Contact Form 7 API Prefix:", wpcf7ApiPrefix);
  console.log("🔧 [API Config] Contact Form 7 API ID:", wpcf7ApiId);
  console.log("🔧 [API Config] Contact Form 7 API Endpoint:", CONTACT_WPCF7_API);
}

// _wpcf7_unit_tag: Contact Form 7 REST API で必須（Zodスキーマで検証済み）
export const wpcf7UnitTag = env.PUBLIC_WPCF7_UNIT_TAG;

// _wpcf7_container_post: フォームが埋め込まれた投稿ID（デフォルト値: "0"）
export const wpcf7PostId = env.PUBLIC_WPCF7_POST_ID;

export const blogPageApi = "posts?_embed&context=embed&acf_format=standard&per_page=100";
/** 一覧・静的パス生成と同じ最大件数。未指定だと WP 既定 per_page=10 となり詳細ページのパスが欠ける */
export const blogPostApi = "posts?context=embed&acf_format=standard&per_page=100";
export const blogSlugApi = "posts?context=view&acf_format=standard&slug=";

export const categoryPageApi = "categories?context=embed&acf_format=standard&per_page=100";
export const categorySlugApi = "categories?context=embed&acf_format=standard&slug=";
export const categoryIdApi = "posts?categories=";

export const BLOG_PAGE_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${blogPageApi}`;
export const BLOG_POST_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${blogPostApi}`;
export const BLOG_SLUG_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${blogSlugApi}`;
export const CATEGORY_PAGE_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${categoryPageApi}`;
export const CATEGORY_SLUG_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${categorySlugApi}`;
export const CATEGORY_ID_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${categoryIdApi}`;

export const sliderPathApi = "sliders?context=embed&acf_format=standard";
export const SLIDER_PATH_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${sliderPathApi}`;

export const swiperPathApi = "swiper?context=embed&acf_format=standard&cache_bust=";
export const SWIPER_PATH_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${swiperPathApi}`;
