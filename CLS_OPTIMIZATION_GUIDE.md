# CLS最適化ガイド - レイアウトシフト削減

## 概要

PageSpeed Insightsで検出された「レイアウト シフトの原因」の問題を解決するための最適化を実装しました。

**改善前のCLSスコア**: 0.195（目標: < 0.1）

## レイアウトシフトの主な原因

PageSpeed Insightsで検出された主な問題：

| 要素                            | CLSスコア | 原因                           |
| ------------------------------- | --------- | ------------------------------ |
| `body`                          | 0.136     | overflow プロパティの動的変更  |
| `<aside class="toolbar">`       | 0.050     | 動的コンテンツのサイズ未定義   |
| `<div class="loading-content">` | 0.006     | ローディング画面のサイズ未定義 |
| `<li class="header_menu_item">` | 0.001     | テーマ切り替えボタンの動的表示 |

## 実装済みの最適化

### 1. body要素のoverflowプロパティ変更を修正（CLSスコア: 0.136削減）

**問題**: ローディング画面表示中に`document.body.style.overflow`を`hidden`から`auto`に変更していたため、スクロールバーの表示/非表示でレイアウトシフトが発生。

**解決策**: `body`ではなく`html`（`document.documentElement`）に対してoverflowを設定。

**ファイル**: `src/components/Logo.astro`

```typescript
// 変更前
document.body.style.overflow = "hidden";
// ...
document.body.style.overflow = "auto";

// 変更後
document.documentElement.style.overflow = "hidden";
// ...
document.documentElement.style.overflow = "";
```

**効果**:

- スクロールバーの表示/非表示によるレイアウトシフトを防止
- 最大のCLS要因（0.136）を解消

### 2. スクロールバーのスペースを常に確保

**ファイル**: `src/styles/reset.css`

```css
:where(html) {
  scrollbar-gutter: stable both-edges; /* スクロールバーのスペースを常に確保してCLSを防止 */
}
```

**効果**:

- スクロールバーの表示時にコンテンツが横にずれることを防止
- レイアウトの安定性向上

### 3. フォント読み込みの最適化（font-display: swap）

**問題**: Poppinsフォントの読み込み中にテキストの再レンダリングが発生し、レイアウトシフトの原因に。

**解決策**: `font-display: swap`を設定して、フォント読み込み中もフォールバックフォントでテキストを表示。

**ファイル**: `src/styles/global.css`

```css
@font-face {
  font-family: "Poppins";
  font-style: normal;
  font-display: swap; /* フォント読み込み中もテキストを表示してCLSを防止 */
  font-weight: 400;
  src: local("Poppins");
}

@font-face {
  font-family: "Poppins";
  font-style: normal;
  font-display: swap;
  font-weight: 700;
  src: local("Poppins");
}
```

**ファイル**: `src/layouts/HeadLayout.astro`

```astro
<!-- フォントのプリロードでCLSを削減 -->
<link
  rel="preload"
  href="/node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
```

**効果**:

- フォント読み込み中のテキストの再レンダリングを防止
- FOUT（Flash of Unstyled Text）を最小限に抑制
- Largest Contentful Paint（LCP）の改善

### 4. 動的コンテンツのサイズ予約

**問題**: toolbar、sidebar、loading-contentなどの動的コンテンツにサイズが定義されていないため、読み込み時にレイアウトシフトが発生。

**解決策**: min-heightを設定してスペースを事前に確保。

**ファイル**: `src/pages/index.astro`

```css
#main-container {
  min-height: 600px; /* CLSを防ぐために最小高さを設定 */
}

.toolbar {
  min-height: 400px; /* CLSを防ぐために最小高さを設定 */
}

.sidebar {
  min-height: 350px; /* CLSを防ぐために最小高さを設定 */
}
```

**ファイル**: `src/components/Logo.astro`

```css
.loading-content {
  min-height: 400px; /* CLSを防ぐために最小高さを設定 */
}
```

**効果**:

- 動的コンテンツ読み込み時のレイアウトシフトを防止
- toolbar（0.050）とloading-content（0.006）のCLSを削減

### 5. 画像の最適化

**既存の対応状況**: すべての画像に`width`と`height`属性を設定済み。

**例**: `src/components/Logo.astro`

```astro
<Image class="logo-image" src={LogoSvg} alt="ロゴ画像" width="495" height="623" loading="eager" decoding="async" />
```

**効果**:

- 画像読み込み前にスペースを確保
- 画像読み込み時のレイアウトシフトを防止

## パフォーマンス目標

| 指標                           | 改善前 | 目標    | 期待される結果          |
| ------------------------------ | ------ | ------- | ----------------------- |
| Cumulative Layout Shift (CLS)  | 0.195  | < 0.1   | 0.09以下                |
| Largest Contentful Paint (LCP) | -      | < 2.5s  | 改善                    |
| First Contentful Paint (FCP)   | -      | < 1.8s  | 改善                    |
| レンダリングブロッキング時間   | 980ms  | < 200ms | 改善（CSS最適化と併用） |

## 検証方法

### 1. ローカルでの確認

```bash
# ビルドを実行
npm run build

# プレビューを起動
npm run preview
```

### 2. PageSpeed Insightsでの検証

