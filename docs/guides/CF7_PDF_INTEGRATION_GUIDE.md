# Contact Form 7 設定ガイド（PDF連携）

このガイドは、概算見積書のPDFをContact Form 7で受け取るための完全な設定手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [プラグインのインストール](#プラグインのインストール)
3. [Contact Form 7のフォーム設定](#contact-form-7のフォーム設定)
4. [メールテンプレートの設定](#メールテンプレートの設定)
5. [お問い合わせページへの統合](#お問い合わせページへの統合)
6. [CSSスタイリング（オプション）](#cssスタイリングオプション)
7. [動作確認](#動作確認)
8. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必要なもの

- WordPress 5.0以降
- Contact Form 7プラグイン（最新版）
- PHP 7.4以降
- 実装済みのPDF生成機能（`src/utils/generatePDF.ts`）

---

## プラグインのインストール

### 1. Contact Form 7のインストール

WordPressダッシュボード:

1. **プラグイン** > **新規追加**
2. 検索欄に「Contact Form 7」と入力
3. **今すぐインストール** > **有効化**

### 2. Flamingoのインストール（推奨）

送信されたフォームデータを保存・閲覧するためのプラグインです。

1. **プラグイン** > **新規追加**
2. 検索欄に「Flamingo」と入力
3. **今すぐインストール** > **有効化**

**Flamingoの利点**:
- 送信されたフォームデータをWordPress管理画面で確認
- 添付ファイル（PDF）も保存される
- スパムフィルター機能
- 無料で使える

---

## Contact Form 7のフォーム設定

### ステップ1: 新規フォームの作成または既存フォームの編集

WordPressダッシュボード:

1. **お問い合わせ** > **コンタクトフォーム**
2. 既存のフォームを選択、または **新規追加**

### ステップ2: フォームタグの設定

#### 基本フォームテンプレート

```html
<label> お名前 *
  [text* your-name autocomplete:name] 
</label>

<label> メールアドレス *
  [email* your-email autocomplete:email] 
</label>

<label> 見積番号
  [text estimate-number class:estimate-number-field readonly] 
</label>

<label> お問い合わせ内容
  [textarea your-message] 
</label>

<label> 見積書（PDFが自動添付されます）
  [file estimate-pdf filetypes:.pdf limit:5mb]
</label>

[submit "送信"]
```

### ステップ3: ファイルアップロードフィールドの詳細設定

#### フォームタグジェネレーターの使用

1. フォーム編集画面で **ファイル** ボタンをクリック
2. 以下のように設定:

| 項目 | 設定値 | 説明 |
|------|--------|------|
| **項目タイプ** | ファイルアップロード項目 | デフォルト |
| **項目名** | `estimate-pdf` | **重要**: スクリプトがこの名前を参照 |
| **必須項目** | ☑ チェックを**外す** | PDFは自動添付されるため |
| **受け入れ可能なファイル形式** | `.pdf` | PDFのみに制限 |
| **ファイルサイズ制限** | `5mb` | 5MBまでのPDFを許可 |
| **クラス属性** | （空欄でOK） | CSSでスタイリングする場合に使用 |

3. **タグを挿入** をクリック

生成されるタグ:
```
[file estimate-pdf filetypes:.pdf limit:5mb]
```

### ステップ4: 見積番号フィールドの設定

見積番号は自動入力されるため、`readonly`属性を付けます。

#### フォームタグジェネレーターの使用

1. **テキスト** ボタンをクリック
2. 以下のように設定:

| 項目 | 設定値 |
|------|--------|
| **項目名** | `estimate-number` |
| **必須項目** | ☑ チェックを外す |
| **クラス属性** | `estimate-number-field` |

3. **タグを挿入** をクリック
4. 生成されたタグに `readonly` を手動で追加:

```
[text estimate-number class:estimate-number-field readonly]
```

---

## メールテンプレートの設定

### ステップ1: メール（管理者宛）の設定

WordPressダッシュボード:

1. **お問い合わせ** > **コンタクトフォーム** > フォームを選択
2. **メール** タブをクリック

#### 送信先の設定

```
送信先: [_site_admin_email]
```

#### 送信元の設定

```
送信元: [your-name] <[your-email]>
```

#### 題名の設定

```
題名: [your-subject] 見積に関するお問い合わせ
```

#### メッセージ本文の設定

```
差出人: [your-name] <[your-email]>
見積番号: [estimate-number]

お問い合わせ内容:
[your-message]

--
このメールは [_site_title] ([_site_url]) のお問い合わせフォームから送信されました
```

#### 添付ファイルの設定

**重要**: この欄に以下を入力してください:

```
[estimate-pdf]
```

これにより、アップロードされたPDFファイルがメールに添付されます。

### ステップ2: メール（送信者宛）の設定

「メール (2) を使用」にチェックを入れて、以下を設定:

#### 送信先

```
送信先: [your-email]
```

#### 送信元

```
送信元: [_site_title] <wordpress@[_site_admin_email]>
```

#### 題名

```
題名: お問い合わせありがとうございます
```

#### メッセージ本文

```
[your-name] 様

お問い合わせいただきありがとうございます。
以下の内容で承りました。

見積番号: [estimate-number]

お問い合わせ内容:
[your-message]

担当者より折り返しご連絡いたしますので、
しばらくお待ちください。

--
[_site_title]
[_site_url]
```

**注意**: 送信者宛てのメールにはPDFを添付しないことを推奨します。セキュリティとプライバシーのため、管理者のみが見積書を受け取ります。

---

## お問い合わせページへの統合

### ステップ1: Astroページでのスクリプト読み込み

お問い合わせページ（例: `src/pages/contact/index.astro`）にスクリプトを追加します。

```astro
---
import Layout from "../../layouts/Layout.astro";
import globalText from "../../data/globalText.json";
import { generateBreadcrumbs } from "../../util/generateBreadcrumbs";
import Breadcrumbs from "../../components/Breadcrumbs.astro";

const crumbs = generateBreadcrumbs(Astro.url.pathname);
---

<Layout
  title={globalText.contact.title}
  description={globalText.contact.description}
>
  <div class="breadcrumbs__wrapper">
    <Breadcrumbs {crumbs} />
  </div>

  <div class="contact-page">
    <h1>お問い合わせ</h1>
    
    <!-- Contact Form 7のショートコードをここに -->
    <!-- WordPressから取得したHTMLを配置 -->
    <div id="contact-form-container">
      <!-- CF7のフォームがここに表示される -->
    </div>
  </div>

  <script>
    // PDF添付スクリプトをインポート
    import { attachPDFToContactForm } from '../../scripts/contactFormIntegration';
    
    // ページ読み込み後に実行
    attachPDFToContactForm();
  </script>
</Layout>
```

### ステップ2: WordPressとの連携

Astroサイト内でWordPressのContact Form 7を表示する方法はいくつかあります:

#### 方法A: iframeで埋め込み（簡単）

```html
<iframe 
  src="https://your-wordpress-site.com/contact-form-page" 
  width="100%" 
  height="800" 
  frameborder="0"
></iframe>
```

#### 方法B: WordPress REST APIで取得（推奨）

```typescript
// src/pages/contact/index.astro
const WORDPRESS_URL = 'https://your-wordpress-site.com';
const CF7_FORM_ID = '123'; // Contact Form 7のフォームID

const response = await fetch(
  `${WORDPRESS_URL}/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}`
);
const formData = await response.json();
```

#### 方法C: 静的HTMLとして配置

WordPressでフォームのHTMLを生成し、Astroページにコピー&ペーストします。

---

## CSSスタイリング（オプション）

### 見積番号フィールドの非表示

見積番号は自動入力されるため、ユーザーには見せない方がスマートです。

```css
/* src/styles/contact.css */

/* 見積番号フィールドを非表示 */
.estimate-number-field {
  display: none;
}

/* または、表示する場合は読み取り専用であることを示す */
.estimate-number-field {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  cursor: not-allowed;
  opacity: 0.7;
}

.estimate-number-field:focus {
  outline: none;
}
```

### PDF添付通知のスタイリング

```css
/* PDF添付成功の通知 */
.estimate-attached-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.estimate-attached-notice::before {
  content: '✅';
  font-size: 1.2rem;
}
```

### ファイルアップロードフィールドのスタイリング

```css
/* ファイルアップロードフィールド */
.wpcf7-form input[type="file"] {
  padding: 0.75rem;
  border: 2px dashed #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s ease;
}

.wpcf7-form input[type="file"]:hover {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.wpcf7-form input[type="file"]:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
```

---

## 動作確認

### チェックリスト

#### 1. 料金シミュレーター側

- [ ] 項目を選択して概算見積書を生成
- [ ] 「お問い合わせ」ボタンをクリック
- [ ] PDFが生成される（エラーなし）
- [ ] お問い合わせページに遷移する

#### 2. お問い合わせページ側

- [ ] ページが正常に表示される
- [ ] フォームが表示される
- [ ] 「✅ 見積書が添付されました」の通知が表示される
- [ ] 見積番号フィールドに値が入っている
- [ ] ファイル入力フィールドにPDFファイル名が表示される

#### 3. フォーム送信

- [ ] 名前、メールアドレスを入力
- [ ] お問い合わせ内容を入力
- [ ] 送信ボタンをクリック
- [ ] 成功メッセージが表示される

#### 4. メール受信

- [ ] 管理者にメールが届く
- [ ] メールにPDFが添付されている
- [ ] 見積番号が記載されている
- [ ] 送信者に自動返信メールが届く

#### 5. Flamingo（インストール済みの場合）

- [ ] WordPressダッシュボード > Flamingo > 受信メッセージ
- [ ] 送信されたデータが保存されている
- [ ] 添付ファイル（PDF）が確認できる

---

## トラブルシューティング

### 問題1: PDFが添付されない

**症状**: お問い合わせページで「見積書が添付されました」の通知が表示されない

**原因**:
- SessionStorageにデータがない
- スクリプトが読み込まれていない
- フィールド名が一致していない

**解決方法**:

1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブを確認
3. エラーメッセージを確認

```javascript
// Consoleで手動確認
console.log(sessionStorage.getItem('estimatePDF'));
console.log(sessionStorage.getItem('estimateNumber'));
```

4. フィールド名を確認:
```javascript
// Consoleで手動確認
document.querySelector('input[name="estimate-pdf"]');
```

### 問題2: メールにPDFが添付されない

**症状**: フォーム送信は成功するが、メールにPDFが添付されていない

**原因**:
- メールテンプレートに `[estimate-pdf]` タグがない
- ファイルサイズが大きすぎる
- WordPressのファイルアップロード制限

**解決方法**:

1. **メールタブの確認**:
   - **添付ファイル** 欄に `[estimate-pdf]` が入っているか確認

2. **PHPのファイルサイズ制限を確認**:
   ```php
   // php.iniまたは.htaccessで設定
   upload_max_filesize = 10M
   post_max_size = 10M
   memory_limit = 128M
   ```

3. **WordPressのメディアアップロード上限を確認**:
   - WordPressダッシュボード > メディア > 新規追加
   - 最大アップロードサイズを確認

### 問題3: 「ファイルサイズが大きすぎます」エラー

**症状**: PDF生成時にエラーメッセージが表示される

**原因**: 生成されたPDFが5MBを超えている

**解決方法**:

1. PDF生成ロジックを最適化:
   - 画像の解像度を下げる
   - 不要な情報を削除
   - フォントを埋め込まない

2. ファイルサイズ制限を変更:
```typescript
// src/utils/generatePDF.ts
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MBに変更
```

3. Contact Form 7のフォームタグも変更:
```
[file estimate-pdf filetypes:.pdf limit:10mb]
```

### 問題4: SessionStorageが空になる

**症状**: 別タブで開いたときにPDFデータがない

**原因**: SessionStorageはタブごとに独立している

**解決方法**:

同じタブで遷移するように確保:
```typescript
// EstimateDocument.tsx
window.location.href = '/contact'; // 同じタブで遷移
```

または、LocalStorageを使用（セキュリティに注意）。

### 問題5: CF7のイベントが発火しない

**症状**: `wpcf7mailsent` などのイベントが動作しない

**原因**: Contact Form 7がAjaxで動作していない

**解決方法**:

WordPressのContact Form 7設定を確認:
1. **お問い合わせ** > **コンタクトフォーム** > フォームを選択
2. **その他の設定** タブ
3. 以下を追加:
```
ajax: false
```

**注意**: Ajaxを無効にすると、送信後にページがリロードされます。

---

## セキュリティ対策

### 1. ファイルタイプの検証

Contact Form 7は自動的にファイルタイプを検証しますが、追加の検証を行うことを推奨します。

```php
// functions.php に追加
add_filter('wpcf7_validate_file', 'custom_pdf_validation', 10, 2);
function custom_pdf_validation($result, $file) {
  $allowed_types = array('application/pdf');
  $file_type = wp_check_filetype($file['name']);
  
  if (!in_array($file_type['type'], $allowed_types)) {
    $result->invalidate($file, 'PDFファイルのみアップロード可能です。');
  }
  
  return $result;
}
```

### 2. ファイルサイズの検証

```php
// functions.php に追加
add_filter('wpcf7_validate_file', 'custom_file_size_validation', 10, 2);
function custom_file_size_validation($result, $file) {
  $max_size = 5 * 1024 * 1024; // 5MB
  
  if ($file['size'] > $max_size) {
    $result->invalidate($file, 'ファイルサイズは5MB以下にしてください。');
  }
  
  return $result;
}
```

### 3. ファイル名のサニタイズ

```php
// functions.php に追加
add_filter('wpcf7_upload_file_name', 'sanitize_uploaded_filename');
function sanitize_uploaded_filename($filename) {
  // 日本語ファイル名を安全な形式に変換
  $filename = sanitize_file_name($filename);
  
  // タイムスタンプを追加して重複を防ぐ
  $pathinfo = pathinfo($filename);
  $timestamp = time();
  $new_filename = $pathinfo['filename'] . '_' . $timestamp . '.' . $pathinfo['extension'];
  
  return $new_filename;
}
```

---

## まとめ

### 実装完了チェックリスト

- [x] jsPDFとjspdf-autotableのインストール
- [x] PDF生成ユーティリティの作成
- [x] EstimateDocumentコンポーネントの更新
- [x] お問い合わせページのスクリプト作成
- [ ] Contact Form 7のインストールと設定
- [ ] Flamingoプラグインのインストール（推奨）
- [ ] フォームタグの設定（ファイルアップロード、見積番号）
- [ ] メールテンプレートの設定（管理者宛、送信者宛）
- [ ] お問い合わせページへのスクリプト統合
- [ ] CSSスタイリング（オプション）
- [ ] 動作確認（全6ステップ）

### 次のステップ

1. **WordPress側の設定を完了する**
   - Contact Form 7のフォーム作成
   - メールテンプレートの設定
   - Flamingoのインストール

2. **動作テストを実施する**
   - 料金シミュレーターからPDF生成
   - お問い合わせフォームでの送信
   - メール受信の確認

3. **本番環境へのデプロイ**
   - 設定のバックアップ
   - ステージング環境でのテスト
   - 本番環境への反映

---

**作成日**: 2026年02月08日  
**バージョン**: 1.0  
**関連ドキュメント**: 
- PRICING_SIMULATOR_IMPLEMENTATION.md
- ESTIMATE_TO_CONTACT_INTEGRATION.md
