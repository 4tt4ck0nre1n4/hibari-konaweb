# 404エラー修正まとめ

## 修正内容

### 1. エラーハンドリングの改善

以下のファイルに詳細なログ出力を追加しました：

#### `src/pages/blog/[...page].astro`

- ✅ API呼び出しの詳細なログ（絵文字付き）
- ✅ エラーメッセージの改善
- ✅ 生成されたページ数の表示

#### `src/pages/works/[slug].astro`

- ✅ API呼び出しの詳細なログ
- ✅ 生成されたスラッグの一覧表示
- ✅ エラースタックトレースの出力

#### `src/pages/works/[...page].astro`

- ✅ ページネーション処理のログ改善
- ✅ エラーハンドリングの強化

### 2. 環境変数チェックの強化

#### `src/api/headlessCms.ts`

- ✅ 環境変数の存在チェック
- ✅ 詳細なエラーメッセージ
- ✅ ビルド時のAPI設定表示
- ✅ ローカルURL使用時の警告

### 3. 診断ツールの追加

#### `scripts/check-env.mjs`（新規作成）

- ✅ 環境変数の自動チェック
- ✅ ローカルURL検出
- ✅ 詳細なガイダンス表示

#### `package.json`

新しいスクリプトを追加：

- `npm run check-env` - 環境変数をチェック
- `npm run build:safe` - 環境変数チェック付きビルド

### 4. Netlify設定の改善

#### `netlify.toml`

- ✅ ビルドコマンドを`npm run build:safe`に変更
- ✅ メモリ設定の最適化
- ✅ 環境変数設定のコメント追加

### 5. ドキュメントの作成

#### `NETLIFY_ENV_SETUP.md`（新規作成）

- Netlify環境変数の設定手順
- WordPressがローカルのみの場合の対応方法
- トラブルシューティング

#### `TROUBLESHOOTING_404_ERRORS.md`（新規作成）

- 包括的なトラブルシューティングガイド
- ステップバイステップの解決手順
- よくある質問と回答

#### `env.example.txt`

- ✅ 詳細なコメント追加
- ✅ ローカルと本番環境の設定方法を明記

## 次のステップ

### ローカル環境での確認

1. **環境変数の設定**

   ```bash
   # .env ファイルが存在しない場合
   cp env.example.txt .env
   ```

2. **環境変数チェック**

   ```bash
   npm run check-env
   ```

3. **ビルドテスト**

   ```bash
   npm run build:safe
   ```

4. **ビルドログの確認**
   以下のようなログが表示されるか確認：

   ```
   🔧 [API Config] WordPress API URL: http://hibari-konaweb.local
   ✅ [Blog Pagination] Successfully fetched 15 posts
   ✅ [Works Slug] Successfully fetched 8 works
   ```

5. **プレビュー**

   ```bash
   npm run preview
   ```

   以下のURLにアクセスして確認：

   - http://localhost:4321/blog
   - http://localhost:4321/blog/2
   - http://localhost:4321/works/your-slug

### Netlify本番環境での設定

#### 必須: 環境変数の設定

