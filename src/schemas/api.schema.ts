import { z } from "zod";

/**
 * WordPress REST API レスポンススキーマ
 */

// WordPress レンダリングコンテンツ
const wpRenderedSchema = z.object({
  rendered: z.string(),
});

/** ブログ等: `rendered` 欠損・非文字列でもビルドを落とさない（出力型は常に string） */
const wpRenderedLenientSchema = z.object({
  rendered: z
    .unknown()
    .transform((v) => (v === undefined || v === null ? "" : String(v))),
});

/** `_embedded.author`: 相対 URL や空でも許容（embed 文脈で揺れる） */
const wpAuthorLenientSchema = z.object({
  name: z
    .unknown()
    .transform((v) => (v === undefined || v === null ? "" : String(v))),
  link: z
    .unknown()
    .transform((v) => (v === undefined || v === null ? "" : String(v))),
});

/** ブログ詳細: `_embedded` の形が投稿・プラグインで微妙に異なる場合がある */
const wpEmbeddedLenientSchema = z
  .object({
    author: z.array(wpAuthorLenientSchema).optional(),
    /** タームのフィールドが文脈で欠ける場合があるため緩く受ける */
    "wp:term": z.array(z.array(z.record(z.unknown()))).optional(),
  })
  .passthrough()
  .optional();

// カテゴリ情報
const catInfoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
});

/**
 * ACF 画像: 文字列 URL / メディア ID / `{ url }` / `{ source_url }` 等（REST・ACF の返し方差を吸収）
 * 正規化後は表示側 `getWordPressImageUrl` で URL 文字列に揃える
 */
const blogImageAcfFieldSchema = z
  .unknown()
  .transform((val): string | number | undefined => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === "string") return val;
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "object" && val !== null) {
      const o = val as Record<string, unknown>;
      if (typeof o.url === "string") return o.url;
      if (typeof o.source_url === "string") return o.source_url;
    }
    return undefined;
  });

// Advanced Custom Fields (ACF) - Blog
const blogAcfSchema = z
  .object({
    blog_image: blogImageAcfFieldSchema,
    description: z
      .unknown()
      .optional()
      .transform((v) => (v === undefined || v === null ? undefined : String(v))),
  })
  .passthrough()
  .optional();

// Advanced Custom Fields (ACF) - Works
const worksAcfSchema = z
  .object({
    screenshot_pc: z.string().optional(),
    left_link: z.string().optional(),
    span_access: z.string().optional(),
    span_user: z.string().optional(),
    span_password: z.string().optional(),
    left_text: z.string().optional(),
    pc_image: z.string().optional(),
    right_header: z.string().optional(),
    right_title: z.string().optional(),
    icon_image: z.string().optional(),
    right_access: z.string().optional(),
    sp_image: z.string().optional(),
    right_link: z.string().optional(),
    description: z.string().optional(),
    // アイコンフラグ
    icon_vscode: z.string().optional(),
    icon_cursor: z.string().optional(),
    icon_html: z.string().optional(),
    icon_css: z.string().optional(),
    icon_sass: z.string().optional(),
    icon_javascript: z.string().optional(),
    icon_jquery: z.string().optional(),
    icon_typescript: z.string().optional(),
    icon_gsap: z.string().optional(),
    icon_swiper: z.string().optional(),
    icon_three: z.string().optional(),
    icon_react: z.string().optional(),
    icon_wordpress: z.string().optional(),
    icon_vite: z.string().optional(),
    icon_gulp: z.string().optional(),
    icon_webpack: z.string().optional(),
    icon_astro: z.string().optional(),
    icon_netlify: z.string().optional(),
    icon_vercel: z.string().optional(),
    icon_github: z.string().optional(),
    icon_canva: z.string().optional(),
    icon_adobexd: z.string().optional(),
    icon_photoshop: z.string().optional(),
    icon_illustrator: z.string().optional(),
    icon_figma: z.string().optional(),
  })
  .optional();

/**
 * Blog投稿スキーマ
 */
export const blogPostSchema = z.object({
  id: z.number(),
  title: wpRenderedLenientSchema,
  slug: z.string(),
  date: z.string(),
  categories: z
    .unknown()
    .transform((v) => {
      if (!Array.isArray(v)) return [];
      return v.filter((x): x is number => typeof x === "number" && Number.isFinite(x));
    }),
  content: wpRenderedLenientSchema,
  cat_info: z.array(catInfoSchema).optional(),
  _embedded: wpEmbeddedLenientSchema,
  acf: blogAcfSchema,
});

