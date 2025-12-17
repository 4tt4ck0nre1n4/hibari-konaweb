# GitHub連携による自動デプロイ手順

## 📋 この方法が適している場合

- ✅ WordPressが公開サーバーにある（ConoHa WING、エックスサーバー等）
- ✅ 自動デプロイで楽に運用したい
- ✅ GitHubにコードをプッシュするだけでデプロイしたい

## ⚠️ 重要な前提条件

**WordPressが公開環境に必要です**

- Netlify（または任意のホスティング）から**インターネット経由でアクセスできる**WordPressが必要
- ローカルURL（`http://localhost`, `http://hibari-konaweb.local`）は使用できません

---

## 🚀 手順

### ステップ1: Netlifyに環境変数を設定

1. **Netlifyダッシュボードにアクセス**

   - https://app.netlify.com/ にログイン
   - あなたのサイトを選択

2. **環境変数設定ページを開く**

   - `Site configuration` → `Environment variables` をクリック

3. **以下の環境変数を追加**

   `Add a variable` ボタンをクリックして、以下を追加：

   ```
   Key: PUBLIC_API_URL
   Value: https://あなたのWordPressドメイン.com
   Scopes: All scopes（または Production）
   ```

   ```
   Key: PUBLIC_API_PREFIX
   Value: /wp-json/wp/v2/
   Scopes: All scopes
   ```

   **例（ConoHa WINGの場合）:**

   ```
   PUBLIC_API_URL=https://your-domain.com
   PUBLIC_API_PREFIX=/wp-json/wp/v2/
   ```

4. **保存**
   - `Save` をクリック

### ステップ2: WordPress側でCORS設定

NetlifyからWordPress APIにアクセスできるようにCORS設定を追加します。

#### オプション1: プラグインを使用（推奨・簡単）

1. **WordPress管理画面にログイン**

   - `https://あなたのドメイン.com/wp-admin`

2. **プラグインをインストール**

   - `プラグイン` → `新規追加`
   - `WP-CORS` または `WP Headless CMS` を検索
   - `今すぐインストール` → `有効化`

3. **許可するドメインを設定**
   - プラグイン設定画面を開く
   - 以下のドメインを許可リストに追加：
     ```
     https://your-site.netlify.app
     http://localhost:4321
     ```

#### オプション2: functions.phpに直接追加

1. **functions.phpを開く**

   - FTP、SSH、またはホスティングのファイルマネージャーでアクセス
   - パス: `wp-content/themes/arkhe/functions.php`

2. **以下のコードをファイル末尾に追加**

```php
// ====================================
// CORS設定（ヘッドレスWordPress用）
// ====================================
function add_cors_http_header() {
    // 許可するドメインのリスト
    $allowed_origins = array(
        'https://your-site.netlify.app',  // Netlify本番環境
        'http://localhost:4321',          // ローカル開発環境
        'http://127.0.0.1:4321',          // ローカル開発環境（代替）
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

3. **保存**

### ステップ3: REST APIの動作確認

以下のURLをブラウザで開いて、JSONデータが表示されることを確認：

```
https://あなたのWordPressドメイン.com/wp-json/wp/v2/posts
```

**正常な場合:**

```json
[
  {
    "id": 1,
    "date": "2024-01-01T00:00:00",
    "title": {
      "rendered": "Hello World"
    },
    ...
  }
]
```

**エラーの場合:**

- `404 Not Found` → REST APIが無効化されている
- `403 Forbidden` → アクセス制限がかかっている
- 何も表示されない → WordPressが正しく動作していない

### ステップ4: Netlifyで再デプロイ

#### 方法A: GitHubにプッシュして自動デプロイ（推奨）

```bash
# 変更がある場合（無ければスキップ）
git add .
git commit -m "docs: Update deployment configuration"
git push origin main
```

プッシュすると、Netlifyが自動的にビルド・デプロイを開始します。

#### 方法B: Netlifyダッシュボードから手動デプロイ

1. Netlifyダッシュボードでサイトを開く
2. `Deploys` タブをクリック
3. `Trigger deploy` → `Deploy site` をクリック

### ステップ5: デプロイの確認

1. **ビルドログを確認**

   - Netlifyダッシュボード → `Deploys` → 最新のデプロイをクリック
   - ログに以下のようなメッセージが表示されればOK：
     ```
     ✅ [Blog Pagination] Successfully fetched 15 posts
     ✅ [Works Slug] Successfully fetched 8 works
     ```

2. **サイトを確認**
   - デプロイされたサイトにアクセス
   - ブログページ（`/blog`）が表示されるか確認
   - ワークスページ（`/works`）が表示されるか確認
   - 画像が正しく表示されるか確認

---

## ✅ 成功の確認ポイント

- [ ] Netlifyの環境変数が設定されている
- [ ] WordPress REST APIがブラウザでアクセスできる
- [ ] CORS設定が追加されている
- [ ] Netlifyのビルドログに成功メッセージがある
- [ ] サイトでブログ・ワークスページが表示される
- [ ] 画像が正しく表示される

---

## 🐛 トラブルシューティング

### 問題1: ビルドログに "Failed to fetch posts" が表示される

**原因:** WordPress APIに接続できていない

**解決策:**

1. Netlifyの環境変数を再確認
2. WordPress REST APIがブラウザでアクセスできるか確認
3. CORS設定が正しいか確認

### 問題2: ブログ・ワークスページが404エラー

**原因:** ビルド時にデータが取得できず、ページが生成されていない

**解決策:**

1. 上記の問題1を解決
2. Netlifyで再デプロイ（`Trigger deploy`）

### 問題3: 画像が表示されない

**原因:** 画像のURLがWordPressドメインを参照している

**解決策:**

1. WordPressの画像がインターネット経由でアクセスできるか確認
2. 画像URLがHTTPSで提供されているか確認

---

## 📚 関連ドキュメント

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - WordPressの本番環境移行ガイド
- [NETLIFY_SETUP_GUIDE.md](./NETLIFY_SETUP_GUIDE.md) - Netlify初期設定ガイド
- [QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md) - ローカルビルド + Netlify CLI デプロイ

---

## 🎉 完了！

これで、GitHubにプッシュするだけで自動的にNetlifyにデプロイされるようになりました。

次回以降の更新は：

```bash
# コードを編集
git add .
git commit -m "feat: Add new feature"
git push origin main
# → 自動的にNetlifyがビルド・デプロイ！
```
