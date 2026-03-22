import { z } from "zod";

/**
 * SessionStorage / LocalStorage データスキーマ
 */

/**
 * 見積PDFデータスキーマ
 */
export const estimatePdfDataSchema = z.object({
  estimatePDF: z.string().startsWith("data:application/pdf;base64,", {
    message: "estimatePDF must be a valid base64 PDF data URL",
  }),
  estimateNumber: z.string().min(1, { message: "estimateNumber is required" }),
});

// 型推論
export type EstimatePdfData = z.infer<typeof estimatePdfDataSchema>;

/**
 * お問い合わせ番号データスキーマ
 */
export const inquiryDataSchema = z.object({
  inquiryNumber: z.string().regex(/^INQ-\d{8}-\d{6}$/, {
    message: "inquiryNumber must be in format: INQ-YYYYMMDD-HHMMSS",
  }),
  inquiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
    message: "inquiryDate must be in format: YYYY-MM-DD HH:MM",
  }),
});

// 型推論
export type InquiryData = z.infer<typeof inquiryDataSchema>;

/**
 * Storage検証ヘルパー関数
 */

/**
 * SessionStorageから安全にデータを取得
 * @param schema - Zodスキーマ
 * @param keys - 取得するキーの配列
 * @param storageName - Storage名（エラーログ用）
 * @returns 検証済みデータまたはnull
 */
export function getFromStorageSafely<T>(
  schema: z.ZodType<T>,
  keys: string[],
  storageName: "sessionStorage" | "localStorage" = "sessionStorage"
): T | null {
  try {
    const storage = storageName === "sessionStorage" ? sessionStorage : localStorage;
    const data: Record<string, string> = {};

    // すべてのキーのデータを取得
    for (const key of keys) {
      const value = storage.getItem(key);
      if (value === null) {
        console.warn(`⚠️ [Storage] ${key} not found in ${storageName}`);
        return null;
      }
      data[key] = value;
    }

    // Zodで検証
    const result = schema.safeParse(data);

    if (!result.success) {
      console.error(`❌ [Storage] ${storageName} validation failed:`, result.error.format());
      // 破損データをクリア
      keys.forEach((key) => storage.removeItem(key));
      return null;
    }

    return result.data;
  } catch (error) {
    console.error(`❌ [Storage] Error reading from ${storageName}:`, error);
    return null;
  }
}

/**
 * SessionStorageに安全にデータを保存
 * @param schema - Zodスキーマ
 * @param data - 保存するデータ
 * @param storageName - Storage名
 * @returns 保存成功時はtrue、失敗時はfalse
 */
export function setToStorageSafely<T extends Record<string, string>>(
  schema: z.ZodType<T>,
  data: T,
  storageName: "sessionStorage" | "localStorage" = "sessionStorage"
): boolean {
  try {
    // 保存前に検証
    const result = schema.safeParse(data);

    if (!result.success) {
      console.error(`❌ [Storage] Data validation failed before saving to ${storageName}:`, result.error.format());
      return false;
    }

    const storage = storageName === "sessionStorage" ? sessionStorage : localStorage;

    // すべてのキーを保存
    Object.entries(result.data).forEach(([key, value]) => {
      storage.setItem(key, value);
    });

    return true;
  } catch (error) {
    console.error(`❌ [Storage] Error writing to ${storageName}:`, error);
    return false;
  }
}

/**
 * Storageから安全にクリア
 * @param keys - クリアするキーの配列
 * @param storageName - Storage名
 */
export function clearFromStorageSafely(
  keys: string[],
  storageName: "sessionStorage" | "localStorage" = "sessionStorage"
): void {
  try {
    const storage = storageName === "sessionStorage" ? sessionStorage : localStorage;
    keys.forEach((key) => storage.removeItem(key));
  } catch (error) {
    console.error(`❌ [Storage] Error clearing ${storageName}:`, error);
  }
}
