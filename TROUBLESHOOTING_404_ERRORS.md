# 404エラートラブルシューティングガイド

## 問題の概要

本番環境（Netlify）で以下のページが404エラーになる：

- `/blog` および `/blog/2`, `/blog/3` など（ブログ一覧ページ）
- `/works/[slug]`（作品詳細ページ）

## 根本原因

Astroの静的サイト生成（SSG）では、ビルド時に`getStaticPaths()`関数を使用して動的ルートのすべてのパスを事前生成します。この関数がWordPress APIからデータを取得できない場合、ページが生成されず、404エラーが発生します。

### 主な原因

1. **環境変数が設定されていない**

   - Netlifyで`PUBLIC_API_URL`が設定されていない

2. **ローカルURLが使用されている**

   - `http://hibari-konaweb.local`などのローカルURLがNetlifyで設定されている
   - Netlifyのビルドサーバーからローカルネットワークにはアクセスできません

3. **WordPress APIがアクセス不可**
   - WordPressサイトが公開されていない
   - CORS設定の問題
   - REST APIが無効になっている

## 解決手順

### ステップ1: 環境変数の確認

#### ローカル環境

1. プロジェクトルートに`.env`ファイルが存在するか確認

   ```bash
   ls -la .env
   ```

2. 存在しない場合は作成

   ```bash
   cp env.example.txt .env
   ```

3. `.env`ファイルを編集
   ```env
   PUBLIC_API_URL=http://hibari-konaweb.local
   PUBLIC_API_PREFIX=/wp-json/wp/v2/
   ```

#### Netlify環境

