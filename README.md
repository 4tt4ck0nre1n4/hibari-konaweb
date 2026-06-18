# hibari-konaweb.com | Web制作・フロントエンド開発

Web制作・フロントエンド開発のポートフォリオサイトです。Astro + React + TypeScript で構築し、WordPress をヘッドレスCMSとして使用しています。Tailwind CSS v4 によるスタイリングに加え、構造化データ（JSON-LD）・`llms.txt` / `ai.txt` などによる **SEO・AI検索最適化** を施しています。

## 🌐 デモ

- **本番環境（Netlify）**: [https://hibari-konaweb.netlify.app](https://hibari-konaweb.netlify.app)

## ✨ 主な機能

- 📝 **ブログ機能**: WordPress REST APIから取得した記事を表示（一覧・詳細・ページネーション・カテゴリー一覧）
- 🎨 **Works紹介**: 制作実績の一覧と詳細ページ
- 👤 **About / Service ページ**: プロフィール・スキル紹介と、サービス内容・料金表の掲載
- 🧮 **料金シミュレーター + 見積書PDF**: `/service` で項目を選ぶだけで概算費用を算出し、その場で見積書PDFを生成・ダウンロード
- 📧 **お問い合わせフォーム**: Contact Form 7との連携（Cloudflare Turnstile、レート制限対応）
- 🔍 **サイト内検索**: Pagefindによる全文検索機能
- 🔎 **SEO・AI検索最適化**: 構造化データ（JSON-LD）、OGP、`sitemap` / `rss.xml` / `llms.txt` / `ai.txt` による発見性向上（詳細は後述）
- 📊 **Google Analytics 4**: アクセス解析の統合
- 🎬 **アニメーション**: GSAP、Rive、Particles.jsを使用したリッチなUI
- ♿ **アクセシビリティ**: スキップリンク、`eslint-plugin-jsx-a11y` による静的チェック
- 📱 **レスポンシブデザイン**: モバイルファーストのデザイン
- ⚡ **パフォーマンス最適化**: LCP、CLS、FCPなどのCore Web Vitalsを最適化
- 📄 **法務ページ**: プライバシーポリシーを掲載

## 🛠️ 技術スタック

### フロントエンド

- **[Astro](https://astro.build/) v6** - 静的サイトジェネレーター（`output: "static"`）
- **[React](https://react.dev/)** - UIライブラリ（アイランド構成）
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全性
- **[Tailwind CSS v4](https://tailwindcss.com/)** - ユーティリティCSS（`@tailwindcss/vite`）
- **[Sass](https://sass-lang.com/)** - CSSプリプロセッサ
- **[GSAP](https://gsap.com/)** - アニメーションライブラリ
- **[Rive](https://rive.app/)** - インタラクティブアニメーション
- **[Particles.js（tsParticles）](https://particles.js.org/)** - パーティクルエフェクト
- **[Swiper](https://swiperjs.com/)** - スライダーコンポーネント
- **[Iconify（astro-icon）](https://iconify.design/)** - アイコン（ローカルJSONから取得）
- **[Pagefind](https://pagefind.app/)** - サイト内検索

### フォーム・データ・PDF

- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** - フォーム状態管理と入力バリデーション
- **[Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)** - ボット対策（`@marsidev/react-turnstile`）
- **[jsPDF](https://github.com/parallax/jsPDF) / [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)** - 見積書PDFの生成・ダウンロード

### SEO・AI検索

- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** - サイトマップ自動生成
- **JSON-LD 構造化データ** - `src/components/seo/` および `src/util/jsonLd.ts`
- **機械可読エンドポイント** - `robots.txt` / `llms.txt` / `llms-full.txt` / `ai.txt` / `rss.xml`

### バックエンド・CMS

- **[WordPress](https://wordpress.org/)** - ヘッドレスCMS（REST API）
- **[Contact Form 7](https://contactform7.com/)** - お問い合わせフォーム

### デプロイ・ホスティング

- **[Netlify](https://www.netlify.com/)** - ホスティング・CI/CD
- **[GitHub Actions](https://github.com/features/actions)** - 自動デプロイ（オプション）

### 開発ツール

- **ESLint** - コード品質チェック（`eslint-plugin-astro` / `eslint-plugin-jsx-a11y` / `@wordpress/eslint-plugin` を併用）
- **Stylelint** - CSS品質チェック
- **Prettier** - コードフォーマッター

## 📋 前提条件

- **Node.js**: v22.12.0以上（`package.json` の `engines` で指定）
- **npm**: v9以上（またはyarn、pnpm）
- **WordPress**: ローカル開発環境（Local by Flywheel推奨）または本番環境

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/4tt4ck0nre1n4/hibari-konaweb.git
cd hibari-konaweb
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env`ファイルを作成し、必要な環境変数を設定します：

```bash
cp env.example.txt .env
```

`.env`ファイルを編集し、実際の値に置き換えてください。

詳細は [`env.example.txt`](./env.example.txt) を参照してください。

### 4. WordPressの起動

ローカル開発環境の場合、WordPressを起動してください：

- **Local by Flywheel**: サイトを起動
- または、本番環境のWordPress URLを使用

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:4321` にアクセスします。

### 6. Chrome DevToolsの設定

開発時に背景画像を正しく表示するため、DevToolsの設定が必要です。
詳細は[Chrome DevTools設定ガイド](docs/guides/DEVTOOLS_SETUP.md)を参照してください。

**重要**: Networkタブで「Disable cache」のチェックを外してください。

## 📜 利用可能なコマンド

| コマンド               | 説明                                                |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | 開発サーバーを起動（`localhost:4321`）              |
| `npm run dev:clean`    | キャッシュ削除後に開発サーバーを起動                |
| `npm run build`        | 本番用ビルド（Astro build + Pagefind索引生成）      |
| `npm run build:safe`   | 環境変数チェック + 型チェック付きビルド（推奨）     |
| `npm run build:check`  | 型チェック付きビルド                                |
| `npm run build:clean`  | キャッシュ削除後にビルド                            |
| `npm run preview`      | ビルド結果をローカルでプレビュー                    |
| `npm run check-env`    | 環境変数の設定を確認                                |
| `npm run lint`         | ESLintとStylelintを実行                             |
| `npm run eslint`       | ESLintのみを実行                                    |
| `npm run stylelint`    | Stylelintのみを実行                                 |
| `npm run stylelint:fix`| Stylelintを自動修正付きで実行                       |
| `npm run format`       | Prettierでコードをフォーマット                      |
| `npm run clean`        | ビルドキャッシュとdistを削除                        |

## 📁 プロジェクト構造

```text
hibari-konaweb/
├── public/              # 静的ファイル（画像、ファビコンなど）
├── src/
│   ├── api/            # API関連のユーティリティ（ヘッドレスCMS連携）
│   ├── assets/         # 画像、SVG、フォントなど
│   ├── components/     # Astro/Reactコンポーネント
│   │   └── seo/        # SEO/構造化データ用コンポーネント（PersonSchema など）
│   ├── config/         # サイト設定・料金・スキルなどの定数
│   ├── data/           # JSONデータファイル
│   ├── layouts/        # レイアウトコンポーネント
│   ├── pages/          # ページ・APIルート（robots.txt / llms.txt / rss.xml など）
│   ├── schemas/        # Zodスキーマ（APIレスポンス・設定の検証）
│   ├── scripts/        # クライアントサイドスクリプト
│   ├── styles/         # グローバルスタイル
│   ├── types/          # TypeScript型定義
│   └── util/           # ユーティリティ関数
├── docs/               # ドキュメント
│   ├── guides/         # セットアップ・デプロイガイド
│   ├── optimization/   # 最適化ガイド
│   ├── troubleshooting/# トラブルシューティング
│   └── features/       # 機能・使用方法ガイド
├── astro.config.mjs    # Astro設定ファイル
├── netlify.toml        # Netlify設定ファイル
└── package.json        # 依存関係とスクリプト
```

## 🌍 環境変数

### 必須環境変数

| 変数名              | 説明                     |
| ------------------- | ------------------------ |
| `PUBLIC_API_URL`    | WordPressのURL           |
| `PUBLIC_API_PREFIX` | REST APIのプレフィックス |

Local の WordPress が使えない場合は、`.env` の `PUBLIC_API_URL` を**本番と同じ WordPress の URL**（`https://` で公開されているサイト）に設定すれば、ローカルでも `npm run dev` / `npm run build` 時に REST API を取得できます。`env.example.txt` のコメントも参照してください。

Local が 502 などで全く使えず、**静的ビルドだけ通したい**場合は `.env` に `PUBLIC_BUILD_SKIP_WORDPRESS=true` を書くか、ビルド直前に環境変数として渡してください（例: `cmd /c "set PUBLIC_BUILD_SKIP_WORDPRESS=true&& npm run build:safe"`）。ブログ記事の `getStaticPaths` が失敗してもビルドは止まりません（その時点では記事詳細ページは生成されません）。**本番 Netlify では未設定のまま**にしてください。

### オプション環境変数

| 変数名                        | 説明                                       |
| ----------------------------- | ------------------------------------------ |
| `PUBLIC_BUILD_SKIP_WORDPRESS` | `true`/`1` で WordPress 取得失敗時もブログ静的パス生成をスキップ（ローカル用・本番では未設定推奨） |
| `PUBLIC_SITE_URL`            | canonical / サイトマップ / OGP の基準URL（未設定時は Netlify の `URL` を使用） |
| `PUBLIC_WPCF7_*`              | Contact Form 7の設定                       |
| `PUBLIC_TURNSTILE_SITE_KEY`   | Cloudflare Turnstileのサイトキー（セキュリティ対策） |
| `PUBLIC_GA_MEASUREMENT_ID`    | Google Analytics 4の測定ID                 |

詳細は [`docs/guides/NETLIFY_ENV_SETUP.md`](./docs/guides/NETLIFY_ENV_SETUP.md) を参照してください。

## 🚢 デプロイ

### Netlifyへのデプロイ

1. **環境変数の設定**

   - Netlifyダッシュボード → Site Settings → Environment Variables
   - 必須環境変数を設定

2. **GitHubにプッシュ**

   ```bash
   git push origin main
   ```

   Netlifyが自動的にビルド・デプロイを実行します。

詳細は [`docs/guides/NETLIFY_SETUP_GUIDE.md`](./docs/guides/NETLIFY_SETUP_GUIDE.md) を参照してください。

### ローカルビルド + Netlify CLI

```bash
npm run build:safe
npx netlify deploy --prod --dir=dist
```

詳細は [`docs/guides/QUICK_DEPLOY_GUIDE.md`](./docs/guides/QUICK_DEPLOY_GUIDE.md) を参照してください。

## 🔒 セキュリティ対策

サイト全体および お問い合わせフォームに以下のセキュリティ対策を実装しています：

- **SSL化（HTTPS）**: すべての通信を暗号化
- **CSP（Content-Security-Policy）**: `<meta>` で配信。開発環境と本番環境でポリシーを切り替え（[`src/layouts/HeadLayout.astro`](./src/layouts/HeadLayout.astro)）
- **Cloudflare Turnstile**: ボット対策（ユーザーに気づかれない形で動作）
- **レート制限**: 短時間での連続送信を防止（1分間に最大3回）
- **バリデーション**: クライアント側（React Hook Form + Zod）・サーバー側の二重バリデーション
- **CSRF対策**: Contact Form 7による自動的なCSRF対策

詳細は [`docs/guides/SECURITY_SETUP_GUIDE.md`](./docs/guides/SECURITY_SETUP_GUIDE.md) を参照してください。

## 🔎 SEO・AI検索最適化

検索エンジンと AI（生成AI・AI検索）の双方に正しく理解・引用されることを目的に、メタ情報・構造化データ・機械可読エンドポイントを整備しています。

### メタ情報（[`src/layouts/HeadLayout.astro`](./src/layouts/HeadLayout.astro)）

- `canonical` と `og:url` を一致させた正規URLの出力
- Open Graph / Twitter Card（`og:image` の幅・高さ・alt、`twitter:image:alt` を含む）
- ブログ・実績の詳細では `og:type="article"` とし、`article:published_time` / `modified_time` / `author` / `section` / `tag` を出力
- RSSフィードへの `rel="alternate"`
- 準備中・404・500・thanks などのページには `noindex` を付与

### 構造化データ（JSON-LD）

全ページ共通で運営者・サイト情報を、各ページではコンテンツ種別に応じた型を出力します（生成補助: [`src/util/jsonLd.ts`](./src/util/jsonLd.ts)）。

- 全ページ共通: `Person`（[`PersonSchema.astro`](./src/components/seo/PersonSchema.astro)）、`WebSite`（[`WebSiteSchema.astro`](./src/components/seo/WebSiteSchema.astro)）
- ブログ詳細: `BlogPosting`
- 実績詳細: `CreativeWork`
- サービス: `Service` + `OfferCatalog`
- ブログ/実績/カテゴリー一覧: `CollectionPage` + `ItemList`
- パンくず: `BreadcrumbList`

### 機械可読エンドポイント（`src/pages/`）

| エンドポイント        | 役割                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| `/robots.txt`         | クロール方針。主要なAIクローラ（GPTBot、ClaudeBot、PerplexityBot など）を明示的に許可し、`Sitemap` / `LLMS` / `AI-Policy` / `RSS` のURLを案内 |
| `/sitemap-index.xml`  | `@astrojs/sitemap` による自動生成サイトマップ                        |
| `/rss.xml`            | WordPressの記事から生成するRSS 2.0フィード（日付降順）               |
| `/llms.txt`           | AI向けのサイト概要・主要ページ・引用方針（日英併記）                 |
| `/llms-full.txt`      | 記事一覧を含む詳細版                                                 |
| `/ai.txt`             | AIクローラ向けポリシー（非公開情報を使わない方針など、日英併記）     |

### 検証

SEO・AI検索向けの変更は、WordPress API に依存するページの性質上、ローカルでの目視確認を前提とせず**本番（またはステージング）で検証**します。手順とチェック項目は [`docs/guides/SEO_AI_SEARCH_VALIDATION.md`](./docs/guides/SEO_AI_SEARCH_VALIDATION.md) を参照してください。

## 📚 ドキュメント

プロジェクトの詳細なドキュメントは [`docs/`](./docs/) ディレクトリにあります。

- 📖 [セットアップ・デプロイガイド](./docs/guides/)
- 🔒 [セキュリティ対策ガイド](./docs/guides/SECURITY_SETUP_GUIDE.md)
- 🔎 [SEO・AI検索 本番検証チェックリスト](./docs/guides/SEO_AI_SEARCH_VALIDATION.md)
- ⚡ [最適化ガイド](./docs/optimization/)
- 🔧 [トラブルシューティング](./docs/troubleshooting/)
- 🎨 [機能・使用方法ガイド](./docs/features/)

## 🔧 トラブルシューティング

よくある問題と解決方法は [`docs/troubleshooting/`](./docs/troubleshooting/) を参照してください。

- [404エラーの解決方法](./docs/troubleshooting/TROUBLESHOOTING_404_ERRORS.md)
- [環境変数の設定](./docs/guides/NETLIFY_ENV_SETUP.md)
- [WordPressビルド手順](./docs/guides/BUILD_WITH_WORDPRESS_GUIDE.md)

## 🤝 コントリビューション

バグ報告や機能要望は、GitHubのIssueでお知らせください。

## 📄 ライセンス

このプロジェクトは個人のポートフォリオサイトです。

## 👤 作成者

### hibari-konaweb

- ポートフォリオ: [https://hibari-konaweb.netlify.app](https://hibari-konaweb.netlify.app)
- 拠点: 千葉県袖ケ浦市

---

**「納期厳守」「迅速・丁寧なコミュニケーション」「細部までの品質のこだわり」を大切にしています。**
