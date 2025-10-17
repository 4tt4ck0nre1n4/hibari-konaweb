# Netlify デプロイ 404エラー解決ガイド

## 🔍 問題の原因

NetlifyにデプロイしたAstroサイトでworksページやblogページが404エラーになる原因：

1. **環境変数が設定されていない** - Netlifyに`PUBLIC_API_URL`などの環境変数が設定されていません
2. **ビルド時のデータ取得失敗** - 環境変数がないため、WordPressからデータを取得できず、ページが生成されていません

## ✅ 解決手順

### ステップ1: Netlifyに環境変数を設定

1. **Netlifyダッシュボードにアクセス**

   - https://app.netlify.com/ にログイン
   - あなたのサイト（hibari-konaweb）を選択

2. **環境変数設定ページを開く**

   - 左メニューの「Site configuration」をクリック
   - 「Environment variables」セクションを選択

3. **以下の環境変数を追加**

   「Add a variable」ボタンをクリックして、以下を1つずつ追加：

   ```
   変数1:
   Key: PUBLIC_API_URL
   Value: https://あなたのConoHa WINGのドメイン.com
   Scopes: Production (または All scopes)

   変数2:
   Key: PUBLIC_API_PREFIX
   Value: /wp-json/wp/v2/

   変数3:
   Key: PUBLIC_WPCF7_API_PREFIX
   Value: contact-form-7/v1/contact-forms/

   変数4:
   Key: PUBLIC_WPCF7_API_ID
   Value: 123
   （※実際のContact Form 7のIDに置き換えてください）

   変数5:
   Key: PUBLIC_WPCF7_ID
   Value: 123
   （※実際のContact Form 7のIDに置き換えてください）

   変数6:
   Key: PUBLIC_WPCF7_UNIT_TAG
   Value: wpcf7-f123-p456-o1
   （※実際のContact Form 7のユニットタグに置き換えてください）

   変数7:
   Key: PUBLIC_WPCF7_POST_ID
   Value: 456
   （※実際のContact Form 7の投稿IDに置き換えてください）
   ```

4. **保存**
   - すべての変数を追加したら「Save」をクリック

### ステップ2: Contact Form 7のIDを確認する方法

ConoHa WINGのWordPress管理画面で確認：

1. **WordPress管理画面にログイン**

   - `https://あなたのドメイン.com/wp-admin`

2. **お問い合わせフォームを開く**

   - 左メニュー「お問い合わせ」→「コンタクトフォーム」

3. **IDを確認**
   - フォームをクリックして編集画面を開く
   - URLに表示される数字がID（例：`post=123`の場合、IDは`123`）
   - ショートコードから`wpcf7-f123-p456-o1`の形式を確認

### ステップ3: ConoHa WING側のCORS設定（重要！）

WordPressがNetlifyからのリクエストを受け入れるようにCORS設定を追加します。

#### オプション1: プラグインを使用（推奨）

1. **WordPress管理画面にログイン**

2. **プラグインをインストール**

   - 「プラグイン」→「新規追加」
   - 「WP-CORS」または「WP Headless CMS」を検索
   - 「今すぐインストール」→「有効化」

3. **設定**
   - プラグイン設定画面を開く
   - 許可するドメインに以下を追加：
     - `https://hibari-konaweb.netlify.app`
     - `http://localhost:4321` （ローカル開発用）

#### オプション2: functions.phpに追加

1. **FTPまたはファイルマネージャーでWordPressにアクセス**

2. **functions.phpを編集**
   - パス：`wp-content/themes/arkhe/functions.php`
   - ファイルの最後（`?>` の前）に以下のコードを追加：

```php
// ====================================
// CORS設定（ヘッドレスWordPress用）
// ====================================
function add_cors_http_header() {
    // 許可するドメインのリスト
    $allowed_origins = array(
        'https://hibari-konaweb.netlify.app',  // Netlify本番環境
        'http://localhost:4321',               // ローカル開発環境
        'http://127.0.0.1:4321',              // ローカル開発環境（代替）
    );

    // リクエスト元のドメインを取得
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    // 許可されたドメインかチェック
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
    }

    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");

    // OPTIONSリクエスト（プリフライトリクエスト）の処理
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
add_action('init', 'add_cors_http_header');
```

