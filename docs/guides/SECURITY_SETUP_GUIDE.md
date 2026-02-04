# お問い合わせフォーム セキュリティ対策ガイド

このガイドでは、Contact Form 7を使用したお問い合わせフォームのセキュリティ対策について説明します。

## 目次

1. [SSL化（HTTPS）](#ssl化https)
2. [reCAPTCHA設定](#recaptcha設定)
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

## reCAPTCHA設定

### 概要

reCAPTCHAは、Googleが提供するボット対策サービスです。Contact Form 7では、reCAPTCHA v3（ユーザーに気づかれない形で動作）を推奨します。

### WordPress側の設定

#### 1. Contact Form 7にreCAPTCHA統合プラグインをインストール

Contact Form 7 v5.1以降では、reCAPTCHA機能が標準で含まれています。追加のプラグインは不要です。

#### 2. Google reCAPTCHAのサイトキーとシークレットキーを取得

1. [Google reCAPTCHA管理画面](https://www.google.com/recaptcha/admin)にアクセス
2. 「+」ボタンをクリックして新しいサイトを登録
3. 以下の設定を行います：
   - **ラベル**: サイト名（例: Hibari Konaweb Contact Form）
   - **reCAPTCHAタイプ**: reCAPTCHA v3（推奨）または reCAPTCHA v2
   - **ドメイン**: **両方のドメインを登録する必要があります**
     - フロントエンド側: `hibari-konaweb.netlify.app`（reCAPTCHAトークンを生成する側）
     - WordPress側: `hibari-konaweb.com`（reCAPTCHAトークンを検証する側）
     - **重要**: WordPress側のドメイン（`hibari-konaweb.com`）が登録されていないと、WordPressからGoogleへの検証リクエストが拒否され、spamとして判定されます
4. 「送信」をクリック
5. **サイトキー**と**シークレットキー**をコピー（後で使用します）

**注意**: 既にサイトを登録している場合でも、後からドメインを追加できます：
1. サイトを選択
2. 「設定」を開く
3. 「ドメイン」セクションで「+ ドメインを追加します」をクリック
4. `hibari-konaweb.com`を入力して追加

#### 3. WordPress管理画面でreCAPTCHAを設定

1. WordPress管理画面にログイン
2. 「お問い合わせ」→「統合」に移動
3. 「reCAPTCHA」セクションで以下を設定：
   - **サイトキー**: 上記で取得したサイトキーを入力
   - **シークレットキー**: 上記で取得したシークレットキーを入力
4. 「変更を保存」をクリック

#### 4. Contact Form 7のフォームにreCAPTCHAを追加

**重要**: reCAPTCHA v3を使用している場合でも、REST API経由でフォームを送信する場合は、フォームテンプレートに`[recaptcha]`タグを追加する必要があります。

Contact Form 7のフォーム編集画面で、フォームタグに以下を追加：

```
[recaptcha]
```

このタグは、送信ボタンの前（通常は最後）に配置してください：

```
<label> 氏名
[text* your-name autocomplete:name] </label>
<label> メールアドレス
[email* your-email autocomplete:email] </label>
<label> メッセージ本文(任意)
[textarea your-message] </label>
[recaptcha]
[submit "送信"]
```

**注意**: 通常のWordPressフォーム（REST APIを使用しない場合）では、reCAPTCHA v3は自動的に動作するため`[recaptcha]`タグは不要ですが、REST API経由で送信する場合は必要です。

### Astro側の設定

#### 1. 環境変数の設定

`.env`ファイルまたはNetlifyの環境変数に以下を追加：

```env
# reCAPTCHA設定
PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
```

**重要**: `PUBLIC_RECAPTCHA_SITE_KEY`は公開されても問題ないサイトキーです。シークレットキーは**絶対に**環境変数に設定しないでください。

#### 2. 実装の確認

Astro側の実装は既に完了しています。`ContactForm.tsx`コンポーネントが自動的にreCAPTCHAトークンを取得して送信します。

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

### reCAPTCHAが動作しない場合

1. **サイトキーが正しく設定されているか確認**

   - `.env`ファイルの`PUBLIC_RECAPTCHA_SITE_KEY`を確認
   - Netlifyの環境変数が正しく設定されているか確認
   - WordPress管理画面の「お問い合わせ」→「統合」→「reCAPTCHA」でサイトキーが一致しているか確認

2. **シークレットキーを再設定（重要）**

   - Google reCAPTCHA管理画面（https://www.google.com/recaptcha/admin）でシークレットキーを再取得
   - **重要**: サイトキーとシークレットキーは同じreCAPTCHAサイトのペアである必要があります
   - WordPress管理画面の「お問い合わせ」→「統合」→「reCAPTCHA」で：
     - シークレットキーを一度削除（「キーを削除」ボタンをクリック）
     - 再度シークレットキーを入力
     - 「変更を保存」をクリック
   - 設定後、数分待ってから再度フォーム送信を試す

3. **ドメインが正しく登録されているか確認**

   - Google reCAPTCHA管理画面で、使用しているドメインが登録されているか確認
   - 本番環境の場合：`hibari-konaweb.com`が登録されているか確認
   - 必要に応じてドメインを追加

4. **ブラウザのコンソールでエラーを確認**
   - ブラウザの開発者ツール（F12）でコンソールエラーを確認
   - ネットワークタブでreCAPTCHA APIへのリクエストが成功しているか確認
   - `g-recaptcha-response`がFormDataに含まれているか確認

5. **WordPress側のデバッグログを確認**
   - `wp-content/debug.log`を確認（エラーがあれば生成されます）
   - reCAPTCHA関連のエラーメッセージがないか確認
   - `wp-config.php`で`WP_DEBUG_LOG`が`true`に設定されているか確認

6. **Contact Form 7のフォームテンプレートを確認**
   - フォームテンプレートに`[recaptcha]`タグが含まれているか確認
   - REST API経由で送信する場合は、`[recaptcha]`タグが必要です

7. **一時的にreCAPTCHAを無効化してテスト（原因特定用）**
   - WordPress管理画面の「お問い合わせ」→「統合」→「reCAPTCHA」で「キーを削除」をクリック
   - フォームテンプレートから`[recaptcha]`タグを削除
   - フォーム送信が成功するか確認
   - **成功する場合**: reCAPTCHA設定に問題があることが確定
   - **成功しない場合**: reCAPTCHA以外の問題（SMTP設定など）の可能性
   - **注意**: テスト後は必ずreCAPTCHAを再有効化してください

8. **Contact Form 7のREST API経由での送信でreCAPTCHAが検証されない問題**
   - Contact Form 7のREST API経由での送信では、reCAPTCHAの検証方法が通常のフォーム送信と異なる可能性があります
   - この場合、以下のいずれかの対応が必要です：
     - **オプションA**: reCAPTCHAを無効化して、他のセキュリティ対策（レート制限など）で対応
     - **オプションB**: Contact Form 7の通常のフォーム送信方式に変更（REST APIを使用しない）
     - **オプションC**: Contact Form 7のプラグインを更新して、REST API経由でのreCAPTCHA検証に対応しているか確認

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
- [ ] reCAPTCHAサイトキーが環境変数に設定されている
- [ ] WordPress側でreCAPTCHAのシークレットキーが設定されている
- [ ] フォーム送信時にreCAPTCHAトークンが送信されている（ブラウザの開発者ツールで確認）
- [ ] レート制限が正常に動作している
- [ ] バリデーションが正常に動作している

## 参考リンク

- [Contact Form 7公式ドキュメント](https://contactform7.com/)
- [Google reCAPTCHA公式ドキュメント](https://developers.google.com/recaptcha)
- [Netlify SSL/TLS設定](https://docs.netlify.com/domains-https/https-ssl/)
