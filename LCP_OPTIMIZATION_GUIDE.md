# LCP最適化ガイド - Largest Contentful Paint改善

## 概要

PageSpeed Insightsで検出された「LCP リクエストの検出」の問題を解決するための最適化を実装しました。

**LCP要素**: 背景画像 `/_astro/background.CaqnolZ1U2zU8.webp`  
**要素**: `<div id="main-container" style="background-image: url(...)">`

## LCP（Largest Contentful Paint）とは

LCPは、ページの読み込みパフォーマンスを測定する重要な指標で、ビューポート内で最も大きなコンテンツ要素が表示されるまでの時間を測定します。

### LCPの目標値

| 評価       | LCPスコア     |
| ---------- | ------------- |
| 良好       | < 2.5秒       |
| 改善が必要 | 2.5秒 - 4.0秒 |
| 不良       | > 4.0秒       |

## 問題の分析

PageSpeed Insightsの診断結果：

| 項目                                            | 状態       | 説明                                        |
| ----------------------------------------------- | ---------- | ------------------------------------------- |
| ✅ 遅延読み込みが適用されていません             | 良好       | LCP要素に`loading="lazy"`が適用されていない |
| ❌ `fetchpriority=high`を適用する必要があります | **要改善** | ブラウザに優先読み込みを指示する必要がある  |
| ✅ リクエストは最初のドキュメントで検出可能です | 良好       | HTML解析時に検出可能                        |

### 背景画像がLCP要素の問題点

1. **検出の遅延**: 背景画像はCSSを解析するまでブラウザが存在を知ることができない
2. **優先度の低さ**: デフォルトでは通常の画像より優先度が低い
3. **プリロードの欠如**: `<img>`タグと異なり、自動的なプリロードが行われない

## 実装した解決策

### 1. LCP背景画像のプリロード

**ファイル**: `src/pages/index.astro`

```astro
const backgroundImage = await getImage({ src: backgroundImageSrc });
---

<Layout ...>
  <!-- LCP背景画像のプリロード（PageSpeed Insights最適化） -->
  <link
    slot="head"
    rel="preload"
    href={backgroundImage.src}
    as="image"
    fetchpriority="high"
  />

  <div id="outer-container">
    ...
  </div>
</Layout>
```

**重要なポイント**:

- `rel="preload"`: ブラウザにリソースを事前読み込みするよう指示
- `as="image"`: リソースタイプを明示（正しい優先度設定のため）
- `fetchpriority="high"`: 最高優先度で読み込みを指示
- `slot="head"`: Astroのslot機能でhead要素に配置

### 2. Layout.astroでheadスロットを渡す

**ファイル**: `src/layouts/Layout.astro`

```astro
<HeadLayout title={title} ...>
  <slot name="head" slot="head" />
</HeadLayout>
```

**説明**: ページ固有のhead要素をHeadLayoutコンポーネントに渡す

### 3. HeadLayout.astroでスロットを受け取る

**ファイル**: `src/layouts/HeadLayout.astro`

```astro
<head>
  <!-- 既存のmeta要素など -->
  ...

  <!-- ページ固有の追加head要素（LCP最適化など） -->
  <slot name="head" />

  <!-- CSSの遅延読み込み用スクリプト -->
  ...
</head>
```

**説明**: 各ページから渡された追加のhead要素を配置

## 期待される効果

### Before（最適化前）

```
1. HTMLダウンロード
2. CSSダウンロード開始
3. CSS解析
4. 背景画像の存在を検出 ← ここで初めて検出
5. 背景画像のダウンロード開始
6. LCP発生（遅い）
```

### After（最適化後）

```
1. HTMLダウンロード
2. <link rel="preload">で背景画像の事前読み込み開始 ← 早期に開始
3. CSSダウンロード（並行）
4. 背景画像のダウンロード完了（すでに取得済み）
5. LCP発生（早い）
```

### パフォーマンス改善の期待値

- **LCPスコア**: 推定500ms～1000msの改善
- **First Contentful Paint (FCP)**: 副次的な改善
- **総合スコア**: モバイル・デスクトップ両方で向上

## 他のページでの適用方法

### 静的な画像の場合

背景画像が静的で変わらない場合：

```astro
<Layout ...>
  <link slot="head" rel="preload" href="/path/to/image.webp" as="image" fetchpriority="high" />
</Layout>
```

### imgタグのLCP画像の場合

`<img>`タグがLCP要素の場合：

```astro
<img src="..." alt="..." loading="eager" <!-- lazyではなくeager -- />
fetchpriority="high" <!-- 追加 -->
width="..." height="..." />
```

**注意**: `loading="lazy"`は**LCP要素には絶対に使用しない**

### 動的に変わる背景画像の場合

ページごとに背景画像が異なる場合：

