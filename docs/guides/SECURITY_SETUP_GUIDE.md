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
   - **ドメイン**: 使用するドメイン（例: `hibari-konaweb.netlify.app`, `hibari-konaweb.com`）
4. 「送信」をクリック
5. **サイトキー**と**シークレットキー**をコピー（後で使用します）

#### 3. WordPress管理画面でreCAPTCHAを設定

1. WordPress管理画面にログイン
2. 「お問い合わせ」→「統合」に移動
3. 「reCAPTCHA」セクションで以下を設定：
   - **サイトキー**: 上記で取得したサイトキーを入力
   - **シークレットキー**: 上記で取得したシークレットキーを入力
4. 「変更を保存」をクリック

#### 4. Contact Form 7のフォームにreCAPTCHAを追加

Contact Form 7のフォーム編集画面で、フォームタグに以下を追加：

```
[recaptcha]
```

または、reCAPTCHA v3を使用する場合（推奨）、フォームタグは不要です。v3は自動的に動作します。

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

2. **ドメインが正しく登録されているか確認**

   - Google reCAPTCHA管理画面で、使用しているドメインが登録されているか確認
   - ローカル開発環境（`localhost`）も登録が必要な場合があります

3. **ブラウザのコンソールでエラーを確認**
   - ブラウザの開発者ツール（F12）でコンソールエラーを確認
   - ネットワークタブでreCAPTCHA APIへのリクエストが成功しているか確認

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





