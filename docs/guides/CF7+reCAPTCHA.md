概要
このドキュメントは、ヘッドレスWordPress（Contact Form 7）＋Astroフロントエンド＋Netlify という構成で、
Google reCAPTCHA v3 を有効化した状態でもお問い合わせフォーム送信を成功させるための実践的な手順をまとめたものです。
フロントは Astro（Netlify ホスティング）
バックエンドは Headless WordPress（CF7 + Flamingo）
フォーム送信は WordPress の REST API を経由
reCAPTCHA v3 を有効化しても、送信が「spam」扱いにならず、正常に mail_sent になる構成を目指します。
1. アーキテクチャとデータフロー
Mermaid Syntax Error
View diagram source
ユーザーは Astro の contact ページからフォーム送信
Astro は REST API 経由で Headless WordPress の CF7 エンドポイントに POST
CF7 は
reCAPTCHA v3 による検証（Google サーバーとの通信）
メール送信（管理者＋自動返信）
Flamingo への保存
を行います
2. Google reCAPTCHA v3 のセットアップ
2-1. reCAPTCHA v3 サイトの作成
ブラウザで https://www.google.com/recaptcha/admin にアクセス
新しいサイトを作成
タイプ: reCAPTCHA v3
ラベル: プロジェクト名など（例: hibari-konaweb-v3）
作成後に表示される以下を控えておく
サイトキー (site key) → フロントエンド（Astro）で使用
シークレットキー (secret key) → WordPress（CF7）で使用
2-2. ドメイン登録（重要）
ヘッドレス構成では 2種類のドメインを必ず登録 します。
フロントエンド（Netlify 側）
例: hibari-konaweb.netlify.app
ヘッドレス WordPress
例: hibari-konaweb.com
どちらか一方しか登録していないと、以下のような問題が起こりえます。
Google 管理画面のリクエスト数が増えない
CF7 のレスポンスが status: "spam" のままで送信できない
3. WordPress（Contact Form 7）側の設定
3-1. reCAPTCHA 統合設定
WordPress ダッシュボード → お問い合わせ → インテグレーション（統合）
reCAPTCHA のセクションで
サイトキー（site key）
シークレットキー（secret key）
を入力して保存
3-2. フォームタブの設定例
問い合わせフォーム（会社名は任意）の例:
flowchart LR  userBrowser[UserBrowser] --> astroFrontend[AstroFrontend]  astroFrontend -->|POST /wp-json/contact-form-7/v1/contact-forms/{id}/feedback| wpApi[WordPress_CF7_API]  wpApi --> recaptchaServer[Google_reCAPTCHA_v3]  wpApi --> wpMail[WordPress_Mail]  wpApi --> flamingo[Flamingo_Storage]
ポイント
必須項目には * を付ける:
text* your-name
email* your-email
任意項目（会社名）は * を付けない:
text your-company
メッセージを任意にしたいなら textarea your-message（必須なら textarea*）
reCAPTCHA v3 でも [recaptcha] タグをフォーム内に1つ追加する必要があります
これがないと、トークンを送っていても CF7 側で正しく検証されない場合があります。
3-3. メール / メール(2) タブの注意点
メール(2)（自動返信メール）で [_site_url] を使うと 通常は WordPress の URL が出力されます。
ヘッドレス構成では「フロントエンド URL（Netlify 側）」を表示したい場合が多いので、
後述の functions.php カスタマイズでフロントURLに差し替えるのがおすすめです。
本文中のタグとフォームのフィールド名（[your-name], [your-company], [your-email], [your-message]）が対応していることを確認します。
4. Netlify と環境変数
4-1. 代表的な環境変数（本番）
Netlify のサイト設定 → Build & deploy → Environment などで設定します。
WordPress API URL
<label> 氏名  [text* your-name autocomplete:name] </label><label> 会社名  [text your-company autocomplete:name] </label><label> メールアドレス  [email* your-email autocomplete:email] </label><label> メッセージ本文（任意）  [textarea your-message] </label>[recaptcha][submit "送信"]
Contact Form 7 のフォームID
  PUBLIC_API_URL=https://hibari-konaweb.com
reCAPTCHA サイトキー
  PUBLIC_WPCF7_API_ID=2145
注意:
Astro から参照したい値には、必ず PUBLIC_ プレフィックスを付けます。
4-2. ローカル開発との分離
.env（ローカル）例:
  PUBLIC_RECAPTCHA_SITE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
.env.netlify（Netlify 用）例:
  PUBLIC_API_URL=http://hibari-konaweb.local  PUBLIC_WPCF7_API_ID=2145  PUBLIC_RECAPTCHA_SITE_KEY=ローカル用サイトキー
5. Astro フロントエンド側の実装ポイント
5-1. reCAPTCHA スクリプトの読み込み（contact/index.astro）
キーが設定されているときだけ、<head> にスクリプトを追加します。
  PUBLIC_API_URL=https://hibari-konaweb.com  PUBLIC_WPCF7_API_ID=2145  PUBLIC_RECAPTCHA_SITE_KEY=本番用サイトキー
