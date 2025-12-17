# WordPressを起動してビルドする手順

## 問題

`npm run build:safe`実行時に以下のエラーが出る：

```
❌ [Blog Pagination] Error in getStaticPaths: TypeError: fetch failed
[cause]: AggregateError [ECONNREFUSED]
```

これは**WordPressサーバーが起動していない**ことを意味します。

## 解決方法

### オプション1: Local by FlywheelでWordPressを起動してビルド

#### ステップ1: WordPressを起動

1. **Local by Flywheel**を起動
2. `hibari-konaweb`サイトを選択
3. **「Start site」**をクリック
4. サイトが起動するまで待つ（緑色の「Running」になる）

#### ステップ2: WordPressが動作していることを確認

ブラウザで以下にアクセス：

```
http://hibari-konaweb.local/wp-json/wp/v2/posts
```

JSONデータが表示されればOK！

#### ステップ3: ビルドを実行

```bash
npm run build:safe
```

成功時のログ：

```
✅ [Blog Pagination] Successfully fetched 15 posts
✅ [Works Slug] Successfully fetched 8 works
```

### オプション2: ConoHa WINGのWordPressを使用してビルド（推奨）

ローカルWordPressを起動しなくても、ConoHa WINGのWordPressからデータを取得できます。

#### ステップ1: .envファイルを一時的に変更

`.env`ファイルを開き、URLを変更：

```env
# 一時的にConoHa WINGのURLを使用
PUBLIC_API_URL=https://hibari-konaweb.com
PUBLIC_API_PREFIX=/wp-json/wp/v2/
```

#### ステップ2: ビルド

```bash
npm run build:safe
```

#### ステップ3: .envを元に戻す

開発時はローカルを使うため、元に戻す：

```env
# ローカル開発用
PUBLIC_API_URL=http://hibari-konaweb.local
PUBLIC_API_PREFIX=/wp-json/wp/v2/
```

### オプション3: 環境変数を動的に設定してビルド

PowerShellで一時的に環境変数を設定してビルド：

```powershell
$env:PUBLIC_API_URL="https://hibari-konaweb.com"; $env:PUBLIC_API_PREFIX="/wp-json/wp/v2/"; npm run build
```

この方法なら`.env`ファイルを変更せずにビルドできます。

## ビルド成功の確認

ビルドが成功すると、以下のファイルが生成されます：

```bash
# ブログページ
dist/blog.html
dist/blog/2.html
dist/blog/3.html

# 個別記事
dist/blog/[slug].html

# Worksページ
dist/works.html

# 個別作品
dist/works/[slug].html
```

確認コマンド：

```bash
ls dist/blog/
ls dist/works/
```

## プレビュー

ビルド後、ローカルでプレビュー：

```bash
npm run preview
```

ブラウザで確認：
- http://localhost:4321/blog
- http://localhost:4321/works

## Netlifyデプロイの準備

ローカルビルドが成功したら、Netlifyの設定を行います：

### 1. Netlify環境変数を設定

Netlifyダッシュボード → Site Settings → Environment Variables

```
PUBLIC_API_URL=https://hibari-konaweb.com
PUBLIC_API_PREFIX=/wp-json/wp/v2/
```

### 2. Git Push

```bash
git add .
git commit -m "fix: WordPress APIエラーハンドリング改善"
git push origin main
```

### 3. Netlifyで確認

`Deploys`タブでビルドログを確認：

```
✅ [Blog Pagination] Successfully fetched 15 posts
✅ [Works Slug] Successfully fetched 8 works
```

## トラブルシューティング

### WordPressが起動しているのにエラーが出る

#### 原因1: URLが間違っている

`.env`のURLを確認：

```bash
# 確認
cat .env | Select-String "PUBLIC_API_URL"

# 正しい形式（スペースなし）
PUBLIC_API_URL=http://hibari-konaweb.local
```

#### 原因2: WordPressのポートが変わっている

Local by Flywheelの設定を確認し、カスタムポートを使用している場合：

```env
PUBLIC_API_URL=http://hibari-konaweb.local:10080
```

#### 原因3: SSL証明書エラー

httpsを使用している場合、自己署名証明書でエラーが出ることがあります：

```env
# httpを使用
PUBLIC_API_URL=http://hibari-konaweb.local
```

#### 原因4: ファイアウォールがブロックしている

Windowsファイアウォールで接続がブロックされている可能性があります。
一時的に無効にして試してください。

### それでもダメな場合

1. **WordPressのREST APIを直接テスト**

   ```bash
   curl http://hibari-konaweb.local/wp-json/wp/v2/posts
   ```

2. **Localのログを確認**

   Local by Flywheel → サイトを選択 → ログを表示

3. **環境変数が読み込まれているか確認**

   ```bash
   npm run check-env
   ```

## まとめ

最も簡単な方法：

1. **ビルド前にLocal by FlywheelでWordPressを起動**
   
   または
   
2. **ConoHa WINGのURLを使用してビルド**

   ```powershell
   $env:PUBLIC_API_URL="https://hibari-konaweb.com"; $env:PUBLIC_API_PREFIX="/wp-json/wp/v2/"; npm run build:safe
   ```

これでビルドが成功するはずです！

