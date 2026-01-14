# レンダリングブロッキングCSS最適化（2025年改善版）

## 📊 問題の概要

PageSpeed Insightsで検出されたレンダリングブロッキングリソースにより、**推定660ミリ秒**の遅延が発生していました。

### 検出された問題

| リソース                     | サイズ   | 遅延時間 | 状態                                         |
| ---------------------------- | -------- | -------- | -------------------------------------------- |
| `netlify.app`                | 17.5 KiB | 900 ms   | ℹ️ Netlify側の制御外（CDN/ホスティング起因） |
| `/_astro/index.9Sbj_vNC.css` | 8.5 KiB  | 680 ms   | ✅ 非同期読み込みに最適化                    |
| `/_astro/index.C32ORiQr.css` | 9.0 KiB  | 230 ms   | ✅ 非同期読み込みに最適化                    |

---

## 🔧 実施した最適化

### 1. すべてのCSSファイルを非同期読み込みに変更

**変更内容：**

- 以前は `reset.css` と `global.css` を含む最初の2つのCSSファイルを同期的に読み込んでいました
- 今回の改善で、**すべてのCSSファイル**（`reset.css`、`global.css`、`index.*.css`を含む）を非同期読み込みに変更しました
- Critical CSSがインライン化されているため、すべてのCSSを非同期読み込み可能です

**変更ファイル：**

- `async-css-optimizer.js`

**実装コード：**

```javascript
// すべてのCSSファイルを非同期読み込み
// preload + onload パターンを使用（media="print" hackより推奨）
replacement = `<link rel="preload" href="${normalizedHref}" as="style" onload="this.onload=null;this.rel='stylesheet'" />\n<noscript><link rel="stylesheet" href="${normalizedHref}" /></noscript>`;
```

**メリット：**

- レンダリングブロッキング時間の大幅な削減
- Critical CSSがインライン化されているため、FOUC（Flash of Unstyled Content）を防止
- すべてのCSSが非同期読み込みされるため、初期レンダリングが高速化

---

### 2. Critical CSSの拡張

**変更内容：**

- Critical CSSにCSS変数の定義を追加しました
- これにより、初期レンダリング時にスタイルが正しく適用されます

**変更ファイル：**

- `src/layouts/HeadLayout.astro`

**追加されたCSS変数：**

```css
:root {
  --color-white: #f1f5f9;
  --color-black: #010101;
  --color-purple: #639;
  --color-red: #ff4f48;
  --color-blue: #0d0950;
  --color-gray: #808080;
  --accent: rgb(136 58 234);
  --accent-light: rgb(224 204 250);
  --accent-dark: rgb(49 10 101);
  --accent-gradient: linear-gradient(45deg, var(--accent), var(--accent-light) 30%, var(--color-white) 60%);
  --color-aqua: #0ff;
  --white: rgb(255 255 255);
  --angle: 90deg;
  --gradient-text: linear-gradient(
    var(--angle),
    rgb(238 161 255 / 1) 0%,
    rgb(147 183 255 / 1) 55%,
    rgb(170 244 254 / 1) 100%
  );
}
```

**効果：**

- 初期レンダリング時にCSS変数が利用可能になり、スタイルが正しく適用される
- FOUCの防止
- レイアウトシフトの最小化

---

### 3. preloadヒントの活用

**実装内容：**

- `async-css-optimizer.js`で、すべてのCSSファイルに `rel="preload"` を使用
- `onload` イベントで `rel="stylesheet"` に変換して適用
- レンダリングをブロックせずにCSSを読み込み可能

**メリット：**

- ブラウザが早期にCSSファイルを発見して読み込みを開始
- レンダリングをブロックせずにCSSを読み込み
- パフォーマンスの向上

---

## 📈 期待される改善効果

### パフォーマンスメトリクス

| メトリクス                         | 改善内容                                                          |
| ---------------------------------- | ----------------------------------------------------------------- |
| **FCP (First Contentful Paint)**   | Critical CSSインライン化により、初期レンダリングが高速化          |
| **LCP (Largest Contentful Paint)** | レンダリングブロッキングCSS削減により、最大コンテンツ表示が高速化 |
| **CLS (Cumulative Layout Shift)**  | Critical CSSとCSS変数の定義により、レイアウトシフトを最小化       |
| **TBT (Total Blocking Time)**      | CSSの非同期読み込みにより、メインスレッドのブロッキング時間削減   |

