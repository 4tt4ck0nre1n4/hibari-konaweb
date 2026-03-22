import { z } from "zod";

/**
 * serviceText.json スキーマ
 */

const serviceBodyItemSchema = z.object({
  text: z.string(),
});

const serviceMenuItemSchema = z.object({
  item: z.string(),
});

const serviceCardSchema = z.object({
  serviceHeader: z.string(),
  serviceBody: z.string(),
  serviceMenu: z.array(serviceMenuItemSchema),
});

export const serviceTextSchema = z.object({
  about: z.object({
    aboutHeader: z.string(),
    aboutBody: z.array(serviceBodyItemSchema),
    aboutText: z.string(),
    aboutLikeHeader: z.string(),
    aboutLikeText: z.string(),
  }),
  skill: z.object({
    text: z.string(),
  }),
  service: z.object({
    text: z.string(),
    card1: serviceCardSchema,
    card2: serviceCardSchema,
    card3: serviceCardSchema,
    card4: serviceCardSchema,
  }),
  price: z.object({
    body: z.array(serviceBodyItemSchema),
    imageAlt: z.string(),
    footer: z.array(serviceBodyItemSchema),
  }),
});

// 型推論
export type ServiceText = z.infer<typeof serviceTextSchema>;

/**
 * Pricing設定スキーマ
 */

// FunctionOption
export const functionOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  basePrice: z.number().min(0),
});

// PricingItem
export const pricingItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  basePrice: z.number().min(0),
  isQuantifiable: z.boolean(),
  category: z.string().optional(),
  icon: z.string().optional(),
  iconClass: z.string().optional(),
  iconColorOverride: z.string().optional(),
});

// Plan
export const planSchema = z.object({
  id: z.enum(["coding", "design", "urgent"]),
  name: z.string().min(1),
  icon: z.string().optional(),
});

// PageCountOption
export const pageCountOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.number().min(0),
  multiplier: z.number().min(0).optional(),
});

// 配列全体を検証
export const pricingItemsSchema = z.array(pricingItemSchema);
export const plansSchema = z.array(planSchema);
export const pageCountOptionsSchema = z.array(pageCountOptionSchema);
export const functionOptionsSchema = z.array(functionOptionSchema);

// 型推論
export type FunctionOption = z.infer<typeof functionOptionSchema>;
export type PricingItem = z.infer<typeof pricingItemSchema>;
export type Plan = z.infer<typeof planSchema>;
export type PageCountOption = z.infer<typeof pageCountOptionSchema>;

/**
 * Company情報スキーマ
 */
export const companyInfoSchema = z.object({
  name: z.string().min(1),
  website: z.string().url(),
  registrationNumber: z.string(),
});

export const estimateConfigSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  validityDays: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  urgentFeeRate: z.number().min(0).max(1),
  disclaimer: z.array(z.string()),
  notes: z.array(z.string()),
});

// 型推論
export type CompanyInfo = z.infer<typeof companyInfoSchema>;
export type EstimateConfig = z.infer<typeof estimateConfigSchema>;

/**
 * 汎用JSON検証ヘルパー関数
 */

/**
 * JSONデータを安全に検証
 * @param schema - Zodスキーマ
 * @param data - 検証するデータ
 * @param dataName - データ名（エラーログ用）
 * @param fallback - フォールバック値
 * @returns 検証済みデータまたはフォールバック値
 */
export function validateJsonData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  dataName: string,
  fallback: T
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`❌ [JSON Validation] ${dataName} validation failed:`, result.error.format());
    console.warn(`⚠️ [JSON Validation] Using fallback value for ${dataName}`);
    return fallback;
  }

  return result.data;
}

/**
 * 設定データを検証（フォールバックなし、エラーをthrow）
 * @param schema - Zodスキーマ
 * @param data - 検証するデータ
 * @param dataName - データ名（エラーログ用）
 * @returns 検証済みデータ
 * @throws {Error} 検証に失敗した場合
 */
export function validateConfigData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  dataName: string
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`❌ [Config Validation] ${dataName} validation failed:`, result.error.format());
    throw new Error(`Configuration validation failed for ${dataName}`);
  }

  return result.data;
}
