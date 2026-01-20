# WordPressテーマファイル更新ガイド

## ⚠️ 重要な注意事項

**`functions.php`などのWordPressテーマファイルは、AstroのビルドやNetlifyへのデプロイでは反映されません。**

WordPressのテーマファイルは、**本番環境のWordPressサーバー（hibari-konaweb.com）に直接アップロード**する必要があります。

---

## 📋 本番環境への反映手順

### 方法1: FTPクライアントを使用（推奨）

#### ステップ1: FTP接続情報を確認

ConoHa WINGのコントロールパネルから以下を確認：

- FTPホスト名
- FTPユーザー名
- FTPパスワード
- ポート番号（通常は21）

#### ステップ2: FTPクライアントで接続

1. **FTPクライアントを起動**

   - FileZilla（無料・推奨）
   - WinSCP
   - Cyberduck
   - その他のFTPクライアント

2. **ConoHa WINGに接続**
   - ホスト: ConoHa WINGから提供されたFTPホスト名
   - ユーザー名: FTPユーザー名
   - パスワード: FTPパスワード
   - ポート: 21（または提供された番号）

#### ステップ3: functions.phpをアップロード

1. **ローカルのfunctions.phpを開く**

   ```
   ローカル: C:\Users\yooth-k\Local Sites\hibari-konaweb\app\public\wp-content\themes\arkhe\functions.php
   ```

2. **サーバー側のfunctions.phpを開く**

   ```
   サーバー: /public_html/wp-content/themes/arkhe/functions.php
   ```

3. **ファイルをアップロード**

   - ローカルの`functions.php`をサーバー側にドラッグ&ドロップ
   - または、サーバー側の`functions.php`を右クリック → 「アップロード」を選択

4. **上書き確認**
   - 既存のファイルを上書きするか確認されるので、「上書き」を選択

#### ステップ4: 動作確認

1. **ブラウザで確認**

   - `https://hibari-konaweb.com/blog/` にアクセス
   - `https://hibari-konaweb.netlify.app/blog/` にリダイレクトされることを確認

2. **REST APIが正常に動作することを確認**

   - `https://hibari-konaweb.com/wp-json/wp/v2/posts` にアクセス
   - JSONデータが表示されることを確認

3. **管理画面が正常に動作することを確認**
   - `https://hibari-konaweb.com/wp-admin/` にアクセス
   - 正常にログインできることを確認

---

### 方法2: ConoHa WINGのファイルマネージャーを使用

#### ステップ1: ファイルマネージャーにアクセス

1. **ConoHa WINGのコントロールパネルにログイン**
2. **「ファイルマネージャー」を開く**

#### ステップ2: functions.phpを編集

1. **テーマディレクトリに移動**

   ```
   public_html/wp-content/themes/arkhe/
   ```

2. **functions.phpを選択**

   - `functions.php`を右クリック → 「編集」を選択

3. **ファイルの内容をコピー&ペースト**
   - ローカルの`functions.php`の内容をすべてコピー
   - ファイルマネージャーのエディタにペースト
   - 「保存」をクリック

#### ステップ3: 動作確認

方法1のステップ4と同じ手順で確認してください。

---

### 方法3: WordPress管理画面から直接編集（簡易版）

⚠️ **注意**: この方法は、変更内容が少ない場合のみ推奨します。大量のコードを追加する場合は、FTPまたはファイルマネージャーを使用してください。

#### ステップ1: WordPress管理画面にログイン

1. `https://hibari-konaweb.com/wp-admin/` にアクセス
2. ログイン

#### ステップ2: テーマエディタを開く

1. **「外観」→「テーマファイルエディター」** をクリック
2. 右側の「テーマファイルを選択」から `functions.php` を選択

#### ステップ3: コードを追加

1. ローカルの`functions.php`の最後に追加したコード（277行目以降）をコピー
2. 管理画面のエディタに貼り付け
3. 「ファイルを更新」をクリック

⚠️ **警告**: この方法でエラーが発生すると、サイトが表示できなくなる可能性があります。必ずバックアップを取ってから実行してください。

---

## 🔍 反映確認方法

### 1. リダイレクトの確認

```bash
# ブラウザで以下にアクセス
https://hibari-konaweb.com/blog/

# 期待される動作:
# → https://hibari-konaweb.netlify.app/blog/ にリダイレクトされる
```

### 2. REST APIの確認

```bash
# ブラウザで以下にアクセス
https://hibari-konaweb.com/wp-json/wp/v2/posts

# 期待される動作:
# → JSONデータが表示される（リダイレクトされない）
```

### 3. 管理画面の確認

```bash
# ブラウザで以下にアクセス
https://hibari-konaweb.com/wp-admin/

# 期待される動作:
# → ログイン画面が表示される（リダイレクトされない）
```

### 4. コメント投稿の確認

```bash
# ブラウザで以下にアクセス
https://hibari-konaweb.com/wp-comments-post.php

# 期待される動作:
# → https://hibari-konaweb.netlify.app/contact にリダイレクトされる
```

### 5. noindexメタタグの確認

1. `https://hibari-konaweb.com/blog/` にアクセス（リダイレクトされる前に）
2. ページのソースを表示（右クリック → 「ページのソースを表示」）
3. `<head>`内に以下が含まれていることを確認：
   ```html
   <meta name="robots" content="noindex, nofollow" />
   ```

---

## ⚠️ トラブルシューティング

### 問題1: サイトが表示できなくなった

**原因**: `functions.php`に構文エラーがある可能性があります。

**解決策**:

1. **FTPまたはファイルマネージャーでfunctions.phpを確認**
2. **エラーログを確認**
   - ConoHa WINGのコントロールパネル → 「エラーログ」を確認
3. **バックアップから復元**
   - 変更前の`functions.php`をアップロード

### 問題2: リダイレクトが動作しない

**原因**:

- キャッシュが残っている
- 条件分岐が正しく動作していない

**解決策**:

1. **ブラウザのキャッシュをクリア**
   - `Ctrl + Shift + Delete`（Windows）
   - `Cmd + Shift + Delete`（Mac）
2. **シークレットモードで確認**
3. **functions.phpの条件分岐を確認**

### 問題3: REST APIにアクセスできない

**原因**: リダイレクトの条件が厳しすぎる可能性があります。

**解決策**:

1. **functions.phpの条件を確認**

   ```php
   // 以下の条件が含まれていることを確認
   strpos( $_SERVER['REQUEST_URI'], '/wp-json' ) !== false
   ```

2. **直接確認**
   ```bash
   curl https://hibari-konaweb.com/wp-json/wp/v2/posts
   ```

---

## 📝 今後の更新について

`functions.php`を更新する場合は、**必ず本番環境のWordPressサーバーに直接アップロード**してください。

### 推奨ワークフロー

1. **ローカル環境で変更を加える**

   ```
   app/public/wp-content/themes/arkhe/functions.php
   ```

2. **動作確認**

   - ローカル環境でテスト

3. **本番環境にアップロード**

   - FTPまたはファイルマネージャーを使用

4. **本番環境で動作確認**
   - リダイレクトが正常に動作することを確認

---

## 🔐 セキュリティに関する注意事項

- `functions.php`には機密情報を含めないでください
- 定期的にバックアップを取ってください
- 変更前には必ずバックアップを取ってください
- 本番環境での変更は慎重に行ってください

---

## 📚 参考リンク

- [WordPress Codex: functions.php](https://codex.wordpress.org/Functions_File_Explained)
- [ConoHa WING マニュアル](https://support.conoha.jp/wing/)
- [FileZilla ダウンロード](https://filezilla-project.org/)












