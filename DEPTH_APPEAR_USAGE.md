# DepthAppearImage コンポーネント使用ガイド

画面奥から出現するアニメーション付き画像コンポーネントの使用方法です。

## 基本的な使用方法

### Astroファイルでの使用例

```astro
---
import DepthAppearImage from "../components/DepthAppearImage.tsx";
import animeImageSrc from "../assets/anime.png";
import { getImage } from "astro:assets";

// Astroの画像最適化を使用
const animeImage = await getImage({ src: animeImageSrc });
---

<div class="anime-container">
  <!-- CSSアニメーションを使用（デフォルト、軽量） -->
  <DepthAppearImage 
    src={animeImage.src} 
    alt="アニメーション画像"
    className="custom-class"
    duration={1.5}
    delay={0.3}
    client:load
  />
</div>

<style>
  .anime-container {
    width: 500px;
    height: 600px;
    margin: 0 auto;
  }
</style>
```

### GSAPアニメーションを使用する場合

```astro
---
import DepthAppearImage from "../components/DepthAppearImage.tsx";
import animeImageSrc from "../assets/anime.png";
import { getImage } from "astro:assets";

const animeImage = await getImage({ src: animeImageSrc });
---

<DepthAppearImage 
  src={animeImage.src} 
  alt="アニメーション画像"
  useGSAP={true}
  duration={1.2}
  delay={0.5}
  onAnimationComplete={() => console.log("アニメーション完了")}
  client:load
/>
```

## プロパティ

| プロパティ | 型 | デフォルト値 | 説明 |
|---------|-----|------------|------|
| `src` | `string` | 必須 | 画像のパス |
| `alt` | `string` | `"Animated image"` | 画像の代替テキスト |
| `className` | `string` | `""` | 追加のCSSクラス |
| `duration` | `number` | `1.2` | アニメーションの継続時間（秒） |
| `delay` | `number` | `0` | アニメーション開始の遅延時間（秒） |
| `useGSAP` | `boolean` | `false` | GSAPを使用するかどうか（falseの場合はCSSアニメーション） |
| `onAnimationComplete` | `() => void` | `undefined` | アニメーション完了時のコールバック（GSAP使用時のみ） |

## アニメーションの特徴

### CSSアニメーション（デフォルト）
- **軽量**: GSAPを読み込む必要がない
- **パフォーマンス**: GPU加速を使用
- **カスタマイズ**: CSSで簡単に調整可能
- **イージング**: `cubic-bezier(0.34, 1.56, 0.64, 1)` でバウンス効果

### GSAPアニメーション
- **柔軟性**: より複雑なアニメーションが可能
- **制御**: タイムラインやコールバックが使用可能
- **イージング**: `power3.out` で滑らかな動き

## パフォーマンス最適化

- `will-change` プロパティでGPU加速を有効化
- `backface-visibility: hidden` でレンダリング最適化
- `loading="lazy"` で画像の遅延読み込み
- `prefers-reduced-motion` に対応（アニメーション無効化）

## 使用例：トップページに配置

```astro
---
// src/pages/index.astro
import DepthAppearImage from "../components/DepthAppearImage.tsx";
import animeImageSrc from "../assets/anime.png";
import { getImage } from "astro:assets";

const animeImage = await getImage({ src: animeImageSrc });
---

<section class="hero-section">
  <DepthAppearImage 
    src={animeImage.src} 
    alt="ヒーロー画像"
    duration={1.5}
    delay={0.5}
    client:visible
  />
</section>

<style>
  .hero-section {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
  }
</style>
```

## 注意事項

1. **Astroでの使用**: Reactコンポーネントなので、`client:load`、`client:visible`、`client:idle` などのディレクティブが必要です
2. **画像パス**: `src/assets/anime.png` を使用する場合は、Astroの `getImage` を使用して最適化された画像パスを取得してください
3. **パフォーマンス**: 大量の画像を同時にアニメーションさせる場合は、`client:visible` を使用してビューポートに入った時のみ読み込むことを推奨します
4. **画像最適化**: Astroの `getImage` を使用することで、画像の自動最適化（WebP変換など）が行われます