3. **ファイルを保存**

### ステップ4: REST APIの動作確認

以下のURLにブラウザでアクセスして、JSONデータが表示されることを確認：

```
https://あなたのConoHa WINGのドメイン.com/wp-json/wp/v2/posts
https://あなたのConoHa WINGのドメイン.com/wp-json/wp/v2/works
https://あなたのConoHa WINGのドメイン.com/wp-json/wp/v2/categories
```

**正しい場合**：JSONデータが表示される
**エラーの場合**：

- 404エラー → パーマリンク設定を保存し直す（下記参照）
- 403エラー → CORS設定を確認

#### パーマリンク設定の保存（重要）

1. WordPress管理画面にログイン
2. 「設定」→「パーマリンク設定」
3. 何も変更せずに「変更を保存」をクリック
4. これで`.htaccess`が再生成されます

### ステップ5: コードの変更をGitHubにプッシュ

既にコード修正は完了していますので、変更をコミット＆プッシュします：

```bash
# 変更をステージング
git add .

# コミット
git commit -m "fix: ハードコードされたローカルURLを環境変数に変更"

# GitHubにプッシュ
git push origin main
```

### ステップ6: Netlifyで再デプロイ

GitHubにプッシュすると、Netlifyが自動的に再ビルド・再デプロイを開始します。

**手動で再デプロイする場合**：

1. Netlifyダッシュボードを開く
2. 「Deploys」タブをクリック
3. 「Trigger deploy」→「Deploy site」をクリック

### ステップ7: デプロイログの確認

1. **Netlifyダッシュボードで「Deploys」タブを開く**

2. **最新のデプロイをクリック**

3. **ログを確認**
   - エラーがないか確認
   - 以下のようなログが表示されればOK：
     ```
     Fetching data WORKS_PAGE_API: https://your-domain.com/wp-json/wp/v2/works...
     Fetching data BLOG_POST_API: https://your-domain.com/wp-json/wp/v2/posts...
     ```

### ステップ8: サイトの動作確認

以下のURLにアクセスして、正しく表示されることを確認：

- ✅ トップページ：`https://hibari-konaweb.netlify.app/`
- ✅ ブログ一覧：`https://hibari-konaweb.netlify.app/blog/1`
- ✅ ブログ詳細：`https://hibari-konaweb.netlify.app/blog/hello-world`
- ✅ Works一覧：`https://hibari-konaweb.netlify.app/works/1`
- ✅ Works詳細：`https://hibari-konaweb.netlify.app/works/[slug]`
- ✅ カテゴリー：`https://hibari-konaweb.netlify.app/blog/category/[slug]`

## 🔧 トラブルシューティング

### 問題1: ビルドが失敗する

**エラーメッセージ**：

```
Please set environment variables: PUBLIC_API_URL
```

**解決策**：

- Netlifyの環境変数が正しく設定されているか確認
- 変数名が完全に一致しているか確認（大文字小文字、スペースなど）
- 環境変数のScopesが「Production」または「All scopes」になっているか確認

### 問題2: CORSエラーが出る

**エラーメッセージ（ブラウザのコンソール）**：

```
Access to fetch at 'https://your-domain.com/wp-json/...'
from origin 'https://hibari-konaweb.netlify.app'
has been blocked by CORS policy
```

**解決策**：

- ConoHa WINGのWordPress側でCORS設定を追加（ステップ3参照）
- functions.phpのコードが正しく追加されているか確認
- キャッシュをクリアして再度試す

### 問題3: REST APIが404エラーを返す

**解決策**：

1. WordPress管理画面にログイン
2. 「設定」→「パーマリンク設定」を開く
3. 何も変更せずに「変更を保存」をクリック
4. `.htaccess`が再生成される
5. もう一度REST APIのURLにアクセスして確認