1. 各ページでgetImage()を使用
2. slot="head"でプリロードリンクを追加
3. `fetchpriority="high"`を必ず設定

## さらなる最適化オプション

### オプション1: 画像フォーマットの最適化

最新の画像フォーマットを使用：

```astro
<picture>
  <source type="image/avif" srcset="image.avif" />
  <source type="image/webp" srcset="image.webp" />
  <img src="image.jpg" alt="..." fetchpriority="high" />
</picture>
```

**サポート状況**:

- AVIF: 最新ブラウザ（最高圧縮率）
- WebP: ほぼすべてのモダンブラウザ
- JPEG/PNG: フォールバック用

### オプション2: 画像サイズの最適化

レスポンシブ画像を使用：

```astro
<img
  srcset="
    image-small.webp 640w,
    image-medium.webp 1024w,
    image-large.webp 1920w
  "
  sizes="100vw"
  src="image-medium.webp"
  alt="..."
  fetchpriority="high"
/>
```

### オプション3: CDNの活用

画像をCDNから配信してレイテンシを削減：

```astro
<link
  rel="preload"
  href="https://cdn.example.com/optimized-image.webp"
  as="image"
  fetchpriority="high"
  crossorigin="anonymous"
/>
```

### オプション4: 背景画像から<img>タグへの変更

可能であれば、背景画像を`<img>`タグに変更することで、より最適化しやすくなります：

```astro
<!-- Before -->
<div style="background-image: url(...)"></div>

<!-- After -->
<div class="image-container">
  <img src="..." alt="..." fetchpriority="high" class="background-image" />
</div>
```

```css
.image-container {
  position: relative;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}
```

**メリット**:

- より細かい制御が可能
- `srcset`や`sizes`が使用可能
- ネイティブの遅延読み込みサポート
- より良いアクセシビリティ

## 検証方法

### 1. ビルドとプレビュー

```bash
npm run build
npm run preview
```

### 2. ブラウザのNetwork DevToolsで確認

1. Chrome DevToolsを開く（F12）
2. Networkタブを選択
3. Disable cacheをチェック
4. ページをリロード
5. 背景画像のリクエストを確認
   - **Priority**: Highになっているか
   - **Initiator**: `<link rel="preload">`から開始されているか

### 3. PageSpeed Insightsで検証