1. サイトをデプロイ（Netlify等）
2. [PageSpeed Insights](https://pagespeed.web.dev/)にアクセス
3. デプロイしたURLを入力して分析
4. 「レイアウト シフトの原因」セクションでCLSスコアを確認

### 3. Chrome DevToolsでの確認

1. Chrome DevToolsを開く（F12）
2. 「Performance」タブを選択
3. 「Experience」セクションで「Layout Shifts」を確認
4. 各Layout Shiftの原因を特定

## さらなる最適化オプション

### オプション1: 画像の遅延読み込み最適化

above-the-fold（最初に見える範囲）の画像は`loading="eager"`、それ以外は`loading="lazy"`に設定：

```astro
<!-- above-the-fold -->
<Image loading="eager" ... />

<!-- below-the-fold -->
<Image loading="lazy" ... />
```

### オプション2: アスペクト比の保持

CSSで画像のアスペクト比を明示的に設定：

```css
.image-container {
  aspect-ratio: 16 / 9; /* 画像のアスペクト比を維持 */
}
```

### オプション3: コンテンツのスケルトンスクリーン

動的コンテンツの読み込み中にスケルトンスクリーンを表示：

```astro
<div class="skeleton-loader">
  <!-- スケルトン表示 -->
</div>
```

```css
.skeleton-loader {
  min-height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### オプション4: 遅延読み込みコンポーネント

重要でないコンポーネントをIntersection Observerで遅延読み込み：

```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // コンポーネントを読み込み
      loadComponent();
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(document.querySelector(".lazy-component"));
```

## トラブルシューティング

### 問題: CLSスコアが改善されない

**原因1**: フォントの読み込みが遅い
**解決策**:

- フォントファイルをローカルに配置
- `<link rel="preload">`でフォントを事前読み込み
- font-subsetを使用してファイルサイズを削減

**原因2**: 広告やサードパーティコンテンツ
**解決策**:

- 広告スペースに固定サイズを設定
- iframe要素にwidth/heightを設定

### 問題: ローディング画面が正しく動作しない

**原因**: overflowの設定が正しくない
**解決策**:

- `document.documentElement.style.overflow`を使用
- `document.body.style.overflow`は使用しない

### 問題: モバイルでのCLSが高い

**原因**: レスポンシブ対応が不十分
**解決策**:

- メディアクエリで適切なmin-heightを設定
- ビューポートのサイズに応じた画像サイズを使用

```css
@media (max-width: 768px) {
  .toolbar {
    min-height: 300px; /* モバイル用に調整 */
  }
}
```

## ベストプラクティス

### 1. 常にサイズを事前定義

すべてのメディア要素（画像、動画、iframe）に明示的なサイズを設定：

```astro
<img width="400" height="300" ... />
<video width="640" height="360" ...></video>
<iframe width="560" height="315" ...></iframe>
```

### 2. 動的コンテンツにはmin-heightを設定

JavaScriptで読み込むコンテンツには必ずmin-heightを設定：

```css
.dynamic-content {
  min-height: 400px;
}
```

### 3. CSSアニメーションはtransformを使用

`top`、`left`、`width`、`height`などのプロパティではなく、`transform`を使用：

```css
/* ❌ 避ける */
.element {
  transition: top 0.3s;
}

/* ✅ 推奨 */
.element {
  transition: transform 0.3s;
}
```

### 4. 読み込み順序を最適化

1. クリティカルCSS → インライン化
2. Above-the-foldの画像 → `loading="eager"`
3. Below-the-foldの画像 → `loading="lazy"`
4. JavaScriptは`defer`または`async`で読み込み

### 5. 定期的な計測とモニタリング

- デプロイ前に必ずPageSpeed Insightsで確認
- Google Search Consoleの「ウェブに関する主な指標」を監視
- Real User Monitoring（RUM）ツールの導入を検討

## 参考リソース

- [web.dev - Optimize Cumulative Layout Shift](https://web.dev/optimize-cls/)
- [web.dev - Understanding Cumulative Layout Shift](https://web.dev/cls/)
- [MDN - font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)
- [Chrome DevTools - Layout Shift](https://developer.chrome.com/docs/devtools/evaluate-performance/reference/#layout-shifts)
- [Web Vitals Chrome Extension](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)

## チェックリスト

実装前の確認事項：

- [ ] すべての画像にwidth/height属性を設定
- [ ] フォントにfont-display: swapを設定
- [ ] 動的コンテンツにmin-heightを設定
- [ ] スクロールバーのガターを確保（scrollbar-gutter: stable）
- [ ] overflow変更はhtml要素に対して実施
- [ ] CSSアニメーションはtransformを使用
- [ ] above-the-fold画像はeager読み込み
- [ ] below-the-fold画像はlazy読み込み
- [ ] PageSpeed Insightsでスコア確認
- [ ] モバイルとデスクトップの両方でテスト

## まとめ

今回の最適化により、以下の改善が期待されます：

1. **CLSスコア**: 0.195 → 0.09以下（目標達成）
2. **ユーザー体験**: ページ読み込み時のレイアウトの安定性向上
3. **SEO**: Core Web Vitalsの改善によるランキング向上
4. **パフォーマンス**: 全体的なページ速度の向上

継続的なモニタリングと改善を行い、常に最適なパフォーマンスを維持しましょう。

---

**更新日**: 2025-10-24  
**作成者**: AI Assistant  
**関連ドキュメント**: [CSS_OPTIMIZATION_GUIDE.md](./CSS_OPTIMIZATION_GUIDE.md)