### 推定削減時間

- **すべてのCSSを非同期読み込み**: 約660msの削減（`index.*.css`ファイル）
- **Critical CSSの拡張**: 初期レンダリング時間の短縮
- **preloadヒント**: 早期読み込みによる体感速度向上
- **総合的な改善**: FCP、LCP、TTIの改善により、PageSpeed Insightsスコアの向上 ✨

---

## ⚠️ 注意事項

### `netlify.app` リソースについて

`netlify.app`というリソース（17.5 KiB、900ms）は、Netlify側の制御外の可能性があります。これは以下のいずれかの可能性があります：

1. **NetlifyのCDN/ホスティングサービス自体のリソース**
2. **Netlify Analyticsやその他のNetlifyサービス**
3. **Netlifyのアセット最適化プロセス**

このリソースについては、Netlifyの設定やドキュメントを確認する必要があります。

### ブラウザ互換性

- `rel="preload"` は主要ブラウザでサポート済み
- `<noscript>` によるフォールバックで古いブラウザにも対応
- `onload` イベントのフォールバック処理も実装済み

---

## 🔍 検証方法

### 1. ローカル確認

```bash
npm run build
npm run preview
```

### 2. PageSpeed Insights

1. https://pagespeed.web.dev/ にアクセス
2. サイトURLを入力して分析
3. 「レンダリングをブロックしているリクエスト」の項目を確認
4. 改善前と比較して、`index.*.css`ファイルが非同期読み込みになっていることを確認

### 3. Chrome DevTools

1. F12でDevToolsを開く
2. **Network** タブで CSS の読み込みタイミングを確認
3. **Performance** タブでレンダリングタイムラインを確認
4. CSSファイルが `preload` として読み込まれ、その後 `stylesheet` に変換されることを確認

---

## 📝 技術的な補足

### preload戦略の仕組み

```html
<link rel="preload" href="..." as="style" onload="this.onload=null;this.rel='stylesheet'" />
```

1. `rel="preload"` でリソースを非同期で先行読み込み
2. `as="style"` でCSSファイルとして認識
3. `onload` イベントで `rel="stylesheet"` に変更して適用
4. レンダリングをブロックせずにCSSを読み込み可能

### Critical CSSの重要性

Critical CSSをインライン化することで：

- 初期レンダリングに必要な最小限のCSSを即座に適用
- 外部CSSファイルの読み込みを待たずにページを表示
- FOUC（Flash of Unstyled Content）を防止

---

## 🚀 次のステップ（オプション）

さらなる最適化を検討する場合：

### 1. `netlify.app` リソースの調査

- Netlifyの設定を確認
- Netlify Analyticsやその他のサービスを無効化できるか確認
- 必要に応じてNetlifyサポートに問い合わせ

### 2. CSS の Tree Shaking

未使用のCSSを自動削除（PurgeCSS、UnCSS等）

### 3. Critical CSS の自動生成

ツール（Critical、Critters等）による自動最適化

### 4. HTTP/2 Server Push

サーバー側でCritical CSSを自動的にプッシュ

---

## 📚 参考資料

- [Google Web Fundamentals - Render-Blocking Resources](https://web.dev/render-blocking-resources/)
- [Critical Rendering Path Optimization](https://web.dev/critical-rendering-path/)
- [Understanding the Critical Path](https://web.dev/learn/performance/understanding-the-critical-path)
- [preload の使用法](https://developer.mozilla.org/ja/docs/Web/HTML/Attributes/rel/preload)

---

## ✨ まとめ

今回の最適化により、レンダリングブロッキングCSS問題が大幅に改善され、約**660ms**のパフォーマンス改善が期待できます。

すべての変更は既存のデザインを維持しながら実装されており、ユーザーエクスペリエンスの向上につながります。

PageSpeed Insightsで再測定し、スコアの改善を確認してください。🎉