// APIレスポンス全体を包む（配列）
export const blogPostsResponseSchema = z.array(blogPostSchema);

/**
 * ブログ詳細サイドバー「読まれている記事」用。
 * 一覧 API（embed）では `content` 等が欠けたり 1 件だけ形が崩れても、配列全体を [] にしない。
 */
export const blogPostSidebarItemSchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    title: z.preprocess(
      (v) => (v === undefined || v === null ? { rendered: "" } : v),
      wpRenderedLenientSchema,
    ),
    acf: blogAcfSchema,
  })
  .passthrough();

export type BlogPostSidebarItem = z.output<typeof blogPostSidebarItemSchema>;

/** `posts` 配列を要素単位でパースし、不正な要素だけ捨てる */
export function parseBlogPostSidebarList(data: unknown): BlogPostSidebarItem[] {
  if (!Array.isArray(data)) return [];
  const out: BlogPostSidebarItem[] = [];
  for (const item of data) {
    const result = blogPostSidebarItemSchema.safeParse(item);
    if (result.success) {
      out.push(result.data);
    }
  }
  return out;
}

// 型推論（transform 後の形を正とする）
export type BlogPost = z.output<typeof blogPostSchema>;
export type BlogPostsResponse = z.output<typeof blogPostsResponseSchema>;

/**
 * Works（制作実績）スキーマ
 */
export const worksSchema = z.object({
  id: z.number(),
  date: z.number(),
  title: wpRenderedSchema,
  slug: z.string(),
  acf: worksAcfSchema,
});

// APIレスポンス全体を包む（配列）
export const worksResponseSchema = z.array(worksSchema);

// 型推論
export type Works = z.infer<typeof worksSchema>;
export type WorksResponse = z.infer<typeof worksResponseSchema>;

/**
 * カテゴリスキーマ
 */
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  count: z.number().optional(),
  description: z.string().optional(),
});

// APIレスポンス全体を包む（配列）
export const categoriesResponseSchema = z.array(categorySchema);

// 型推論
export type Category = z.infer<typeof categorySchema>;
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;

/**
 * Contact Form 7 レスポンススキーマ
 */

// 不正フィールド情報
const wpcf7InvalidFieldSchema = z.object({
  message: z.string(),
  idref: z.string().nullable(),
  error_id: z.string(),
  field: z.string().optional(),
  into: z.string().optional(),
});

// Contact Form 7 APIレスポンス全体
export const wpcf7ResponseSchema = z.object({
  status: z.enum(["mail_sent", "validation_failed", "mail_failed", "aborted", "spam"]),
  message: z.string(),
  invalid_fields: z.array(wpcf7InvalidFieldSchema).optional(),
  posted_data_hash: z.string().optional(),
});

// 型推論
export type WPCF7Response = z.infer<typeof wpcf7ResponseSchema>;
export type WPCF7InvalidField = z.infer<typeof wpcf7InvalidFieldSchema>;

/**
 * API検証ヘルパー関数
 */

/**
 * APIレスポンスを安全に検証
 * @param schema - Zodスキーマ（transform がある場合も **出力型** を返す）
 * @param data - 検証するデータ
 * @param apiName - API名（エラーログ用）
 * @param fallback - フォールバック値
 * @returns 検証済みデータまたはフォールバック値
 */
export function validateApiResponse<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  apiName: string,
  fallback: z.output<S>,
): z.output<S> {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`❌ [API Validation] ${apiName} validation failed:`, result.error.format());
    console.warn(`⚠️ [API Validation] Using fallback value for ${apiName}`);
    return fallback;
  }

  return result.data;
}

/**
 * APIレスポンスを検証（フォールバックなし、エラーをthrow）
 * @param schema - Zodスキーマ
 * @param data - 検証するデータ
 * @param apiName - API名（エラーログ用）
 * @returns 検証済みデータ
 * @throws {Error} 検証に失敗した場合
 */
export function validateApiResponseStrict<S extends z.ZodTypeAny>(schema: S, data: unknown, apiName: string): z.output<S> {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`❌ [API Validation] ${apiName} validation failed:`, result.error.format());
    throw new Error(`API response validation failed for ${apiName}`);
  }

  return result.data;
}
