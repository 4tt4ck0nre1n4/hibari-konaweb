# My Portfolio Site

ポートフォリオサイトです。Astro + React + TypeScriptで構築され、WordPressをヘッドレスCMSとして使用しています。

## 🌐 デモ

- **本番環境**: [https://hibari-konaweb.netlify.app](https://hibari-konaweb.netlify.app)

## ✨ 主な機能

- 📝 **ブログ機能**: WordPress REST APIから取得した記事を表示
- 🎨 **Works紹介**: 作品一覧と詳細ページ
- 📧 **お問い合わせフォーム**: Contact Form 7との連携（reCAPTCHA v3、レート制限対応）
- 🔍 **サイト内検索**: Pagefindによる全文検索機能
- 📊 **Google Analytics 4**: アクセス解析の統合
- 🎬 **アニメーション**: GSAP、Rive、Particles.jsを使用したリッチなUI
- 📱 **レスポンシブデザイン**: モバイルファーストのデザイン
- ⚡ **パフォーマンス最適化**: LCP、CLS、FCPなどのCore Web Vitalsを最適化

## 🛠️ 技術スタック

### フロントエンド

- **[Astro](https://astro.build/)** - 静的サイトジェネレーター
- **[React](https://react.dev/)** - UIライブラリ
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全性
- **[GSAP](https://gsap.com/)** - アニメーションライブラリ
- **[Rive](https://rive.app/)** - インタラクティブアニメーション
- **[Particles.js](https://particles.js.org/)** - パーティクルエフェクト
- **[Swiper](https://swiperjs.com/)** - スライダーコンポーネント
- **[Pagefind](https://pagefind.app/)** - サイト内検索

### バックエンド・CMS

- **[WordPress](https://wordpress.org/)** - ヘッドレスCMS（REST API）
- **[Contact Form 7](https://contactform7.com/)** - お問い合わせフォーム

### デプロイ・ホスティング

- **[Netlify](https://www.netlify.com/)** - ホスティング・CI/CD
- **[GitHub Actions](https://github.com/features/actions)** - 自動デプロイ（オプション）

### 開発ツール

- **ESLint** - コード品質チェック
- **Stylelint** - CSS品質チェック
- **Prettier** - コードフォーマッター
- **Sass** - CSSプリプロセッサ

## 📋 前提条件

- **Node.js**: v20以上
- **npm**: v9以上（またはyarn、pnpm）
- **WordPress**: ローカル開発環境（Local by Flywheel推奨）または本番環境

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/hibari-konaweb.git
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

| コマンド             | 説明                                   |
| -------------------- | -------------------------------------- |
| `npm run dev`        | 開発サーバーを起動（`localhost:4321`） |
| `npm run build`      | 本番用ビルドを実行                     |
| `npm run build:safe` | 環境変数チェック付きビルド（推奨）     |
| `npm run preview`    | ビルド結果をローカルでプレビュー       |
| `npm run check-env`  | 環境変数の設定を確認                   |
| `npm run lint`       | ESLintとStylelintを実行                |
| `npm run format`     | Prettierでコードをフォーマット         |
| `npm run clean`      | ビルドキャッシュとdistを削除           |

## 📁 プロジェクト構造

```text
hibari-konaweb/
├── public/              # 静的ファイル（画像、ファビコンなど）
├── src/
│   ├── api/            # API関連のユーティリティ
│   ├── assets/         # 画像、SVG、フォントなど
│   ├── components/     # Astro/Reactコンポーネント
│   ├── data/           # JSONデータファイル
│   ├── layouts/        # レイアウトコンポーネント
│   ├── pages/          # ページファイル（ルーティング）
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

### オプション環境変数

| 変数名                     | 説明                       |
| -------------------------- | -------------------------- |
| `PUBLIC_WPCF7_*`           | Contact Form 7の設定       |
| `PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHAのサイトキー（セキュリティ対策） |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4の測定ID |

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

お問い合わせフォームには以下のセキュリティ対策を実装しています：

- **SSL化（HTTPS）**: すべての通信を暗号化
- **reCAPTCHA v3**: ボット対策（ユーザーに気づかれない形で動作）
- **レート制限**: 短時間での連続送信を防止（1分間に最大3回）
- **バリデーション**: クライアント側・サーバー側の二重バリデーション
- **CSRF対策**: Contact Form 7による自動的なCSRF対策

詳細は [`docs/guides/SECURITY_SETUP_GUIDE.md`](./docs/guides/SECURITY_SETUP_GUIDE.md) を参照してください。

## 📚 ドキュメント

プロジェクトの詳細なドキュメントは [`docs/`](./docs/) ディレクトリにあります。

- 📖 [セットアップ・デプロイガイド](./docs/guides/)
- 🔒 [セキュリティ対策ガイド](./docs/guides/SECURITY_SETUP_GUIDE.md)
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