1. [Netlifyダッシュボード](https://app.netlify.com/)にログイン
2. サイトを選択
3. `Site settings` → `Environment variables`
4. 以下を追加：

   ```
   PUBLIC_API_URL=https://your-production-wordpress-url.com
   PUBLIC_API_PREFIX=/wp-json/wp/v2/
   ```

   **⚠️ 重要**: `PUBLIC_API_URL`は公開アクセス可能なWordPress URLを設定してください

#### 再デプロイ

1. `Deploys` → `Trigger deploy` → `Deploy site`
2. ビルドログで以下を確認：
   - 環境変数が正しく読み込まれているか
   - API呼び出しが成功しているか
   - ページが生成されているか

## WordPress サイトが公開されていない場合の対応

### オプション1: WordPressを公開する（推奨）

以下のいずれかのサービスにデプロイ：

- ConoHa WING
- さくらのレンタルサーバー
- Xserver
- AWS EC2

### オプション2: ローカルビルド + Netlify CLI

```bash
# ローカルでビルド
npm run build:safe

# Netlify CLI でデプロイ
npx netlify deploy --prod --dir=dist
```

### オプション3: JSONファイルで管理

詳細は`TROUBLESHOOTING_404_ERRORS.md`の「WordPress データをエクスポート」セクションを参照

## ビルドログの見方

### 成功時のログ例

```
🔧 [API Config] WordPress API URL: http://hibari-konaweb.local
🔧 [API Config] API Prefix: /wp-json/wp/v2/

🔍 [Blog Pagination] Fetching posts from: http://...
✅ [Blog Pagination] Successfully fetched 15 posts
📄 [Blog Pagination] Generated 3 paginated pages
✅ [Blog Pagination] Generated 5 total paths (including /blog and /blog/1)

🔍 [Works Slug] Fetching works from: http://...
✅ [Works Slug] Successfully fetched 8 works
✅ [Works Slug] Generated 8 work detail pages
📋 [Works Slug] Slugs: project-1, project-2, project-3, ...
```

### エラー時のログ例

```
❌ Environment variable PUBLIC_API_URL is not set!
❌ This will cause 404 errors for dynamically generated pages.

❌ [Blog Pagination] Failed to fetch posts: 404 Not Found
❌ [Blog Pagination] API URL: http://...
❌ [Blog Pagination] Error message: Failed to fetch posts: 404 Not Found
```

## トラブルシューティング

問題が発生した場合：

1. **環境変数を確認**

   ```bash
   npm run check-env
   ```

2. **ビルドログを確認**

   - エラーメッセージをメモ
   - API URLが正しいか確認

3. **WordPress REST API をテスト**

   - ブラウザで`https://your-site.com/wp-json/wp/v2/posts`にアクセス
   - JSONデータが表示されるか確認

4. **詳細なガイドを参照**
   - `TROUBLESHOOTING_404_ERRORS.md` - 包括的なガイド
   - `NETLIFY_ENV_SETUP.md` - Netlify設定の詳細

## 修正後の確認項目

- [ ] ローカルで`npm run check-env`が成功する
- [ ] ローカルで`npm run build:safe`が成功する
- [ ] ビルドログに✅マークが表示される
- [ ] `dist/blog/`フォルダにHTMLファイルが生成される
- [ ] `dist/works/`フォルダにHTMLファイルが生成される
- [ ] ローカルプレビューで各ページが表示される
- [ ] Netlifyの環境変数が設定されている
- [ ] Netlifyでのビルドが成功する
- [ ] 本番環境で`/blog`が表示される
- [ ] 本番環境で`/works/[slug]`が表示される

## 変更されたファイル一覧

### 修正されたファイル

- `src/pages/blog/[...page].astro`
- `src/pages/works/[slug].astro`
- `src/pages/works/[...page].astro`
- `src/api/headlessCms.ts`
- `package.json`
- `netlify.toml`
- `env.example.txt`

### 新規作成されたファイル

- `scripts/check-env.mjs`
- `NETLIFY_ENV_SETUP.md`
- `TROUBLESHOOTING_404_ERRORS.md`
- `FIX_SUMMARY.md`（このファイル）

## まとめ

今回の修正により：

1. **問題の早期発見**: 環境変数が設定されていない場合、ビルド前にエラーを検出
2. **詳細なログ**: ビルド時のAPI呼び出しとページ生成状況を確認可能
3. **明確なガイダンス**: ステップバイステップのドキュメント
4. **柔軟な対応**: WordPress が公開されていない場合の代替案

これらの改善により、404エラーの原因を素早く特定し、解決できるようになりました。

---

**次のアクション**:

1. ローカルで`npm run check-env`を実行
2. Netlifyで環境変数を設定
3. 再デプロイして確認
