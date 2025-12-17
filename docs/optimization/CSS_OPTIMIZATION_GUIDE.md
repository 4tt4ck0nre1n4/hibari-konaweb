# CSS最適化ガイド - レンダリングブロック削減

## 概要

PageSpeed Insightsで検出された「レンダリングをブロックしているリクエスト」の問題を解決するための最適化を実装しました。推定削減時間: **980ミリ秒**

## 実装済みの最適化

### 1. Astroのインラインスタイルシート機能（自動）

**ファイル**: `astro.config.mjs`

```javascript
build: {
  format: "file",
  inlineStylesheets: "auto", // 自動的に小さなCSSをインライン化
}
```

**効果**:

- 6KB未満のCSSファイルを自動的にHTMLにインライン化
- HTTPリクエスト数を削減
- 初期レンダリング速度の向上

### 2. CSSコード分割と最小化

**ファイル**: `astro.config.mjs`

```javascript
vite: {
  build: {
    cssCodeSplit: true,  // CSSコード分割を有効化
    cssMinify: true,      // CSSの最小化を有効化
  }
}
```

**効果**:

- 各ページで必要なCSSのみを読み込み
- ファイルサイズの削減
- キャッシュ効率の向上

### 3. 遅延読み込みスクリプト

**ファイル**: `src/layouts/HeadLayout.astro`

非クリティカルなCSSを遅延読み込みするためのスクリプトを追加しました。

**効果**:

- 初期レンダリングに不要なCSSを後から読み込み
- First Contentful Paint (FCP) の改善
- Largest Contentful Paint (LCP) の改善

## 検証方法

### 1. ビルドを実行

```bash
npm run build
```

### 2. ビルド結果を確認

`dist/` ディレクトリ内のHTMLファイルを確認し、小さなCSSがインライン化されているか確認

### 3. PageSpeed Insightsで再テスト

1. [PageSpeed Insights](https://pagespeed.web.dev/)にアクセス
2. デプロイしたサイトのURLを入力
3. 「レンダリングをブロックしているリクエスト」の改善を確認

## さらなる最適化オプション

### オプション1: すべてのCSSをインライン化（小規模サイト向け）

総CSSサイズが50KB未満の場合に推奨：

```javascript
// astro.config.mjs
build: {
  inlineStylesheets: "always", // すべてのCSSをインライン化
}
```

**メリット**:

- CSSのHTTPリクエストが完全にゼロに
- 最高の初期表示速度

**デメリット**:

- HTMLファイルサイズが増加
- ブラウザのCSSキャッシュが効かない

### オプション2: クリティカルCSS手動抽出

大規模サイトで推奨：

1. [Critical CSS Generator](https://www.sitelocity.com/critical-path-css-generator)などのツールを使用
2. above-the-fold（最初に見える部分）のCSSのみを抽出
3. `HeadLayout.astro`の`<style>`タグに直接記述
4. 残りのCSSを`media="print"`で読み込み、JavaScriptで`media="all"`に変更

```astro
<head>
  <!-- クリティカルCSS -->
  <style is:inline>
    /* above-the-foldのCSSをここに */
  </style>

  <!-- 非クリティカルCSS -->
  <link rel="preload" href="/_astro/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/_astro/main.css" /></noscript>
</head>
```

### オプション3: 外部ライブラリのCSSを遅延読み込み

Swiper.jsなどの大きなライブラリのCSSは、必要なページでのみ読み込むか、遅延読み込みにする：

```astro
<!-- 通常の読み込み（ブロッキング） -->
<link rel="stylesheet" href="/_astro/swiper-bundle.css" />

<!-- 遅延読み込み（非ブロッキング） -->
<link rel="preload" href="/_astro/swiper-bundle.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="/_astro/swiper-bundle.css" /></noscript>
```

### オプション4: フォントの最適化

Google Fontsなどを使用している場合：

```astro
<head>
  <!-- DNS事前接続 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- フォントの遅延読み込み -->
  <link
    rel="preload"
    href="https://fonts.googleapis.com/css2?family=..."
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=..." /></noscript>
</head>
```

## パフォーマンス目標

| 指標                           | 改善前 | 目標    |
| ------------------------------ | ------ | ------- |
| レンダリングブロッキング時間   | 980ms  | < 200ms |
| First Contentful Paint (FCP)   | -      | < 1.8s  |
| Largest Contentful Paint (LCP) | -      | < 2.5s  |
| Cumulative Layout Shift (CLS)  | -      | < 0.1   |

## トラブルシューティング

### 問題: スタイルが適用されない

**原因**: CSSの読み込み順序の問題
**解決策**: `inlineStylesheets: "never"`に設定して、元の動作に戻す

### 問題: FOUCが発生する（Flash of Unstyled Content）

**原因**: クリティカルCSSが不足
**解決策**: above-the-foldのCSSをインライン化する

### 問題: ビルドサイズが増加した

**原因**: すべてのCSSがインライン化されている
**解決策**: `inlineStylesheets: "auto"`に変更（デフォルト設定）

## 参考リソース

- [Astro - CSS & Styling](https://docs.astro.build/en/guides/styling/)
- [web.dev - Defer non-critical CSS](https://web.dev/defer-non-critical-css/)
- [web.dev - Optimize Largest Contentful Paint](https://web.dev/optimize-lcp/)
- [Critical CSS Tools](https://github.com/addyosmani/critical)

## 次のステップ

1. ✅ Astroのビルド設定を最適化（完了）
2. ✅ CSSの遅延読み込みスクリプトを追加（完了）
3. ⏳ サイトをビルドしてデプロイ
4. ⏳ PageSpeed Insightsで検証
5. ⏳ 必要に応じてさらなる最適化を実施

---

**更新日**: 2025-10-24
**作成者**: AI Assistant
