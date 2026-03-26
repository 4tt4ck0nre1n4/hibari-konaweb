import { z } from "zod";

/**
 * 環境変数スキーマ
 * すべての環境変数を一元管理し、型安全性を確保
 */
export const envSchema = z.object({
  // WordPress API URL（必須、URL形式）
  PUBLIC_API_URL: z.string().url({ message: "PUBLIC_API_URL must be a valid URL" }),

  // WordPress API Prefix（任意、デフォルト値あり）
  PUBLIC_API_PREFIX: z.string().default("/wp-json/wp/v2/"),

  // Contact Form 7 API Prefix（任意、デフォルト値あり）
  PUBLIC_WPCF7_API_PREFIX: z.string().default("contact-form-7/v1/contact-forms/"),

  // Contact Form 7 Form ID（必須）
  PUBLIC_WPCF7_API_ID: z.string().min(1, { message: "PUBLIC_WPCF7_API_ID is required" }),

  // Contact Form 7 Unit Tag（必須、特定形式）
  PUBLIC_WPCF7_UNIT_TAG: z
    .string()
    .min(1, { message: "PUBLIC_WPCF7_UNIT_TAG is required" })
    .regex(/^wpcf7-f\d+-p\d+-o\d+$/, {
      message: "PUBLIC_WPCF7_UNIT_TAG must be in format: wpcf7-f{form_id}-p{post_id}-o{order}",
    }),

  // Contact Form 7 Post ID（任意、デフォルト値: "0"）
  PUBLIC_WPCF7_POST_ID: z.string().default("0"),

  // Google Analytics Measurement ID（任意）
  PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Cloudflare Turnstile Site Key（任意）
  PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  /**
   * `true` のとき、静的ビルドで WordPress REST が失敗してもブログ `getStaticPaths` を落とさない（空パスで続行）。
   * 本番 Netlify では未設定のままにすること（誤デプロイ防止）。
   */
  PUBLIC_BUILD_SKIP_WORDPRESS: z
    .union([z.string(), z.boolean(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null) return false;
      if (typeof v === "boolean") return v;
      if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        return s === "1" || s === "true" || s === "yes";
      }
      return false;
    }),

  // 開発環境フラグ（システム提供）
  DEV: z.boolean().default(false),
});

// 型推論（二重管理を避ける）
export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数を検証し、型安全な環境変数オブジェクトを返す
 * @param env - import.meta.env
 * @returns 検証済みの環境変数
 * @throws {Error} 検証に失敗した場合（詳細なエラーメッセージ付き）
 */
export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    // 開発環境では詳細なエラー情報を表示
    if (env.DEV === true) {
      console.error("❌ Environment variable validation failed:");
      console.error(result.error.format());
    }

    // エラーメッセージを整形
    const errorMessages = result.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return `  - ${path}: ${issue.message}`;
    });

    const errorMessage = [
      "環境変数の検証に失敗しました:",
      ...errorMessages,
      "",
      ".envファイルまたは環境変数の設定を確認してください。",
      "ローカル開発環境: プロジェクトルートに.envファイルを作成してください",
      "Netlify: サイト設定 → Environment Variables で環境変数を設定してください",
    ].join("\n");

    throw new Error(errorMessage);
  }

  return result.data;
}
