# ローカルビルド + Netlify CLI でのデプロイ手順

## この方法が適している場合

- ✅ WordPressがローカル環境（`http://hibari-konaweb.local`）にしかない
- ✅ WordPressを公開したくない、またはできない
- ✅ 手動デプロイでも構わない

## 前提条件

- ローカルでWordPressが起動していること
- ローカルで`npm run build:safe`が成功すること

## 手順

### 1. ローカル環境変数の確認

`.env`ファイルが正しく設定されているか確認：

```env
PUBLIC_API_URL=http://hibari-konaweb.local
PUBLIC_API_PREFIX=/wp-json/wp/v2/
```

### 2. 環境変数チェック

```bash
npm run check-env
```

以下のように表示されればOK：

```
✅ PUBLIC_API_URL: http://hibari-konaweb.local
⚠️  警告: ローカルURLは本番環境では機能しません！
   本番環境では公開アクセス可能なURLを設定してください。
```

**注意**: この警告は無視してOKです（ローカルビルドするため）

### 3. WordPressを起動

Local by FlywheelなどでWordPressサイトを起動してください。

### 4. ローカルでビルド

```bash
npm run build:safe
```

以下のようなログが表示されればビルド成功：

```
🔧 [API Config] WordPress API URL: http://hibari-konaweb.local
✅ [Blog Pagination] Successfully fetched 15 posts
✅ [Works Slug] Successfully fetched 8 works
```

`dist`フォルダにファイルが生成されます。

### 5. Netlify CLIのインストール

初回のみ実行：

```bash
npm install -g netlify-cli
```

### 6. Netlifyにログイン

```bash
netlify login
```

ブラウザが開き、Netlifyへのログインを求められます。

### 7. サイトをリンク（初回のみ）

既存のNetlifyサイトにリンク：

```bash
netlify link
```

以下を選択：

1. `Use current git remote origin`（推奨）、または
2. `Choose from a list` → サイトを選択

### 8. デプロイ

```bash
netlify deploy --prod --dir=dist
```

完了すると、デプロイされたURLが表示されます：

```
✔ Deployed to production site URL: https://hibari-konaweb.netlify.app
```

### 9. 確認

ブラウザで以下を確認：

- https://hibari-konaweb.netlify.app/blog
- https://hibari-konaweb.netlify.app/blog/2
- https://hibari-konaweb.netlify.app/works/your-slug

## トラブルシューティング

### `netlify: command not found`

Netlify CLIがインストールされていません：

```bash
npm install -g netlify-cli
```

### `No site id specified`

サイトがリンクされていません：

```bash
netlify link
```

### ビルドエラー

WordPressが起動していない可能性があります：

1. WordPressを起動
2. ブラウザで`http://hibari-konaweb.local/wp-json/wp/v2/posts`にアクセス
3. JSONデータが表示されるか確認
4. 再度`npm run build:safe`を実行

## メリットとデメリット

### メリット

- ✅ WordPressを公開する必要がない
- ✅ Netlifyの環境変数設定が不要
- ✅ すぐに始められる

### デメリット

- ❌ 手動デプロイが必要（自動デプロイされない）
- ❌ GitへのPush時に自動デプロイされない
- ❌ WordPressの内容を更新するたびにローカルビルド→デプロイが必要

## 自動デプロイに切り替える場合

将来、WordPressを公開して自動デプロイに切り替える場合：

1. WordPressを公開ホスト（ConoHa WINGなど）にデプロイ
2. Netlifyの環境変数を設定：
   ```
   PUBLIC_API_URL=https://your-public-wordpress-url.com
   PUBLIC_API_PREFIX=/wp-json/wp/v2/
   ```
3. Gitにpushすれば自動デプロイされるようになります

## よくある質問

### Q: 毎回`netlify deploy --prod`を実行する必要がありますか？

A: はい、WordPressの内容を更新したら、以下を実行する必要があります：

```bash
npm run build:safe
netlify deploy --prod --dir=dist
```

### Q: package.jsonにスクリプトを追加できますか？

A: できます！`package.json`に以下を追加：

```json
"scripts": {
  "deploy": "npm run build:safe && netlify deploy --prod --dir=dist"
}
```

その後は`npm run deploy`だけでOKです。

### Q: GitHub Actionsで自動化できますか？

A: できますが、GitHub ActionsからローカルのWordPressにはアクセスできないため、
結局WordPressを公開する必要があります。

## まとめ

この方法は**WordPressを公開せずに本番デプロイできる**最も簡単な方法です。

更新の流れ：

```bash
# WordPressで記事を編集
↓
npm run build:safe
↓
netlify deploy --prod --dir=dist
↓
本番環境に反映 ✅
```