### 問題4: 画像が表示されない

**原因**：

- 画像のURLがまだローカルのままになっている可能性

**解決策**：

**方法1: Better Search Replaceプラグインを使用**

1. WordPress管理画面にログイン
2. プラグイン「Better Search Replace」をインストール
3. 「ツール」→「Better Search Replace」
4. 設定：
   - Search for: `http://hibari-konaweb.local`
   - Replace with: `https://あなたのConoHa WINGのドメイン.com`
   - Select tables: すべて選択
   - 「Run as dry run」のチェックを外す
5. 「Run Search/Replace」をクリック

**方法2: wp-content/uploadsフォルダを直接アップロード**

1. ローカル環境の `app/public/wp-content/uploads/` フォルダ全体をコピー
2. FTPで ConoHa WING の `wp-content/uploads/` にアップロード

### 問題5: データが古い（WordPressで更新したのにNetlifyに反映されない）

**原因**：

- Astroは静的サイトジェネレーター（SSG）のため、ビルド時にデータを取得
- WordPressでコンテンツを更新しても、Netlifyを再ビルドしないと反映されない

**解決策1: 手動で再ビルド**

```bash
# GitHubにダミーコミットをプッシュ
git commit --allow-empty -m "chore: rebuild for content update"
git push origin main
```

**解決策2: Netlify Build Hookを設定（自動化）**

1. **Netlify Build Hookを作成**

   - Netlify Dashboard → Site configuration → Build & deploy
   - 「Build hooks」→「Add build hook」
   - 名前: "WordPress Content Update"
   - ブランチ: main
   - URLをコピー（例：`https://api.netlify.com/build_hooks/xxx`）

2. **WordPressにプラグインをインストール**
   - 「WP Webhooks」プラグインをインストール・有効化
   - Webhookを設定してNetlifyのBuild Hook URLを指定
   - 投稿を公開/更新すると自動的にNetlifyが再ビルドされる

## 📝 確認チェックリスト

### ConoHa WING（WordPress）側

- [ ] WordPressが正常に動作している
- [ ] REST APIが有効化されている
- [ ] パーマリンク設定が保存されている
- [ ] CORS設定が追加されている
- [ ] SSL証明書（HTTPS）が有効になっている
- [ ] Contact Form 7のIDを確認した

### Netlify側

- [ ] 環境変数`PUBLIC_API_URL`を設定
- [ ] 環境変数`PUBLIC_API_PREFIX`を設定
- [ ] Contact Form 7関連の環境変数を設定
- [ ] コード変更をGitHubにプッシュ
- [ ] デプロイが成功
- [ ] デプロイログにエラーがない
- [ ] サイトの動作確認完了

## 🔗 重要なURL一覧

```
# ConoHa WING（WordPress）
WordPress管理画面: https://あなたのドメイン.com/wp-admin
REST API - 投稿: https://あなたのドメイン.com/wp-json/wp/v2/posts
REST API - Works: https://あなたのドメイン.com/wp-json/wp/v2/works
REST API - カテゴリー: https://あなたのドメイン.com/wp-json/wp/v2/categories

# Netlify
サイトURL: https://hibari-konaweb.netlify.app
ダッシュボード: https://app.netlify.com/sites/hibari-konaweb

# GitHub
リポジトリ: https://github.com/[あなたのユーザー名]/[リポジトリ名]
```

## 📚 参考資料

- [Astro環境変数ドキュメント](https://docs.astro.build/en/guides/environment-variables/)
- [Netlify環境変数ドキュメント](https://docs.netlify.com/environment-variables/overview/)
- [WordPress REST APIハンドブック](https://developer.wordpress.org/rest-api/)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 詳細な移行ガイド

## 🎉 完了！

以上の手順を完了すれば、Netlifyにデプロイしたサイトでworksページとblogページが正しく表示されるようになります。

何か問題が発生した場合は、このガイドのトラブルシューティングセクションを参照してください。
