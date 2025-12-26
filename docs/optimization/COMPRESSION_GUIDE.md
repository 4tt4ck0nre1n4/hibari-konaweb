# 圧縮（Compression）最適化ガイド

## 概要

このドキュメントでは、Astroプロジェクトにおける圧縮（gzip/brotli）の最適化方法と、PageSpeed Insightsへの影響について説明します。

## MinifyとCompressionの違い

### Minify（縮小化）
- **目的**: コードから不要な空白、コメント、改行を削除
- **対象**: ソースコード（CSS、JavaScript）
- **効果**: ファイルサイズを10-30%削減
- **現在の設定**: `astro.config.mjs`で有効化済み
  - `minify: "esbuild"`（JavaScript）
  - `cssMinify: true`（CSS）

### Compression（圧縮）
- **目的**: 転送時のファイルサイズを削減（HTTPレスポンスレベル）
- **対象**: すべてのテキストベースファイル（HTML、CSS、JS、JSON、XMLなど）
- **効果**: 転送サイズを60-80%削減
- **現在の設定**: Netlifyが自動的に処理（デフォルト有効）

## Netlifyでの圧縮設定

### 自動圧縮

Netlifyは**デフォルトで自動的にgzipとbrotli圧縮を有効化**しています。追加の設定は通常不要です。

#### 圧縮されるファイル
- HTML（`.html`）
- CSS（`.css`）
- JavaScript（`.js`）
- JSON（`.json`）
- XML（`.xml`）
- SVG（`.svg`）
- テキストファイル（`.txt`、`.md`など）

#### 圧縮アルゴリズム
1. **Brotli**（優先）: より高い圧縮率（最新ブラウザ対応）
2. **Gzip**（フォールバック）: 広くサポートされている圧縮形式

### 圧縮の確認方法

#### 方法1: ブラウザの開発者ツール

1. サイトを開く
2. 開発者ツール（F12）を開く
3. **Network**タブを選択
4. ページを再読み込み
5. ファイルを選択して**Headers**タブを確認

**確認ポイント**:
- `Content-Encoding: br`（Brotli）または `Content-Encoding: gzip`
- `Content-Length`と実際の転送サイズを比較

#### 方法2: cURLコマンド

```bash
# Brotli圧縮をサポートする場合
curl -H "Accept-Encoding: br" -I https://your-site.netlify.app/_astro/index.js

# Gzip圧縮を確認
curl -H "Accept-Encoding: gzip" -I https://your-site.netlify.app/_astro/index.js
```

#### 方法3: オンラインツール

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

## PageSpeed Insightsへの影響

### 期待される改善

圧縮により、以下の指標が改善されます：

| 指標 | 改善理由 |
|------|----------|
| **LCP (Largest Contentful Paint)** | リソースの転送時間短縮 |
| **FCP (First Contentful Paint)** | HTML/CSSの読み込み速度向上 |
| **TTI (Time to Interactive)** | JavaScriptの転送時間短縮 |
| **TBT (Total Blocking Time)** | JSファイルの読み込み時間短縮 |
| **スコア全体** | 転送サイズ削減による総合的な改善 |

### 実際の効果例

一般的なAstroプロジェクトの場合：

- **CSSファイル**: 50KB → 12KB（76%削減）
- **JavaScriptファイル**: 200KB → 60KB（70%削減）
- **HTMLファイル**: 30KB → 8KB（73%削減）

## さらなる最適化（オプション）

### ビルド時圧縮（通常は不要）

Netlifyの自動圧縮で十分ですが、さらに最適化したい場合、ビルド時に圧縮ファイルを事前生成することも可能です。

#### vite-plugin-compressionの使用

```bash
npm install -D vite-plugin-compression
```

`vite.config.js`に追加：

```javascript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // 1KB以上のファイルのみ圧縮
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],
});
```

**注意**: 通常はNetlifyの自動圧縮で十分なため、この方法は推奨しません。

## トラブルシューティング

### 圧縮が有効になっていない場合

1. **Netlifyの設定を確認**
   - `netlify.toml`で`skip_processing = false`を確認
   - デプロイログでエラーがないか確認

2. **ファイルタイプを確認**
   - 画像ファイル（JPEG、PNG、WebP）は既に圧縮されているため、HTTP圧縮の対象外
   - テキストベースファイルのみが圧縮対象

3. **キャッシュをクリア**
   - ブラウザキャッシュをクリア
   - NetlifyのCDNキャッシュをクリア（デプロイで自動的にクリアされる）

### 圧縮率が低い場合

- Minifyが正しく動作しているか確認（`astro.config.mjs`）
- ソースコードに冗長な部分がないか確認
- 不要なコードやライブラリがないか確認

## ベストプラクティス

1. **MinifyとCompressionの両方を有効化**
   - Minify: ビルド時のコード最適化
   - Compression: 転送時の圧縮
   - 両方を組み合わせることで最大の効果が得られます

2. **圧縮対象ファイルの最適化**
   - 不要なコードを削除
   - 使用していないライブラリを削除
   - Tree-shakingを活用

3. **適切なキャッシュ設定**
   - 静的アセットには長期間のキャッシュを設定
   - `netlify.toml`のヘッダー設定を確認

4. **定期的な確認**
   - PageSpeed Insightsで定期的にスコアを確認
   - ネットワークタブで転送サイズを確認

## 参考リンク

- [Netlify: Asset optimization](https://docs.netlify.com/site-deploys/post-processing/asset-optimization/)
- [MDN: Content-Encoding](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Content-Encoding)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Astro: Build Configuration](https://docs.astro.build/en/guides/configuring-astro/#build-options)
