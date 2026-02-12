# テスト・検証ガイド

このガイドでは、セキュリティ、アクセシビリティ、構造化データの検証手順を説明します。

## 目次

1. [セキュリティヘッダーの検証](#セキュリティヘッダーの検証)
2. [アクセシビリティテスト](#アクセシビリティテスト)
3. [構造化データの検証](#構造化データの検証)

---

## セキュリティヘッダーの検証

### 1. Security Headers（securityheaders.com）

**目標**: A+評価

**手順**:
1. [https://securityheaders.com/](https://securityheaders.com/) にアクセス
2. サイトURL（`https://hibari-konaweb.netlify.app`）を入力
3. 「Scan」をクリック

**評価基準**:
- **A+**: すべてのヘッダーが適切に設定されている ✅
- **A**: ほぼすべてのヘッダーが設定されている
- **B以下**: 改善が必要

**確認すべきヘッダー**:
- ✅ `X-Frame-Options`: SAMEORIGIN
- ✅ `X-Content-Type-Options`: nosniff
- ✅ `X-XSS-Protection`: 1; mode=block
- ✅ `Strict-Transport-Security`: max-age=63072000; includeSubDomains; preload
- ✅ `Referrer-Policy`: strict-origin-when-cross-origin
- ✅ `Permissions-Policy`: geolocation=(), microphone=(), camera=(), payment=()
- ✅ `Content-Security-Policy`: （設定済み）

**注意点**:
- Netlifyへのデプロイ後に検証してください
- 開発環境（localhost）では異なるCSPが適用されます
- `X-XSS-Protection`は古いブラウザ向けの設定です。現代のブラウザではCSPで対応すべきとされており、Security Headersでの表示方法が変わっている場合があります（ヘッダー自体は送信されています）
- `Strict-Transport-Security`の`max-age`は、Netlifyのデフォルト設定により`31536000`（1年）になる場合があります。1年でも十分なセキュリティレベルであり、A+評価を獲得できます

### 2. SSL Labs（ssllabs.com）

**目標**: A+評価

**手順**:
1. [https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/) にアクセス
2. サイトURL（`https://hibari-konaweb.netlify.app`）を入力
3. 「Submit」をクリック
4. スキャン完了まで待機（約2-3分）

**評価基準**:
- **A+**: 最高レベルのSSL/TLS設定 ✅
- **A**: 良好なSSL/TLS設定
- **B以下**: 改善が必要

**確認ポイント**:
- **Certificate**: 有効期限内、信頼できる認証局
- **Protocol Support**: TLS 1.2, TLS 1.3のみ（SSL 2.0, SSL 3.0, TLS 1.0, TLS 1.1は無効）
- **Key Exchange**: 2048ビット以上のRSAキー
- **Cipher Strength**: 128ビット以上

**詳細レポートの見方**:
1. スキャン完了後、**サマリーページ**が表示されます
2. ページ下部の「Server」セクションに、サーバーのIPアドレスまたはホスト名が**青いリンク**で表示されます
3. この青いリンクをクリックすると、**詳細レポートページ**に移動します
4. 詳細レポートページで以下のセクションを確認:
   - **Certificate #1**: 証明書情報（有効期限、発行者、信頼性等）
   - **Configuration**: プロトコルとCipher Suiteのサポート状況
   - **Protocol Details**: TLS 1.2/1.3のサポート状況、鍵交換方式
   - **Cipher Suites**: 使用可能な暗号化方式の一覧

**確認ポイントの詳細**:
- **Certificate**セクション:
  - "Trusted" が "Yes" になっているか確認
  - "Valid from" と "Valid until" で有効期限を確認
- **Configuration**セクション:
  - "TLS 1.2" と "TLS 1.3" のみが "Yes"（緑色）
  - 古い "SSL 2.0", "SSL 3.0", "TLS 1.0", "TLS 1.1" は "No"（赤色）
- **Protocol Details**セクション:
  - "Server Key and Cipher Suites" で "RSA 2048 bits" 以上を確認
- **Cipher Suites**セクション:
  - 128ビット以上の暗号化方式（AES_128_GCM、AES_256_GCM等）が使用されているか

**注意点**:
- NetlifyはデフォルトでLet's Encrypt証明書を提供
- 自動更新されるため、手動での更新は不要
- スキャンには2-3分かかります（複数のサーバーをテストするため）

### 3. Chrome DevTools Security Tab

**手順（詳細版）**:
1. Google Chromeでサイトを開く（`https://hibari-konaweb.netlify.app`）
2. **F12キー**（Windows）または **Cmd+Option+I**（Mac）で開発者ツールを開く
3. 開発者ツール上部のタブ一覧で「**Security**」タブをクリック
   - **タブが見当たらない場合**: タブエリアの右端にある「**>>**」（More tabs）アイコンをクリックし、ドロップダウンメニューから「**Security**」を選択
4. Securityタブ内で「**Reload to view site information**」または「**Reload**」ボタンをクリックしてページを再読み込み
5. セキュリティ概要が表示されるので、以下を確認:
   - ✅ **Origin**: Secure origin (HTTPS)
   - ✅ **Connection**: TLS 1.2 or TLS 1.3
   - ✅ **Certificate**: Valid and trusted
   - ✅ **Resources**: すべてHTTPSで読み込まれている（混合コンテンツなし）

**表示されない・見つからない場合のトラブルシューティング**:
- **開発者ツールのウィンドウを広げる**: タブが隠れている可能性があります
- **Chromeを最新版にアップデート**: 古いバージョンではSecurityタブが利用できない場合があります
- **HTTPSサイトでアクセスしているか確認**: `http://`ではなく`https://`でアクセスしてください（HTTPでは一部機能が制限されます）
- **シークレットモードで試す**: 拡張機能の干渉がある場合があります

---

## アクセシビリティテスト

### 1. Lighthouse（Chrome DevTools）

**目標**: Accessibility 100点維持

**手順**:
1. サイトを開く
2. F12キーで開発者ツールを開く
3. 「Lighthouse」タブをクリック
4. 「Accessibility」のみチェック（または「Performance + Accessibility + Best Practices + SEO」）
5. 「Analyze page load」をクリック

**確認ポイント**:
- **Accessibility Score**: 100点 ✅
- **Errors**: 0件
- **Warnings**: 最小限

**主要チェック項目**:
- ✅ すべての画像に`alt`属性
- ✅ フォーム要素に`label`
- ✅ 適切な見出し階層（h1 → h2 → h3）
- ✅ カラーコントラスト比（4.5:1以上）
- ✅ フォーカス可能な要素にフォーカスインジケーター
- ✅ ARIA属性の適切な使用

### 2. axe DevTools（Chrome拡張機能）

**インストール**:
1. [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) をChrome Web Storeからインストール

**手順**:
1. サイトを開く
2. F12キーで開発者ツールを開く
3. 「axe DevTools」タブをクリック
4. 「Scan ALL of my page」をクリック

**評価基準**:
- **Critical Issues**: 0件 ✅
- **Serious Issues**: 0件 ✅
- **Moderate Issues**: 最小限
- **Minor Issues**: 許容範囲内

**WCAG準拠レベル**:
- ✅ **Level A**: 基本的なアクセシビリティ（法的最低限）
- ✅ **Level AA**: 推奨レベル（障害者差別解消法対応）
- ⚠️ **Level AAA**: 最高レベル（可能な限り対応）

### 3. キーボードナビゲーションテスト（手動）

**目標**: すべての機能をキーボードのみで操作可能

**手順**:
1. マウスを使わず、キーボードのみで操作
2. 以下のキーで操作確認:
   - **Tab**: 次の要素にフォーカス移動
   - **Shift + Tab**: 前の要素にフォーカス移動
   - **Enter / Space**: リンク・ボタンの実行
   - **Esc**: モーダル・ドロップダウンを閉じる
   - **矢印キー**: スライダー・セレクトボックスの操作

**確認ポイント**:
- ✅ すべてのリンク・ボタンにフォーカス可能
- ✅ フォーカス順序が論理的（視覚的な順序と一致）
- ✅ フォーカスインジケーターが明確に表示される（3px、青色）
- ✅ **スキップリンク**がTab初回押下で表示される
- ✅ モーダルダイアログ内でフォーカストラップが機能
- ✅ フォーム送信がEnterキーで可能
- ✅ ハンバーガーメニューがキーボードで操作可能

### 4. スクリーンリーダーテスト（手動）

**推奨ツール**:
- **Windows**: NVDA（無料）- [https://www.nvaccess.org/](https://www.nvaccess.org/)
- **macOS**: VoiceOver（標準搭載）- Cmd+F5で起動
- **Chrome拡張**: ChromeVox

**手順**:
1. スクリーンリーダーを起動
2. サイトを開く
3. 以下を確認:
   - ✅ ページタイトルが正しく読み上げられる
   - ✅ 見出し（h1, h2, h3）が正しく認識される
   - ✅ リンクテキストが意味を持つ（「こちら」ではなく「お問い合わせページへ」）
   - ✅ 画像の`alt`テキストが適切
   - ✅ フォーム要素の`label`が読み上げられる
   - ✅ スキップリンクが機能する
   - ✅ ランドマークロール（banner, main, contentinfo）が認識される
   - ✅ aria-live領域で動的変更が通知される（料金シミュレーター）

**NVDAの基本操作**:
- **Ctrl**: 読み上げ停止
- **H**: 次の見出しへ移動
- **K**: 次のリンクへ移動
- **F**: 次のフォーム要素へ移動
- **D**: 次のランドマークへ移動
- **Insert + Down Arrow**: すべて読み上げ

### 5. カラーコントラスト比チェック

**ツール**: WebAIM Contrast Checker

**手順**:
1. [https://webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/) にアクセス
2. 前景色（テキスト色）と背景色を入力
3. 結果を確認

**基準**:
- **Level AA（推奨）**:
  - 通常テキスト: 4.5:1以上 ✅
  - 大きなテキスト（18pt以上または14pt太字以上）: 3:1以上 ✅
- **Level AAA（理想）**:
  - 通常テキスト: 7:1以上
  - 大きなテキスト: 4.5:1以上

**確認すべき組み合わせ**:
- 本文テキスト（黒 `#010101`）/ 背景（白 `#f1f5f9`）
- リンクテキスト（紫 `#639`）/ 背景（白 `#f1f5f9`）
- ボタンテキスト（白 `#fff`）/ ボタン背景（紫 `#639`）
- ダークモード: テキスト（白 `#f1f5f9`）/ 背景（青 `#0d0950`）

---

## 構造化データの検証

### 1. Google Rich Results Test

**手順**:
1. [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results) にアクセス
2. URLを入力（または「コード」タブでHTML貼り付け）
3. 「URLをテスト」をクリック
4. 結果を確認

**確認するページ**:
- ✅ トップページ（`/`）: Person + WebSite構造化データ
- ✅ ブログ記事（`/blog/[slug]`）: BlogPosting + BreadcrumbList
- ✅ Works詳細（`/works/[slug]`）: CreativeWork + BreadcrumbList
- ✅ お問い合わせ（`/contact`）: ContactPage

**評価基準**:
- **有効**: エラー0件、警告最小限 ✅
- **エラーあり**: 修正が必要

**よくあるエラー**:
- `url`プロパティが絶対URLではない → `https://...`で始まる完全なURLを使用
- 必須プロパティの欠落 → Schema.orgの仕様を確認
- 日付形式の誤り → ISO 8601形式（`2026-02-12T10:00:00+09:00`）を使用

### 2. Schema.org Validator

**手順**:
1. [https://validator.schema.org/](https://validator.schema.org/) にアクセス
2. 「Fetch URL」タブでURLを入力、または「Code Snippet」タブでJSON-LDを貼り付け
3. 「RUN TEST」をクリック
4. 結果を確認

**評価基準**:
- **No Errors**: すべての構造化データが有効 ✅
- **Errors**: スキーマ定義に違反している箇所を修正

**確認ポイント**:
- ✅ `@context`が`https://schema.org`
- ✅ `@type`が正しい（Person, WebSite, BlogPosting等）
- ✅ 必須プロパティがすべて含まれている
- ✅ プロパティの値の型が正しい（文字列、数値、日付等）

### 3. Google Search Console

**前提**: Google Search Consoleでサイトを登録済み

**手順**:
1. [Google Search Console](https://search.google.com/search-console/) にログイン
2. プロパティ（サイト）を選択
3. 左メニュー「拡張」→「パンくずリスト」「記事」等をクリック
4. エラー・警告を確認

**確認項目**:
- ✅ **パンくずリスト**: エラー0件
- ✅ **記事（BlogPosting）**: エラー0件
- ⚠️ **サイトリンク検索ボックス（WebSite）**: Googleが自動的に表示するかどうかは保証されない

**注意点**:
- インデックス登録まで数日～数週間かかる場合があります
- 「URL検査」ツールで個別ページの構造化データを即座に確認可能

---

## テストチェックリスト

### セキュリティ
- [ ] Security Headers: A+評価
- [ ] SSL Labs: A+評価
- [ ] Chrome DevTools Security: すべて緑チェック
- [ ] 混合コンテンツ（HTTP）: 0件

### アクセシビリティ
- [ ] Lighthouse Accessibility: 100点
- [ ] axe DevTools: Critical/Serious Issues 0件
- [ ] キーボードナビゲーション: すべての機能操作可能
- [ ] スキップリンク: Tab初回で表示・機能
- [ ] フォーカスインジケーター: 明確に表示（3px青色）
- [ ] スクリーンリーダー: すべてのコンテンツが読み上げ可能
- [ ] カラーコントラスト比: Level AA基準クリア

### 構造化データ
- [ ] Google Rich Results Test: すべてのページでエラー0件
- [ ] Schema.org Validator: すべての構造化データが有効
- [ ] Person構造化データ: 全ページで表示
- [ ] WebSite構造化データ: 全ページで表示（サイト内検索含む）
- [ ] BlogPosting: ブログ記事ページで表示
- [ ] CreativeWork: Works詳細ページで表示
- [ ] BreadcrumbList: 該当ページで表示

---

## トラブルシューティング

### Security Headersで評価が低い場合

**原因**: ヘッダーが適用されていない

**対処法**:
1. Netlifyにデプロイ済みか確認
2. `netlify.toml`の設定を確認
3. Netlifyキャッシュをクリア: Site Settings → Build & deploy → Clear cache and deploy site

### Lighthouseでアクセシビリティスコアが下がった場合

**原因**: 新しく追加したコンポーネントにアクセシビリティ問題がある

**対処法**:
1. Lighthouseの詳細レポートで問題箇所を確認
2. axe DevToolsで該当要素を特定
3. ARIA属性、alt属性、label属性を追加・修正

### Google Rich Results Testでエラーが出る場合

**原因**: JSON-LDの構文エラー、または必須プロパティの欠落

**対処法**:
1. エラーメッセージで指摘されたプロパティを確認
2. Schema.orgの仕様書で必須プロパティを確認
3. URLが絶対URLになっているか確認（`https://...`）

---

## 更新履歴

- **2026-02-12**: 初版作成（セキュリティ、アクセシビリティ、構造化データの検証手順）
