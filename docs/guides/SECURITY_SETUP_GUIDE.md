# お問い合わせフォーム セキュリティ対策ガイド

このガイドでは、Contact Form 7を使用したお問い合わせフォームのセキュリティ対策について説明します。

## 目次

1. [SSL化（HTTPS）](#ssl化https)
2. [Turnstile設定](#turnstile設定)
3. [その他のセキュリティ対策](#その他のセキュリティ対策)

## SSL化（HTTPS）

### 概要

SSL化は、データ通信を暗号化して第三者による傍受や改ざんを防ぐための基本的なセキュリティ対策です。

### 実装方法

#### Netlifyの場合

Netlifyは自動的にSSL証明書を提供します。カスタムドメインを設定すると、自動的にHTTPSが有効になります。

1. Netlifyの管理画面で「Site settings」→「Domain management」に移動
2. カスタムドメインを追加
3. DNS設定を完了すると、自動的にSSL証明書が発行されます

#### 確認方法

- ブラウザのアドレスバーで「🔒」アイコンが表示されていることを確認
- `https://`で始まるURLであることを確認

## Turnstile設定

### 概要

Cloudflare Turnstileは、Cloudflareが提供するボット対策（CAPTCHA代替）サービスです。ユーザーにパズルを課さずにボットを判定でき、プライバシーにも配慮されています。当サイトでは Google reCAPTCHA から Turnstile へ移行済みです。

### WordPress側の設定

#### 1. Contact Form 7のTurnstile統合を有効化

Contact Form 7 v6.0以降では、Turnstile機能が標準で含まれています。追加のプラグインは不要です（バージョンが古い場合は Contact Form 7 を更新してください）。

#### 2. Cloudflare Turnstileのサイトキーとシークレットキーを取得

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/?to=/:account/turnstile)にアクセス
2. 「Turnstile」→「Add Site（サイトを追加）」をクリック
3. 以下の設定を行います：
   - **サイト名**: 任意（例: Hibari Konaweb Contact Form）
   - **ドメイン**: **フォームを埋め込む・検証するドメインを登録する必要があります**
     - フロントエンド側: `hibari-konaweb.netlify.app`（Turnstileウィジェットを表示する側）
     - 本番ドメイン: `hibari-konaweb.com`
     - **重要**: 表示するドメインが「許可するドメイン」に登録されていないと、ウィジェットが 401 エラーになり送信できません
   - **ウィジェットのタイプ**: Managed（推奨）
4. 「作成」をクリック
5. **サイトキー**と**シークレットキー**をコピー（後で使用します）

**注意**: 後からドメインを追加する場合は、対象サイトの「Settings（設定）」→「Hostname Management（ホスト名管理）」からドメインを追加できます。

#### 3. WordPress管理画面でTurnstileを設定

1. WordPress管理画面にログイン
2. 「お問い合わせ」→「統合」に移動
3. 「Turnstile（Cloudflare）」セクションで以下を設定：
   - **サイトキー**: 上記で取得したサイトキーを入力
   - **シークレットキー**: 上記で取得したシークレットキーを入力
4. 「変更を保存」をクリック

#### 4. Contact Form 7のフォームにTurnstileを追加

**重要**: REST API経由でフォームを送信する場合は、フォームテンプレートに`[turnstile]`タグを追加する必要があります。

Contact Form 7のフォーム編集画面で、フォームタグに以下を追加：

```
[turnstile]
```

このタグは、送信ボタンの前（通常は最後）に配置してください：

```
<label> 氏名
[text* your-name autocomplete:name] </label>
<label> メールアドレス
[email* your-email autocomplete:email] </label>
<label> メッセージ本文(任意)
[textarea your-message] </label>
[turnstile]
[submit "送信"]
```

### Astro側の設定

#### 1. 環境変数の設定

`.env`ファイルまたはNetlifyの環境変数に以下を追加：

```env
# Turnstile設定
PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

**重要**: `PUBLIC_TURNSTILE_SITE_KEY`は公開されても問題ないサイトキーです。シークレットキーは**絶対に**環境変数に設定しないでください（WordPress側の統合設定でのみ使用します）。

#### 2. 実装の確認

Astro側の実装は既に完了しています。`ContactForm.tsx`コンポーネントが`@marsidev/react-turnstile`でウィジェットを表示し、取得したトークンを`_wpcf7_turnstile_response`フィールドとして送信します。`PUBLIC_TURNSTILE_SITE_KEY`が未設定の場合はウィジェットを非表示にして検証をスキップします。

## その他のセキュリティ対策

### 1. レート制限（送信頻度制限）

Astro側で実装済みのレート制限機能により、短時間での連続送信を防ぎます。

- **制限**: 1分間に最大3回まで送信可能
- **超過時**: エラーメッセージを表示し、送信をブロック

### 2. バリデーション

- **クライアント側**: React Hook Form + Zodによる厳密なバリデーション
- **サーバー側**: Contact Form 7による追加のバリデーション

### 3. CSRF対策

Contact Form 7は内部的にCSRF対策を実装しています。`_wpcf7_unit_tag`などの非表示フィールドにより、CSRF攻撃を防ぎます。

### 4. 入力値のサニタイズ

Contact Form 7は自動的に入力値をサニタイズ（無害化）します。

## トラブルシューティング

### Turnstileが動作しない場合

1. **サイトキーが正しく設定されているか確認**

   - `.env`ファイルの`PUBLIC_TURNSTILE_SITE_KEY`を確認
   - Netlifyの環境変数が正しく設定されているか確認
   - WordPress管理画面の「お問い合わせ」→「統合」→「Turnstile」でサイトキーが一致しているか確認

2. **シークレットキーを再設定（重要）**

   - [Cloudflare ダッシュボード](https://dash.cloudflare.com/?to=/:account/turnstile)でシークレットキーを再取得
   - **重要**: サイトキーとシークレットキーは同じTurnstileサイトのペアである必要があります
   - WordPress管理画面の「お問い合わせ」→「統合」→「Turnstile」で：
     - シークレットキーを再入力
     - 「変更を保存」をクリック
   - 設定後、数分待ってから再度フォーム送信を試す

3. **ドメインが正しく登録されているか確認**

   - Cloudflare Turnstileの対象サイトの「Hostname Management（ホスト名管理）」で、使用しているドメインが登録されているか確認
   - 本番環境の場合：`hibari-konaweb.com`が登録されているか確認
   - **未登録の場合**: ウィジェットが 401 エラーになり、トークンが取得できず送信に失敗します。必要に応じてドメインを追加してください

4. **ブラウザのコンソールでエラーを確認**
   - ブラウザの開発者ツール（F12）でコンソールエラーを確認
   - ネットワークタブで`challenges.cloudflare.com`へのリクエストが成功しているか確認
   - `_wpcf7_turnstile_response`がFormDataに含まれているか確認

5. **CSP（Content Security Policy）でブロックされていないか確認**
   - `challenges.cloudflare.com`が`script-src` / `frame-src` / `connect-src`で許可されているか確認（`netlify.toml`および`src/layouts/HeadLayout.astro`）
   - CSPエラーが出ている場合、ウィジェットが表示されません

6. **WordPress側のデバッグログを確認**
   - `wp-content/debug.log`を確認（エラーがあれば生成されます）
   - Turnstile関連のエラーメッセージがないか確認
   - `wp-config.php`で`WP_DEBUG_LOG`が`true`に設定されているか確認

7. **Contact Form 7のフォームテンプレートを確認**
   - フォームテンプレートに`[turnstile]`タグが含まれているか確認
   - REST API経由で送信する場合は、`[turnstile]`タグが必要です

8. **一時的にTurnstileを無効化してテスト（原因特定用）**
   - フロント側で`PUBLIC_TURNSTILE_SITE_KEY`を未設定にすると、ウィジェットが非表示になり検証がスキップされます
   - WordPress管理画面の「お問い合わせ」→「統合」→「Turnstile」でキーを削除し、フォームテンプレートから`[turnstile]`タグを削除
   - フォーム送信が成功するか確認
   - **成功する場合**: Turnstile設定に問題があることが確定
   - **成功しない場合**: Turnstile以外の問題（SMTP設定など）の可能性
   - **注意**: テスト後は必ずTurnstileを再有効化してください

### SSL証明書の問題

1. **証明書が発行されていない場合**

   - Netlifyの「Domain management」で証明書の状態を確認
   - DNS設定が正しく完了しているか確認

2. **混合コンテンツの警告**
   - すべてのリソース（画像、スクリプトなど）がHTTPSで読み込まれているか確認
   - HTTPで読み込まれているリソースがないか確認

## セキュリティチェックリスト

実装後、以下の項目を確認してください：

- [ ] SSL証明書が有効（HTTPSでアクセス可能）
- [ ] Turnstileサイトキーが環境変数（`PUBLIC_TURNSTILE_SITE_KEY`）に設定されている
- [ ] WordPress側でTurnstileのシークレットキーが設定されている
- [ ] フォーム送信時にTurnstileトークン（`_wpcf7_turnstile_response`）が送信されている（ブラウザの開発者ツールで確認）
- [ ] レート制限が正常に動作している
- [ ] バリデーションが正常に動作している

## 参考リンク

- [Contact Form 7公式ドキュメント](https://contactform7.com/)
- [Cloudflare Turnstile公式ドキュメント](https://developers.cloudflare.com/turnstile/)
- [Netlify SSL/TLS設定](https://docs.netlify.com/domains-https/https-ssl/)
