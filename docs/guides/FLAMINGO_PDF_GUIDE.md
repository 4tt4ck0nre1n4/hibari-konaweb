# Flamingo での PDF 添付ファイル確認ガイド

## 概要

このガイドでは、Contact Form 7 から送信された概算見積書PDFファイルを、WordPress の Flamingo プラグインで確認する方法を説明します。

---

## 前提条件

### 必要なプラグイン

1. **Contact Form 7 (CF7)**
   - バージョン: 5.0 以上推奨
   - お問い合わせフォームの管理

2. **Flamingo**
   - バージョン: 2.0 以上推奨
   - Contact Form 7 のメッセージ保存機能を提供

### インストール確認

WordPressダッシュボード > プラグイン で以下を確認：
- Contact Form 7: 有効化済み
- Flamingo: 有効化済み

---

## PDF 添付ファイルの確認手順

### 1. Flamingo メニューへアクセス

1. WordPress 管理画面にログイン
2. 左サイドバーから **Flamingo** をクリック
3. **受信メッセージ** を選択

![Flamingoメニュー](https://i.imgur.com/example1.png)

### 2. メッセージ一覧の表示

受信メッセージ一覧画面に、以下の情報が表示されます：

| 列名 | 説明 |
|------|------|
| 件名 | フォームのタイトル（例: 「お問い合わせ」） |
| 送信者 | 送信者の名前 |
| メールアドレス | 送信者のメールアドレス |
| 日付 | 送信日時 |

### 3. メッセージ詳細を開く

1. 確認したいメッセージの行をクリック
2. メッセージ詳細画面が開きます

### 4. 添付ファイルの確認

メッセージ詳細画面の下部に、以下のセクションがあります：

#### メッセージ本文
```
お名前: 山田太郎
メールアドレス: yamada@example.com
電話番号: 090-1234-5678
お問い合わせ内容: 見積書について質問があります。
見積番号: EST-20260209-8051
```

#### 添付ファイル

**表示形式**:
```
estimate_EST-20260209-8051.pdf (1.2 MB)
```

**操作方法**:
- ファイル名をクリックすると、PDFがダウンロードされます
- ダウンロード後、お使いのPDFリーダーで開いて内容を確認できます

### 5. メタ情報の確認

メッセージ詳細画面には、以下の追加情報も表示されます：

- **送信者名**: フォームの「お名前」フィールド
- **メールアドレス**: フォームの「メールアドレス」フィールド
- **見積番号**: 自動生成された見積番号（`estimate-number`フィールド）
- **送信日時**: フォーム送信のタイムスタンプ
- **送信元IP**: セキュリティ確認用

---

## トラブルシューティング

### 問題1: 添付ファイルが表示されない

**原因と対処法**:

#### A. Contact Form 7 のフォームタグが正しくない

**確認方法**:
1. WordPressダッシュボード > お問い合わせ > コンタクトフォーム
2. 該当のフォームを編集
3. フォームタブで以下のタグがあるか確認：

```html
[file estimate-pdf]
```

**修正方法**:
- タグが無い場合は追加
- タグジェネレーターの「ファイル」から生成可能
- 詳細は [`CF7_PDF_INTEGRATION_GUIDE.md`](./CF7_PDF_INTEGRATION_GUIDE.md) を参照

#### B. メールテンプレートにファイル添付設定がない

**確認方法**:
1. フォーム編集画面の「メール」タブを開く
2. 「ファイル添付」欄を確認

**必要な設定**:
```
[estimate-pdf]
```

**注意点**:
- メール(1) と メール(2) の両方に設定が必要
- メール(1): 管理者宛
- メール(2): 送信者宛（自動返信）

#### C. WordPressのアップロードフォルダに書き込み権限がない

**確認方法**:
```bash
# Linuxサーバーの場合
ls -la wp-content/uploads
```

**修正方法**:
```bash
# 権限を付与
chmod 755 wp-content/uploads
chown www-data:www-data wp-content/uploads
```

Windows（Local by Flywheel等）の場合:
- フォルダを右クリック > プロパティ > セキュリティ
- ユーザーに「書き込み」権限を付与

### 問題2: PDFファイルが開けない・壊れている

**症状**:
- ダウンロードはできるが、PDFリーダーで「ファイルが壊れています」と表示される

**原因**:
1. Base64エンコードが正しくない
2. ファイルサイズが大きすぎる（5MB制限）
3. セッションストレージのデータが破損

**対処法**:

#### A. ブラウザのコンソールで確認

1. ブラウザの開発者ツールを開く（F12）
2. コンソールタブで以下を実行：

```javascript
console.log(sessionStorage.getItem('estimatePDF'));
```

**正常な出力例**:
```
data:application/pdf;base64,JVBERi0xLjcKJeLjz9MK...
```

**異常な出力例**:
```
null
undefined
[object Object]
```

#### B. ファイルサイズを確認

```javascript
const pdfData = sessionStorage.getItem('estimatePDF');
const size = new Blob([pdfData]).size;
console.log('PDF size:', size, 'bytes');
```

5MB（5,242,880 bytes）を超える場合:
- 見積書のデザインを簡略化
- 画像の解像度を下げる（`html2canvas` の `scale` オプションを調整）

### 問題3: ファイルサイズが大きすぎる

**症状**:
- 「PDFファイルサイズが大きすぎます（最大5MB）」というアラートが表示される

**原因**:
- Contact Form 7 のファイルサイズ制限
- サーバーの `php.ini` 設定

**対処法**:

#### A. Contact Form 7 のファイルサイズ制限を確認

フォーム編集画面のファイルタグ:
```
[file estimate-pdf limit:5mb]
```

#### B. サーバーの PHP 設定を確認・変更

**確認方法**:
1. WordPressダッシュボード > ツール > サイトヘルス > 情報
2. 「サーバー」タブを開く
3. `upload_max_filesize` と `post_max_size` を確認

**推奨設定**:
```ini
upload_max_filesize = 10M
post_max_size = 10M
memory_limit = 256M
```

**設定ファイルの場所**:
- 共有サーバー: `.htaccess` または `.user.ini`
- VPS/専用サーバー: `/etc/php/7.4/apache2/php.ini`（PHPバージョンによって異なる）

**Local by Flywheel の場合**:
1. サイトを右クリック > Open Site Shell
2. `nano /etc/php/7.4/apache2/php.ini` （PHPバージョンに合わせる）
3. 上記の設定を追加・変更
4. `sudo service apache2 restart` でサーバーを再起動

### 問題4: 添付ファイルはあるが、メール送信に失敗する

**症状**:
- Flamingo に受信メッセージは保存される
- しかし、メールが届かない

**原因**:
- メールサーバーの添付ファイルサイズ制限
- SMTPサーバーの設定問題

**対処法**:

#### A. SMTP プラグインを使用

推奨プラグイン:
- **WP Mail SMTP**
- **Easy WP SMTP**

#### B. メール送信ログを確認

プラグイン「Email Log」をインストールして、送信失敗の詳細を確認

---

## ベストプラクティス

### 1. 定期的なバックアップ

Flamingo のデータは WordPress のデータベースに保存されます。定期的にバックアップを取りましょう。

**推奨プラグイン**:
- UpdraftPlus
- BackWPup

### 2. 古いメッセージの削除

Flamingo にメッセージが溜まりすぎると、データベースが肥大化します。定期的に古いメッセージを削除しましょう。

**削除方法**:
1. Flamingo > 受信メッセージ
2. 削除したいメッセージにチェック
3. 「ゴミ箱へ移動」を選択
4. 「適用」をクリック
5. ゴミ箱から完全に削除

### 3. 添付ファイルの保存期間を設定

重要なPDFは別途保存しておくことをおすすめします。

**保存方法**:
1. Flamingo からPDFをダウンロード
2. クラウドストレージ（Google Drive、Dropbox等）に保存
3. または、専用のドキュメント管理システムに保存

---

## FAQ

### Q1: Flamingo を使わずに添付ファイルを確認できますか？

**A**: はい、メールで受信した添付ファイルを確認できます。ただし、Flamingo を使用すると以下のメリットがあります：
- メッセージの一元管理
- 検索機能
- メール送信失敗時のバックアップ

### Q2: 添付ファイルをWordPressのメディアライブラリに自動保存できますか？

**A**: Contact Form 7 はデフォルトでメディアライブラリに保存しません。以下のプラグインで対応可能です：
- **Flamingo to Media Library**
- **CF7 DBプラグイン** + カスタムフック

実装例（`functions.php`）:
```php
add_action('wpcf7_before_send_mail', 'save_pdf_to_media_library');

function save_pdf_to_media_library($contact_form) {
  $submission = WPCF7_Submission::get_instance();
  if (!$submission) return;
  
  $uploaded_files = $submission->uploaded_files();
  if (empty($uploaded_files['estimate-pdf'])) return;
  
  $file = $uploaded_files['estimate-pdf'];
  
  // メディアライブラリに保存
  $upload = wp_upload_bits(
    basename($file),
    null,
    file_get_contents($file)
  );
  
  if (!$upload['error']) {
    $attachment = array(
      'post_mime_type' => 'application/pdf',
      'post_title' => basename($file),
      'post_content' => '',
      'post_status' => 'inherit'
    );
    
    wp_insert_attachment($attachment, $upload['file']);
  }
}
```

### Q3: PDFファイルを自動的に削除するには？

**A**: Flamingo のメッセージを削除すれば、関連する添付ファイルも削除されます。自動削除の設定は現時点でサポートされていません。

### Q4: 複数のPDFを添付できますか？

**A**: はい、Contact Form 7 のフォームタグを複数追加することで可能です：

```html
[file estimate-pdf-1]
[file estimate-pdf-2]
```

メールテンプレートの「ファイル添付」欄:
```
[estimate-pdf-1]
[estimate-pdf-2]
```

---

## 関連ドキュメント

- [`ESTIMATE_TO_CONTACT_INTEGRATION.md`](./ESTIMATE_TO_CONTACT_INTEGRATION.md) - PDF生成とお問い合わせフォーム統合
- [`CF7_PDF_INTEGRATION_GUIDE.md`](./CF7_PDF_INTEGRATION_GUIDE.md) - Contact Form 7 の詳細設定
- [`PRICING_SIMULATOR_IMPLEMENTATION.md`](./PRICING_SIMULATOR_IMPLEMENTATION.md) - 料金シミュレーターの実装

---

## サポート

問題が解決しない場合は、以下をご確認ください：

1. **WordPress バージョン**: 6.0 以上推奨
2. **PHP バージョン**: 7.4 以上推奨
3. **Contact Form 7 バージョン**: 5.0 以上推奨
4. **Flamingo バージョン**: 2.0 以上推奨

技術的な問題については、各プラグインの公式サポートフォーラムをご利用ください：

- [Contact Form 7 サポート](https://wordpress.org/support/plugin/contact-form-7/)
- [Flamingo サポート](https://wordpress.org/support/plugin/flamingo/)