1. [Netlifyダッシュボード](https://app.netlify.com/)にログイン
2. 該当のサイトを選択
3. `Site settings` → `Environment variables` に移動
4. 以下の環境変数を追加：

   ```
   PUBLIC_API_URL=https://your-production-wordpress-url.com
   PUBLIC_API_PREFIX=/wp-json/wp/v2/
   ```

   **重要**: `PUBLIC_API_URL`には公開アクセス可能なWordPress URLを設定してください

### ステップ2: 環境変数チェックスクリプトの実行

```bash
npm run check-env
```

このスクリプトは：

- 必要な環境変数が設定されているか確認
- ローカルURLが使用されている場合は警告を表示
- 問題がある場合は詳細なエラーメッセージを表示

### ステップ3: ローカルでビルドテスト

```bash
npm run build:safe
```

このコマンドは：

1. 環境変数をチェック
2. WordPress uploadsフォルダをコピー
3. Astroの型チェックを実行
4. サイトをビルド
5. Pagefindでサーチインデックスを生成

#### ビルドログの確認ポイント

```
🔧 [API Config] WordPress API URL: http://hibari-konaweb.local
🔧 [API Config] API Prefix: /wp-json/wp/v2/

🔍 [Blog Pagination] Fetching posts from: http://hibari-konaweb.local/wp-json/wp/v2/posts?_embed&context=embed&acf_format=standard&per_page=100
✅ [Blog Pagination] Successfully fetched 15 posts
📄 [Blog Pagination] Generated 3 paginated pages
✅ [Blog Pagination] Generated 5 total paths (including /blog and /blog/1)

🔍 [Works Slug] Fetching works from: http://hibari-konaweb.local/wp-json/wp/v2/works?context=embed&acf_format=standard
✅ [Works Slug] Successfully fetched 8 works
✅ [Works Slug] Generated 8 work detail pages
📋 [Works Slug] Slugs: project-1, project-2, project-3, ...
```

エラーが発生した場合：

```
❌ [Blog Pagination] Failed to fetch posts: 404 Not Found
❌ [Blog Pagination] API URL: http://hibari-konaweb.local/wp-json/wp/v2/posts?_embed&context=embed&acf_format=standard&per_page=100
```

### ステップ4: WordPress APIの確認

#### REST APIが有効か確認

ブラウザで以下のURLにアクセス：

```
https://your-wordpress-site.com/wp-json/wp/v2/posts
```

正常な場合：JSON形式で記事データが表示される

#### CORS設定の確認

WordPressで`functions.php`または専用プラグインを使用してCORSを有効にする：

```php
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);
```

### ステップ5: Netlifyで再デプロイ

環境変数を設定した後：

1. `Deploys` タブに移動
2. `Trigger deploy` → `Deploy site` をクリック
3. ビルドログを確認

#### ビルドログの確認

Netlifyのデプロイログで以下を確認：

1. 環境変数が正しく設定されているか

   ```
   🔧 [API Config] WordPress API URL: https://your-production-wordpress-url.com
   ```

2. APIからデータが取得できているか

   ```
   ✅ [Blog Pagination] Successfully fetched 15 posts
   ✅ [Works Slug] Successfully fetched 8 works
   ```

3. ページが生成されているか
   ```
   ✅ [Blog Pagination] Generated 5 total paths
   ✅ [Works Slug] Generated 8 work detail pages
   ```

## WordPress サイトがローカルのみの場合

### オプション1: WordPressを公開ホストにデプロイ

推奨のホスティングサービス：

- **ConoHa WING** - 日本で人気、高速
- **さくらのレンタルサーバー** - 安定性が高い
- **Xserver** - WordPress最適化済み
- **AWS EC2** - 柔軟な設定が可能

### オプション2: ローカルビルド + Netlify CLI でデプロイ

```bash
# ローカル環境でビルド（WordPress APIにアクセス可能）
npm run build:safe

# Netlify CLI でデプロイ
npx netlify deploy --prod --dir=dist
```

### オプション3: WordPress データをエクスポートしてJSONファイルで管理

この方法は、WordPressを公開したくない場合の代替案です。

#### 3-1. WordPress データをJSON形式でエクスポート

```bash
# WordPress側でカスタムスクリプトを作成
# または、WP-CLIを使用
wp post list --post_type=post --format=json > posts.json
wp post list --post_type=works --format=json > works.json
```

#### 3-2. JSONファイルをプロジェクトに配置

```
src/
  data/
    posts.json
    works.json
```

#### 3-3. コードを修正してJSONファイルから読み込む

例: `src/pages/blog/[...page].astro`

```typescript
// 修正前
const dataPage = await fetch(BLOG_PAGE_API);
const allPosts = await dataPage.json();

// 修正後
import postsData from "../../data/posts.json";
const allPosts = postsData;
```

## よくある質問

### Q1: ローカルでは動作するのに、Netlifyでは404エラーになる

**A:** ローカルURLが環境変数に設定されているためです。Netlifyの環境変数を公開アクセス可能なURLに変更してください。

### Q2: WordPress APIは公開したくない

**A:** セキュリティ上の理由でAPIを公開したくない場合：

- Basic認証を設定
- APIキーによる認証を実装
- または、上記のオプション3（JSONエクスポート）を使用

### Q3: ビルドは成功するがページが空

**A:** API から空のデータが返されている可能性があります。ビルドログを確認して、データ取得状況を確認してください。

### Q4: 環境変数を設定したのにエラーが出る

**A:**

1. Netlifyで環境変数を設定後、必ず再デプロイしてください
2. 環境変数名が正確か確認（`PUBLIC_API_URL`、スペースや大文字小文字に注意）
3. ビルドログで環境変数が正しく読み込まれているか確認

## サポート情報

さらにサポートが必要な場合：

1. **ビルドログを確認**

   - Netlifyのデプロイログ全体を確認
   - エラーメッセージをメモ

2. **ローカルでテスト**

   ```bash
   npm run check-env
   npm run build:safe
   ```

3. **WordPress REST API をテスト**

   - ブラウザで直接APIにアクセス
   - レスポンスを確認

4. **関連ドキュメント**
   - `NETLIFY_ENV_SETUP.md` - 環境変数設定の詳細
   - `env.example.txt` - 環境変数のサンプル
   - `README.md` - プロジェクト全体のドキュメント

## 修正内容の確認

すべての修正を適用した後：

1. ローカルでビルドテスト

   ```bash
   npm run build:safe
   ```

2. 生成されたファイルを確認

   ```bash
   ls dist/blog/
   ls dist/works/
   ```

3. ローカルでプレビュー

   ```bash
   npm run preview
   ```

4. 以下のURLにアクセスして確認
   - http://localhost:4321/blog
   - http://localhost:4321/blog/2
   - http://localhost:4321/works/[your-slug]

すべて正常に表示されたら、Netlifyにデプロイしてください。