1. サイトをデプロイ
2. [PageSpeed Insights](https://pagespeed.web.dev/)でテスト
3. 「LCP リクエストの検出」セクションを確認
   - ✅ `fetchpriority=high`が適用されているか
   - LCPスコアが改善されているか

### 4. Lighthouse（Chrome DevTools）で確認

1. Chrome DevToolsのLighthouseタブ
2. "Analyze page load"を実行
3. LCPスコアを確認
4. 「Opportunities」セクションで改善が反映されているか確認

## トラブルシューティング

### 問題: プリロードが効かない

**原因1**: パスが間違っている  
**解決策**:

```bash
# ビルド後のHTMLを確認
cat dist/index.html | grep "preload"
# パスが正しいか確認
```

**原因2**: Content-Security-Policyで画像がブロックされている  
**解決策**: CSPに`img-src`ディレクティブを追加

```astro
<meta http-equiv="Content-Security-Policy" content="...; img-src 'self' data: https:; ..." />
```

### 問題: LCPスコアが改善されない

**原因1**: 画像サイズが大きすぎる  
**解決策**:

- 画像を圧縮（TinyPNG、Squooshなど）
- WebP/AVIFフォーマットに変換
- レスポンシブ画像を使用

**原因2**: サーバーのレスポンスが遅い  
**解決策**:

- CDNを使用
- 画像の最適化
- キャッシュヘッダーの設定

**原因3**: 他のリソースが優先されている  
**解決策**:

- 不要なJavaScriptを削除または遅延読み込み
- クリティカルではないCSSを遅延読み込み

### 問題: モバイルとデスクトップで異なる結果

**原因**: デバイスによってLCP要素が異なる  
**解決策**:

- レスポンシブ画像を使用
- メディアクエリで適切な画像を配信

```astro
<link rel="preload" href="mobile-image.webp" as="image" media="(max-width: 768px)" fetchpriority="high" />
<link rel="preload" href="desktop-image.webp" as="image" media="(min-width: 769px)" fetchpriority="high" />
```

## ベストプラクティス

### 1. LCP要素は1つだけfetchpriority="high"に設定

複数の要素に`fetchpriority="high"`を設定すると効果が薄れます：

```astro
<!-- ❌ 避ける -->
<img src="image1.jpg" fetchpriority="high" />
<img src="image2.jpg" fetchpriority="high" />
<img src="image3.jpg" fetchpriority="high" />

<!-- ✅ 推奨 -->
<img src="lcp-image.jpg" fetchpriority="high" />
<img src="image2.jpg" loading="lazy" />
<img src="image3.jpg" loading="lazy" />
```

### 2. Above-the-fold画像のみeager読み込み

最初に見える画像のみを積極的に読み込む：

```astro
<!-- Above-the-fold（最初に見える） -->
<img src="hero.jpg" loading="eager" fetchpriority="high" />

<!-- Below-the-fold（スクロールしないと見えない） -->
<img src="content.jpg" loading="lazy" />
```

### 3. 画像の寸法を必ず指定

CLSを防ぐために、すべての画像に`width`と`height`を設定：

```astro
<img src="..." alt="..." width="1200" height="630" fetchpriority="high" />
```

### 4. 適切な画像フォーマットを選択

| フォーマット | 用途               | 圧縮率 | ブラウザサポート |
| ------------ | ------------------ | ------ | ---------------- |
| AVIF         | 写真、イラスト     | 最高   | 最新ブラウザ     |
| WebP         | 写真、イラスト     | 高     | ほぼすべて       |
| JPEG         | 写真               | 中     | すべて           |
| PNG          | イラスト、透明背景 | 低     | すべて           |

### 5. プリロードの優先順位

```html
<head>
  <!-- 1. LCP画像（最優先） -->
  <link rel="preload" href="lcp-image.webp" as="image" fetchpriority="high" />

  <!-- 2. クリティカルフォント -->
  <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin />

  <!-- 3. クリティカルCSS（インライン化推奨） -->
  <style>
    /* critical css */
  </style>

  <!-- 4. その他のCSS -->
  <link rel="stylesheet" href="main.css" />
</head>
```

## パフォーマンス目標

| 指標                           | 改善前 | 目標   | 期待される改善      |
| ------------------------------ | ------ | ------ | ------------------- |
| Largest Contentful Paint (LCP) | -      | < 2.5s | 500ms～1000msの改善 |
| First Contentful Paint (FCP)   | -      | < 1.8s | 副次的な改善        |
| Speed Index                    | -      | < 3.4s | 改善                |
| Time to Interactive (TTI)      | -      | < 3.8s | 改善                |

## 関連する最適化

LCPを最大限に改善するために、以下の最適化も併せて実施することを推奨：

1. ✅ **CSS最適化** - [CSS_OPTIMIZATION_GUIDE.md](./CSS_OPTIMIZATION_GUIDE.md)

   - レンダリングブロッキングCSSの削減
   - クリティカルCSSのインライン化

2. ✅ **CLS最適化** - [CLS_OPTIMIZATION_GUIDE.md](./CLS_OPTIMIZATION_GUIDE.md)

   - レイアウトシフトの防止
   - スクロールバーの対応

3. ⏳ **JavaScript最適化**

   - 不要なJavaScriptの削除
   - コード分割と遅延読み込み

4. ⏳ **サーバー最適化**
   - CDNの活用
   - HTTP/2、HTTP/3の有効化
   - 画像の最適化と圧縮

## 参考リソース

- [web.dev - Optimize Largest Contentful Paint](https://web.dev/optimize-lcp/)
- [web.dev - Preload critical assets](https://web.dev/preload-critical-assets/)
- [MDN - fetchpriority](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority)
- [Chrome Developers - Priority Hints](https://web.dev/priority-hints/)
- [Astro - Image Optimization](https://docs.astro.build/en/guides/images/)

## チェックリスト

実装前の確認事項：

- [ ] LCP要素を特定（PageSpeed Insightsで確認）
- [ ] LCP要素が`<img>`か背景画像かを確認
- [ ] `<link rel="preload">`でLCP画像をプリロード
- [ ] `fetchpriority="high"`を設定
- [ ] `loading="lazy"`がLCP要素に適用されていないことを確認
- [ ] 画像サイズを最適化（WebP/AVIF使用）
- [ ] width/height属性を設定（CLS対策）
- [ ] Above-the-fold画像のみeager読み込み
- [ ] PageSpeed InsightsでLCPスコア確認
- [ ] モバイルとデスクトップの両方でテスト

## まとめ

今回の最適化により、以下の改善が期待されます：

1. **LCPスコア**: 500ms～1000msの改善見込み
2. **ユーザー体験**: コンテンツの表示速度向上
3. **SEO**: Core Web Vitalsの改善によるランキング向上
4. **コンバージョン**: ページ速度改善による離脱率低下

継続的なモニタリングと改善を行い、常に最適なパフォーマンスを維持しましょう。

---

**更新日**: 2025-10-24  
**作成者**: AI Assistant  
**関連ドキュメント**:

- [CSS_OPTIMIZATION_GUIDE.md](./CSS_OPTIMIZATION_GUIDE.md)
- [CLS_OPTIMIZATION_GUIDE.md](./CLS_OPTIMIZATION_GUIDE.md)
