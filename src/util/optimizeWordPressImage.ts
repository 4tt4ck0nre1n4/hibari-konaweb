/**
 * WordPress画像最適化ユーティリティ
 *
 * WordPress APIから取得した画像URLをAstroのImageコンポーネントで
 * 最適化するためのヘルパー関数。
 */

import { getImage } from "astro:assets";
import type { GetImageResult } from "astro";

/**
 * WordPress画像URLを取得して正規化する
 * ACFフィールドから画像URLを抽出（オブジェクト形式または文字列形式に対応）
 *
 * @param imageData - ACFフィールドの画像データ（オブジェクトまたは文字列）
 * @returns 正規化された画像URL、またはnull
 */
export function getWordPressImageUrl(
  imageData: string | { url: string } | { url: string; width?: number; height?: number } | undefined | null
): string | null {
  if (imageData === null || imageData === undefined) {
    return null;
  }

  if (typeof imageData === "string") {
    return imageData;
  }

  if (typeof imageData === "object" && imageData !== null && "url" in imageData) {
    return imageData.url;
  }

  return null;
}

/**
 * WordPress画像を最適化する
 *
 * リモート画像URLをAstroのgetImage()で処理して最適化します。
 * ビルド時に画像がダウンロードされ、最適化された形式（WebP/AVIF）で配信。
 *
 * @param imageUrl - WordPress画像のURL
 * @param options - 画像最適化オプション
 * @returns 最適化された画像メタデータ、またはnull
 */
export async function optimizeWordPressImage(
  imageUrl: string | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "png" | "jpg";
  }
): Promise<GetImageResult | null> {
  if (imageUrl === null || imageUrl === undefined || imageUrl === "") {
    return null;
  }

  try {
    // リモート画像URLをgetImage()で処理
    // Astroはビルド時に画像をダウンロードして最適化します
    const optimizedImage = await getImage({
      src: imageUrl,
      width: options?.width,
      height: options?.height,
      quality: options?.quality ?? 80,
      format: options?.format,
    });

    return optimizedImage;
  } catch (error) {
    console.warn(`Failed to optimize WordPress image: ${imageUrl}`, error);
    // エラーが発生した場合はnullを返す（フォールバック）
    return null;
  }
}

/**
 * WordPress画像データから最適化された画像を取得する（統合関数）
 *
 * ACFフィールドの画像データから直接最適化された画像を取得します。
 *
 * @param imageData - ACFフィールドの画像データ
 * @param options - 画像最適化オプション
 * @returns 最適化された画像メタデータ、またはnull
 */
export async function getOptimizedWordPressImage(
  imageData: string | { url: string } | { url: string; width?: number; height?: number } | undefined | null,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "png" | "jpg";
  }
): Promise<GetImageResult | null> {
  const imageUrl = getWordPressImageUrl(imageData);
  if (imageUrl === null || imageUrl === "") {
    return null;
  }

  // ACFオブジェクトから幅と高さを取得（利用可能な場合）
  const width =
    options?.width ??
    (imageData !== null && typeof imageData === "object" && "width" in imageData ? imageData.width : undefined);
  const height =
    options?.height ??
    (imageData !== null && typeof imageData === "object" && "height" in imageData ? imageData.height : undefined);

  return optimizeWordPressImage(imageUrl, {
    ...options,
    width,
    height,
  });
}
