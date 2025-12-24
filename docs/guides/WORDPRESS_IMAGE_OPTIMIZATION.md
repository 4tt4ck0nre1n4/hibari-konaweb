# WordPress画像最適化ガイド

WordPress APIから取得した画像をAstroのImageコンポーネントで最適化する方法を説明します。

## 概要

WordPressの画像をAstro（Netlify）側で最適化することで、以下のメリットがあります：

- **自動フォーマット変換**: WebP/AVIF形式への自動変換
- **レスポンシブ画像**: デバイスに応じた最適なサイズの配信
- **画像圧縮**: ファイルサイズの削減
- **キャッシュ最適化**: Netlifyのキャッシュ設定と組み合わせて高速配信

## セットアップ

### 1. astro.config.mjsの設定

`astro.config.mjs`にWordPressのドメインが自動的に追加されます（環境変数`PUBLIC_API_URL`から取得）。

```javascript
image: {
  domains: imageDomains, // WordPressドメインが自動的に追加される
  service: {
    entrypoint: "astro/assets/services/sharp",
  },
}
```

### 2. 環境変数の設定

Netlifyの環境変数で`PUBLIC_API_URL`が設定されていることを確認してください。

```
PUBLIC_API_URL=https://your-wordpress-site.com
```

## 使用方法

### 基本的な使用方法

```astro
---
import { Image } from "astro:assets";
import { getOptimizedWordPressImage, getWordPressImageUrl } from "../../util/optimizeWordPressImage";

// WordPress APIから取得したデータ
const imageData = post.acf?.blog_image; // string | { url: string } | undefined

// 画像を最適化（ビルド時に処理）
const optimizedImage = await getOptimizedWordPressImage(imageData, {
  width: 800,
  height: 600,
  quality: 85,
  format: "webp",
});

// フォールバック用のURL（最適化に失敗した場合）
const fallbackUrl = getWordPressImageUrl(imageData) ?? "";
---
```

### Imageコンポーネントで使用

```astro
{optimizedImage ? (
  <Image
    src={optimizedImage}
    alt="画像の説明"
    width={800}
    height={600}
    loading="lazy"
    decoding="async"
  />
) : (
  <img
    src={fallbackUrl}
    alt="画像の説明"
    width={800}
    height={600}
    loading="lazy"
    decoding="async"
  />
)}
```

### 実装例: SwiperDisplay.astro

```astro
---
import { getOptimizedWordPressImage, getWordPressImageUrl } from "../util/optimizeWordPressImage";

// WordPress画像を最適化（ビルド時に処理）
const optimizedSwiperImages = await Promise.all(
  swipers.slice(0, 10).map(async (swiper) => {
    const optimizedImage = await getOptimizedWordPressImage(swiper.acf?.swiper_image, {
      width: 270,
      height: 360,
      quality: 85,
      format: "webp",
    });
    const fallbackUrl = getWordPressImageUrl(swiper.acf?.swiper_image) ?? "";
    return {
      ...swiper,
      optimizedImage,
      fallbackUrl,
    };
  })
);
---

{optimizedSwiperImages.map((swiperData) => (
  <div class="swiper-slide">
    {swiperData.optimizedImage ? (
      <Image
        src={swiperData.optimizedImage}
        alt={swiperData.acf?.swiper_title ?? ""}
        width={270}
        height={360}
        loading="lazy"
      />
    ) : (
      <img
        src={swiperData.fallbackUrl}
        alt={swiperData.acf?.swiper_title ?? ""}
        width="270"
        height="360"
        loading="lazy"
      />
    )}
  </div>
))}
```

## APIリファレンス

### `getOptimizedWordPressImage()`

WordPress画像データから最適化された画像を取得します。

**パラメータ:**
- `imageData`: ACFフィールドの画像データ（`string | { url: string } | { url: string; width?: number; height?: number } | undefined | null`）
- `options`: 画像最適化オプション
  - `width?: number` - 画像の幅
  - `height?: number` - 画像の高さ
  - `quality?: number` - 画像品質（0-100、デフォルト: 80）
  - `format?: "webp" | "avif" | "png" | "jpg"` - 出力フォーマット

**戻り値:**
- `Promise<ImageMetadata | null>` - 最適化された画像メタデータ、またはnull（エラー時）

### `getWordPressImageUrl()`

WordPress画像データからURLを抽出します。

**パラメータ:**
- `imageData`: ACFフィールドの画像データ

**戻り値:**
- `string | null` - 画像URL、またはnull

### `optimizeWordPressImage()`

画像URLを直接最適化します。

**パラメータ:**
- `imageUrl`: 画像URL（`string | null | undefined`）
- `options`: 画像最適化オプション

**戻り値:**
- `Promise<ImageMetadata | null>` - 最適化された画像メタデータ、またはnull

## 注意事項

### ビルド時間への影響

- リモート画像はビルド時にダウンロードされるため、画像が多い場合はビルド時間が長くなる可能性があります
- Netlifyのビルドタイムアウト（デフォルト: 15分）に注意してください

### エラーハンドリング

- 画像の最適化に失敗した場合は、フォールバックとして元のURLを使用します
- エラーログを確認して、問題のある画像URLを特定してください

### キャッシュ

- 最適化された画像は`dist/_astro/`ディレクトリに保存されます
- `netlify.toml`のキャッシュ設定により、1年間キャッシュされます

## トラブルシューティング

### 画像が最適化されない

1. `astro.config.mjs`の`image.domains`にWordPressドメインが含まれているか確認
2. 環境変数`PUBLIC_API_URL`が正しく設定されているか確認
3. ビルドログでエラーメッセージを確認

### ビルドがタイムアウトする

1. 画像の数を減らす
2. 画像のサイズを事前にリサイズする
3. Netlifyのビルドタイムアウトを延長する（Site Settings → Build & deploy → Build settings）

### 画像が表示されない

1. フォールバックURLが正しく設定されているか確認
2. WordPress側のCORS設定を確認
3. ブラウザの開発者ツールでネットワークエラーを確認

## パフォーマンス最適化のヒント

1. **必要なサイズのみ最適化**: 表示サイズに合わせて`width`と`height`を指定
2. **適切な品質設定**: `quality: 85`がバランスの良い設定（必要に応じて調整）
3. **フォーマット選択**: WebPが最も広くサポートされている（AVIFはより高圧縮だが、サポートが限定的）
4. **遅延読み込み**: `loading="lazy"`を使用して、ビューポート外の画像を遅延読み込み

## 関連ドキュメント

- [Astro Image Optimization](https://docs.astro.build/en/guides/images/)
- [Netlify Image Optimization](https://docs.netlify.com/image-processing/overview/)
- [PageSpeed Insights最適化ガイド](../optimization/)
