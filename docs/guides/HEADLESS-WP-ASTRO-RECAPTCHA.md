# ヘッドレスWordPress (CF7) + Astro + Netlify 実装ガイド

## 〜 Google reCAPTCHA v3 を有効化したお問い合わせフォームの構築 〜

このドキュメントは、**Astro（フロントエンド）** と **Headless WordPress（バックエンド）** を組み合わせ、**Google reCAPTCHA v3** によるスパム対策を維持しつつ、正常にお問い合わせを送信するための実践的な手順書です。

---

## 1. アーキテクチャとデータフロー

システムの全体像と、データがどのように流れるかを定義します。

```mermaid
graph TD
    User([ユーザー]) -->|フォーム入力| Astro[Astro フロントエンド / Netlify]
    Astro -->|1. トークン取得| G_recaptcha[Google reCAPTCHA サーバー]
    G_recaptcha -.->|2. トークン返却| Astro
    Astro -->|3. POST /wp-json/.../feedback| WP[Headless WordPress]
    WP -->|4. 検証リクエスト| G_recaptcha
    G_recaptcha -.->|5. スコア判定| WP
    WP -->|6. 結果判定| CF7{CF7 / Flamingo}
    CF7 -->|mail_sent| Success[送信成功 / 自動返信]
    CF7 -->|spam/validation_failed| Error[エラー通知]

# ヘッドレスWordPress (CF7) + Astro + Netlify 実装ガイド
## 〜 Google reCAPTCHA v3 を有効化したお問い合わせフォームの構築 〜

このドキュメントは、**Astro（フロントエンド）** と **Headless WordPress（バックエンド）** を組み合わせ、**Google reCAPTCHA v3** によるスパム対策を維持しつつ、正常にお問い合わせを送信するための実践的な手順書です。

2. Google reCAPTCHA v3 のセットアップ

2-1. サイトの登録
Google reCAPTCHA 管理画面 にて以下を作成します。

  ・ タイプ: reCAPTCHA v3
  ・ ドメイン登録（重要）: 以下の 2種類 を必ず登録してください。
     1. フロントエンド: hibari-konaweb.netlify.app（Netlifyのドメイン）
     2.バックエンド: hibari-konaweb.com（WordPressのドメイン）

  ・ 取得するキー:
    ・ サイトキー (site key) → Astroで使用
    ・ シークレットキー (secret key) → WordPressで使用

3. WordPress（Contact Form 7）側の設定
3-1. インテグレーション
WordPress管理画面の [お問い合わせ] > [インテグレーション] から、取得したサイトキーとシークレットキーを保存します。

3-2. フォームタブの設定
フォームエディタに以下の内容を設定します。[recaptcha] タグを忘れないようにしてください。

<label> 氏名 [text* your-name autocomplete:name] </label>
<label> 会社名 [text your-company autocomplete:organization] </label>
<label> メールアドレス [email* your-email autocomplete:email] </label>
<label> メッセージ本文（任意） [textarea your-message] </label>

Plaintext
<label> 氏名 [text* your-name autocomplete:name] </label>
<label> 会社名 [text your-company autocomplete:organization] </label>
<label> メールアドレス [email* your-email autocomplete:email] </label>
<label> メッセージ本文（任意） [textarea your-message] </label>

[recaptcha]
[submit "送信"]

4. 環境変数の設定

Netlifyの管理画面（Site settings > Build & deploy > Environment）で設定します。

変数名 説明 例
PUBLIC_API_URL
  ・ WordPressのURL(https://hibari-konaweb.com)
PUBLIC_WPCF7_API_ID
  ・ CF7のフォームID(2145)
PUBLIC_RECAPTCHA_SITE_KEY
  ・ reCAPTCHAサイトキー(6Lxxx...)

IMPORTANT: Astroからブラウザ側で参照する変数には、必ず PUBLIC_ プレフィックスを付けてください。

5. Astro フロントエンドの実装

5-1. スクリプトの読み込み
contact/index.astro などのヘッド部分でスクリプトを読み込みます。

HTML
{import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY && (
  <script
    src={`https://www.google.com/recaptcha/api.js?render=${import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY}`}
    async
    defer
  />
)}

5-2. 送信ロジックのポイント

送信時に reCAPTCHA トークンを取得し、FormData に含めます。

TypeScript
// トークンの取得
const recaptchaToken = await window.grecaptcha.execute(SITE_KEY, { action: "contact" });

// FormDataの構築
const formData = new FormData();
formData.append("your-name", data.name);
formData.append("your-email", data.email);
formData.append("your-company", data.company ?? "");
formData.append("your-message", data.message);

// CF7が期待するreCAPTCHA検証用フィールド
formData.append("_wpcf7_recaptcha_response", recaptchaToken);
formData.append("g-recaptcha-response", recaptchaToken);

6. WordPress functions.php のカスタマイズ

ヘッドレス構成では、メール内のリンクなどがWordPress側のURLになりがちです。これをフロントエンド（Netlify）側に書き換えます。

PHP
// 1. フロントエンドURLの定義
if ( ! defined( 'HEADLESS_FRONTEND_URL' ) ) {
    define( 'HEADLESS_FRONTEND_URL', '[https://hibari-konaweb.netlify.app](https://hibari-konaweb.netlify.app)' );
}

// 2. メール内の [_site_url] をフロントURLに置換
add_filter( 'wpcf7_special_mail_tags', function( $output, $name, $html ) {
    if ( $name === '_site_url' ) {
        return HEADLESS_FRONTEND_URL;
    }
    return $output;
}, 10, 3 );

// 3. 送信メール全体のURLを置換
add_filter( 'wpcf7_mail_components', function( $components ) {
    $wp_url = get_site_url();
    $components['body'] = str_replace( $wp_url, HEADLESS_FRONTEND_URL, $components['body'] );
    return $components;
} );

7. トラブルシューティング

症状 確認事項・対策
status: "spam" になる
  ・ reCAPTCHA管理画面にフロントとバック両方のドメインがあるか？
  ・ _wpcf7_recaptcha_response を送っているか？

CSP エラーが出る
  ・ヘッダーに script-src https://www.google.com https://www.gstatic.com を追加。
バリデーションエラー
  ・ CF7側のフィールド名と FormData のキーが一致しているか確認。
タイムアウトする
  ・ fetch に AbortController を使用し、30秒程度でタイムアウト処理を実装。

8. 再利用チェックリスト
 ・ [ ] Google reCAPTCHA に NetlifyとWP両方 のドメインを登録した
 ・ [ ] Astroの環境変数に PUBLIC_ プレフィックスを付けた
 ・ [ ] CF7のフォーム内に [recaptcha] タグを設置した
 ・ [ ] WordPressのインテグレーション設定を完了した
 ・ [ ] functions.php で HEADLESS_FRONTEND_URL を設定した

作成日: 2026年02月05日
