// 環境変数のチェックと詳細なエラーメッセージ
if (import.meta.env["PUBLIC_API_URL"] === undefined) {
  console.error("❌ Environment variable PUBLIC_API_URL is not set!");
  console.error("❌ This will cause 404 errors for dynamically generated pages.");
  console.error("❌ Please set PUBLIC_API_URL in your environment variables.");
  console.error("❌ For local development: create a .env file");
  console.error("❌ For Netlify: set it in Site Settings → Environment Variables");
  throw new Error("Please set environment variables: PUBLIC_API_URL");
}

if (import.meta.env.PUBLIC_API_PREFIX === undefined) {
  console.error("❌ Environment variable PUBLIC_API_PREFIX is not set!");
  console.error("❌ Using default value: /wp-json/wp/v2/");
}

export const headlessCmsUrl = import.meta.env["PUBLIC_API_URL"] as string;
export const headlessCmsApiPrefix = (import.meta.env.PUBLIC_API_PREFIX ?? "/wp-json/wp/v2/") as string;

// ビルド時に環境変数をログ出力（開発環境のみ）
if (import.meta.env.DEV) {
  console.log("🔧 [API Config] WordPress API URL:", headlessCmsUrl);
  console.log("🔧 [API Config] API Prefix:", headlessCmsApiPrefix);
}

export const worksPageApi = "works?context=embed&acf_format=standard&per_page=20";
export const worksSlugApi = "works?context=embed&acf_format=standard&slug=";
export const worksPathApi = "works?context=embed&acf_format=standard";
export const WORKS_PAGE_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksPageApi}`;
export const WORKS_SLUG_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksSlugApi}`;
export const WORKS_PATH_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksPathApi}`;

// Contact Form 7環境変数のチェック
if (import.meta.env.PUBLIC_WPCF7_API_PREFIX === undefined) {
  console.error("❌ Environment variable PUBLIC_WPCF7_API_PREFIX is not set!");
  console.error("❌ This will cause 404 errors for contact form submissions.");
  console.error("❌ Please set PUBLIC_WPCF7_API_PREFIX in your environment variables.");
  console.error("❌ Expected value: contact-form-7/v1/contact-forms/");
}

if (import.meta.env.PUBLIC_WPCF7_API_ID === undefined) {
  console.error("❌ Environment variable PUBLIC_WPCF7_API_ID is not set!");
  console.error("❌ This will cause 404 errors for contact form submissions.");
  console.error("❌ Please set PUBLIC_WPCF7_API_ID in your environment variables.");
  console.error("❌ This should be your Contact Form 7 form ID (e.g., 2145)");
}

// Contact Form 7環境変数の処理と検証
let wpcf7ApiPrefix: string = (import.meta.env.PUBLIC_WPCF7_API_PREFIX ?? "contact-form-7/v1/contact-forms/") as string;
let wpcf7ApiId: string = (import.meta.env.PUBLIC_WPCF7_API_ID ?? "") as string;

// 環境変数の値に不要な接頭辞や接尾辞が含まれていないかチェック
if (typeof wpcf7ApiPrefix === "string" && wpcf7ApiPrefix.startsWith("/wp-json/")) {
  console.warn("⚠️ [API Config] PUBLIC_WPCF7_API_PREFIX should not start with '/wp-json/'. Removing it.");
  wpcf7ApiPrefix = wpcf7ApiPrefix.replace(/^\/wp-json\//, "");
}
if (typeof wpcf7ApiPrefix === "string" && wpcf7ApiPrefix.startsWith("/")) {
  console.warn("⚠️ [API Config] PUBLIC_WPCF7_API_PREFIX should not start with '/'. Removing it.");
  wpcf7ApiPrefix = wpcf7ApiPrefix.replace(/^\//, "");
}
if (typeof wpcf7ApiPrefix === "string" && !wpcf7ApiPrefix.endsWith("/")) {
  wpcf7ApiPrefix = `${wpcf7ApiPrefix}/`;
}

// wpcf7ApiIdから不要な接尾辞を削除
if (typeof wpcf7ApiId === "string" && wpcf7ApiId.includes("/feedback")) {
  console.warn("⚠️ [API Config] PUBLIC_WPCF7_API_ID should not include '/feedback'. Removing it.");
  wpcf7ApiId = wpcf7ApiId.replace(/\/feedback.*$/, "");
}

// wpcf7ApiIdが空の場合はエラー
if (typeof wpcf7ApiId === "string" && (wpcf7ApiId === "" || wpcf7ApiId.trim() === "")) {
  console.error("❌ [API Config] PUBLIC_WPCF7_API_ID is empty or not set!");
  console.error("❌ This will cause 404 errors for contact form submissions.");
  console.error("❌ Please set PUBLIC_WPCF7_API_ID to your Contact Form 7 form ID (e.g., 2145)");
}

export { wpcf7ApiPrefix, wpcf7ApiId };

// Contact Form 7のREST APIエンドポイントは /wp-json/contact-form-7/v1/contact-forms/{ID}/feedback
// headlessCmsApiPrefix (/wp-json/wp/v2/) は使用しない
export const CONTACT_WPCF7_API = `${headlessCmsUrl}/wp-json/${wpcf7ApiPrefix}${wpcf7ApiId}/feedback`;

// デバッグ用: Contact Form 7 APIエンドポイントをログ出力（開発環境のみ）
if (import.meta.env.DEV) {
  console.log("🔧 [API Config] Contact Form 7 API Prefix:", wpcf7ApiPrefix);
  console.log("🔧 [API Config] Contact Form 7 API ID:", wpcf7ApiId);
  console.log("🔧 [API Config] Contact Form 7 API Endpoint:", CONTACT_WPCF7_API);
}
export const wpcf7Id = import.meta.env.PUBLIC_WPCF7_ID as string;
export const wpcf7UnitTag = import.meta.env["PUBLIC_WPCF7_UNIT_TAG"] as string;
export const wpcf7PostId = import.meta.env["PUBLIC_WPCF7_POST_ID"] as string;

export const blogPageApi = "posts?_embed&context=embed&acf_format=standard&per_page=100";
export const blogPostApi = "posts?context=embed&acf_format=standard";
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