5-2. ContactForm コンポーネント（ContactForm.tsx）
バリデーション
React Hook Form + Zod を利用
スキーマ例:
name: 必須
email: 必須（メール形式）
message: 必須 or 任意（要件に合わせる）
company: 任意（空文字も許容）
reCAPTCHA トークン取得
window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact" }) でトークンを取得
読み込み失敗時は null を返しつつ送信続行（ただし spam 判定リスクあり）
フォーム送信時の FormData
最低限、以下を送信します。
your-name
your-email
your-company（任意。空文字でも送信可）
your-message
_wpcf7_unit_tag など CF7 REST API が期待する hidden フィールド
reCAPTCHA トークン
_wpcf7_recaptcha_response（CF7が期待）
g-recaptcha-response（互換用）
{RECAPTCHA_SITE_KEY !== undefined && RECAPTCHA_SITE_KEY.trim() !== "" && (  <script    slot="head"    src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}    async    defer  />)}
API への POST
エンドポイント:
POST ${PUBLIC_API_URL}/wp-json/contact-form-7/v1/contact-forms/${PUBLIC_WPCF7_API_ID}/feedback
30 秒程度の fetchWithTimeout を使い、ハングを防止
レスポンスの status に応じて分岐:
mail_sent → サンクスページへリダイレクト
validation_failed → invalid_fields からどの項目がNGか表示
spam → reCAPTCHA 設定を案内
mail_failed / その他 → 管理者への連絡を促す
ログ出力（開発環境のみ）
開発環境かどうかを判定:
formData.append("your-name", data.name);formData.append("your-email", data.email);formData.append("your-company", data.company ?? "");formData.append("your-message", data.message);formData.append("_wpcf7_recaptcha_response", recaptchaToken);formData.append("g-recaptcha-response", recaptchaToken);
devLog / devWarn / devError を定義し、本番では console を使わないようにします。
6. WordPress functions.php のカスタマイズ
6-1. フロントエンドURL定数
  const isDev =    typeof window !== "undefined" &&    ((window as Window & { __DEV__?: boolean }).__DEV__ === true ||      window.location.hostname === "localhost" ||      window.location.hostname === "127.0.0.1" ||      window.location.hostname.endsWith(".local"));
6-2. [_site_url] の出力をフロントURLに統一
wpcf7_special_mail_tags で _site_url をフロントURLに差し替え
wpcf7_mail_components でメール本文と件名中の WordPress URL をフロントURLに置換
これにより、CF7 のメールテンプレートでは [_site_url] と書いておくだけで、
自動返信メールには https://hibari-konaweb.netlify.app のようなフロントURLが出力されます。
6-3. 管理用メールアドレスの変数化
if ( ! defined( 'HEADLESS_FRONTEND_URL' ) ) {    define( 'HEADLESS_FRONTEND_URL', 'https://hibari-konaweb.netlify.app' );}
CF7 のメールテンプレートでは [admin_email] と書くだけで、このアドレスを参照できます。
7. トラブルシューティング
7-1. CSP（Content Security Policy）で reCAPTCHA がブロックされる
症状:
DevTools コンソールに
Framing 'https://www.google.com/' violates Content Security Policy
www.gstatic.com へのアクセスがブロックされたという警告
対応:
ヘッダ（Content-Security-Policy）に 以下のドメインを追加 します。
script-src … https://www.google.com https://www.gstatic.com
frame-src … https://www.google.com https://www.gstatic.com
img-src, connect-src も必要に応じて追加
7-2. status: "spam" で送信失敗する
チェックリスト:
reCAPTCHA 管理画面で
フロントドメインとWordPressドメインの両方が登録されているか
リクエスト数が増えているか
フロントエンド
_wpcf7_recaptcha_response と g-recaptcha-response を送っているか
フォームタブに [recaptcha] が入っているか
WordPress
CF7 統合画面でシークレットキーが正しく設定されているか
7-3. status: "validation_failed" で「入力してください。」だけ表示される
CF7は invalid_fields という配列でエラー内容を返します。
field / message を組み合わせて
your-email: メールアドレスを入力してください。 のように表示すると原因特定が容易です。
任意項目が必須扱いになっている場合は、フォームタブのフィールド定義に * が付いていないか再確認します。
7-4. 送信処理がハング／タイムアウトする
AbortSignal.timeout が使えないブラウザでは、標準の fetch だけだとタイムアウト制御が効きません。
AbortController と setTimeout を使った fetchWithTimeout を用意し、30秒程度で明示的に中断する実装にします。
ユーザーには「時間をおいて再試行してください」というメッセージを alert で案内します。
7-5. デバッグ用の設定
一時的に wp-config.php で以下を有効化:
WP_DEBUG
WP_DEBUG_LOG
WPCF7_DEBUG
問題解決後は 必ず false / 無効に戻す ようにします。
8. 再利用用チェックリスト
新しいプロジェクトでこの構成を再利用するときは、以下を上から順に確認します。
ドメイン
フロントURL
Headless WordPress URL
→ reCAPTCHA 管理画面に両方登録済みか
環境変数
PUBLIC_API_URL
PUBLIC_WPCF7_API_ID
PUBLIC_RECAPTCHA_SITE_KEY
CF7 フォーム設定
フォームタブに [recaptcha] が1つあるか
必須項目だけ * が付いているか
Astro フロント
reCAPTCHA スクリプトを読み込んでいるか
_wpcf7_recaptcha_response / g-recaptcha-response を送信しているか
WordPress カスタマイズ
HEADLESS_FRONTEND_URL が正しいか
必要なら [_site_url] の置き換えロジックが有効か
CSP
google.com / gstatic.com がブロックされていないか
このチェックリストを満たしていれば、reCAPTCHA v3 を有効にしたままでも CF7 経由で安定して問い合わせを受け付けられる構成を、短時間で再現できます。


