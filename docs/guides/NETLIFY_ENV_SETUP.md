# Netlify環境変数の設定手順

## 問題

本番環境で`blog/[...page].astro`と`works/[slug].astro`が404エラーになる原因は、ビルド時にWordPress APIにアクセスできないためです。

## 解決策

### 1. Netlifyダッシュボードにログイン

https://app.netlify.com/ にアクセスし、該当のサイトを選択

### 2. 環境変数を設定

1. `Site settings` → `Environment variables` に移動
2. 以下の環境変数を追加：

```
PUBLIC_API_URL=https://your-production-wordpress-url.com
PUBLIC_API_PREFIX=/wp-json/wp/v2/
```

**重要**: `PUBLIC_API_URL`には、本番環境でアクセス可能なWordPress サイトのURLを指定してください。

### 3. オプション（必要に応じて）

Contact Form 7を使用している場合：

```
PUBLIC_WPCF7_API_PREFIX=contact-form-7/v1/contact-forms/
PUBLIC_WPCF7_API_ID=123
PUBLIC_WPCF7_ID=123
PUBLIC_WPCF7_UNIT_TAG=wpcf7-f123-p456-o1
PUBLIC_WPCF7_POST_ID=456
```

**重要**: `PUBLIC_API_URL`は、Contact Form 7のAPIエンドポイントとしても使用されます。  
フォーム送信時に`https://hibari-konaweb.com`に接続できない場合は、`PUBLIC_API_URL`の設定を確認してください。

reCAPTCHAを使用している場合：

```
PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

**重要**: reCAPTCHAのサイトキーは公開されても問題ありませんが、シークレットキーは**絶対に**環境変数に設定しないでください。  
シークレットキーはWordPress管理画面の「お問い合わせ」→「統合」→「reCAPTCHA」で設定してください。

### 4. 再デプロイ

環境変数を設定後、`Deploys` → `Trigger deploy` → `Deploy site` をクリック

## WordPress APIの要件

- WordPress サイトは **公開アクセス可能** である必要があります
- REST APIが有効になっている必要があります
- CORS設定が適切である必要があります

## WordPress サイトがローカルのみの場合の対応

ローカルのWordPress（`http://hibari-konaweb.local`）しかない場合は、以下のいずれかの対応が必要です：

### オプションA: WordPressを公開ホストにデプロイ

- ConoHa WING
- さくらのレンタルサーバー
- AWS EC2
- その他のWordPressホスティングサービス

### オプションB: ローカルでビルドしてデプロイ

```bash
# ローカル環境でビルド
npm run build

# Netlify CLIでデプロイ
netlify deploy --prod --dir=dist
```

### オプションC: JSON形式でデータをエクスポート

1. WordPress データをJSON形式でエクスポート
2. `src/data/`フォルダに保存
3. APIの代わりにJSONファイルを使用するようコードを修正

## 確認方法

設定が正しければ、以下のURLにアクセスできるはずです：

- `https://your-domain.com/blog`
- `https://your-domain.com/blog/2`
- `https://your-domain.com/works/your-slug`

## トラブルシューティング

### お問い合わせフォームが「spam」ステータスで失敗する場合

1. **Netlifyの環境変数を確認**
   - `Site settings` → `Environment variables`で以下を確認：
     - `PUBLIC_API_URL`が正しく設定されているか
     - `PUBLIC_RECAPTCHA_SITE_KEY`が設定されているか

2. **WordPress側のreCAPTCHA設定を確認**
   - WordPress管理画面の「お問い合わせ」→「統合」→「reCAPTCHA」で：
     - サイトキーが`PUBLIC_RECAPTCHA_SITE_KEY`と一致しているか
     - シークレットキーが正しく設定されているか

3. **Google reCAPTCHA管理画面でドメインを確認**
   - https://www.google.com/recaptcha/admin にアクセス
   - 使用しているreCAPTCHAサイトを選択
   - 「ドメイン」セクションで、`hibari-konaweb.netlify.app`が登録されているか確認

4. **ブラウザのコンソールで確認**
   - 開発者ツール（F12）のコンソールタブを開く
   - フォーム送信時に以下のログを確認：
     - `✅ [Contact Form] reCAPTCHA token obtained`が表示されているか
     - `📋 [Contact Form] FormData keys:`に`g-recaptcha-response`が含まれているか
     - `📤 [Contact Form] Sending POST request to:`で送信先URLを確認

### ネットワークエラー（ERR_INTERNET_DISCONNECTED）が発生する場合

1. **`PUBLIC_API_URL`の設定を確認**
   - Netlifyの環境変数で、`PUBLIC_API_URL`が正しいWordPress URLに設定されているか確認
   - 本番環境では、`https://hibari-konaweb.com`などの公開アクセス可能なURLを設定

2. **WordPressサイトが公開されているか確認**
   - `PUBLIC_API_URL`で指定したURLにブラウザで直接アクセスできるか確認
   - REST APIが有効になっているか確認（`/wp-json/`にアクセスして確認）

3. **CORS設定を確認**
   - WordPress側でCORSが適切に設定されているか確認
   - 必要に応じて、WordPressの`.htaccess`またはプラグインでCORS設定を追加
