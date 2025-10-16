# ヘッドレスWordPress 本番環境移行ガイド

このガイドでは、ローカル開発環境のヘッドレスWordPressを本番環境に移行する手順を説明します。

## 📋 目次

1. [準備](#1-準備)
2. [移行方法の選択](#2-移行方法の選択)
3. [方法A: All-in-One WP Migrationを使用した移行（推奨・初心者向け）](#3-方法a-all-in-one-wp-migrationを使用した移行推奨初心者向け)
4. [方法B: 手動移行（上級者向け）](#4-方法b-手動移行上級者向け)
5. [Astroフロントエンドの設定](#5-astroフロントエンドの設定)
6. [環境変数の設定](#6-環境変数の設定)
7. [デプロイ](#7-デプロイ)
8. [確認とテスト](#8-確認とテスト)
9. [トラブルシューティング](#9-トラブルシューティング)

---

## 1. 準備

### 必要なもの

- **WordPressホスティング**

  - VPS (推奨): DigitalOcean, AWS, Linode, ConoHa VPS など
  - 共有ホスティング: エックスサーバー、さくらインターネット、ロリポップ など
  - マネージドWordPress: Kinsta, WP Engine など

- **フロントエンドホスティング**
  - Netlify (現在使用中)
  - Vercel
  - Cloudflare Pages
  - AWS Amplify

### チェックリスト

```bash
# 現在のプロジェクト構成を確認
□ app/public/       # WordPress本体
□ app/sql/          # データベース
□ dist/             # ビルド済みフロントエンド
□ src/              # Astroソースコード
```

---

## 2. 移行方法の選択

WordPressの移行には2つの方法があります：

### 方法A: All-in-One WP Migration（推奨）

**メリット：**

- ✅ 初心者でも簡単
- ✅ ワンクリックで完全バックアップ
- ✅ データベース、ファイル、プラグイン、テーマを一括移行
- ✅ URLの自動置換
- ✅ 失敗のリスクが低い

**デメリット：**

- ⚠️ 無料版は512MBまで（有料版で無制限）
- ⚠️ 大規模サイトには不向き

**おすすめの人：**

- WordPressが初めての方
- サイトサイズが512MB以下
- 簡単・確実に移行したい方

### 方法B: 手動移行

**メリット：**

- ✅ 完全無料
- ✅ サイズ制限なし
- ✅ 細かい制御が可能

**デメリット：**

- ⚠️ 技術的な知識が必要
- ⚠️ 手順が多く時間がかかる
- ⚠️ ミスのリスクがある

**おすすめの人：**

- 技術的に詳しい方
- サイトサイズが大きい（512MB以上）
- 細かい制御をしたい方

---

## 3. 方法A: All-in-One WP Migrationを使用した移行（推奨・初心者向け）

### 3.1 ローカル環境での準備

#### ステップ1: プラグインのインストール

1. **Local by Flywheelでサイトを起動**

   ```bash
   # Localアプリでサイトを選択
   # 「Start」ボタンをクリック
   ```

2. **WordPressダッシュボードにアクセス**

   - Localの「WP Admin」ボタンをクリック
   - または、ブラウザで `http://hibari-konaweb.local/wp-admin` にアクセス

3. **All-in-One WP Migrationプラグインをインストール**

   - 左メニュー：「プラグイン」→「新規追加」
   - 検索ボックスに「All-in-One WP Migration」と入力
   - 「今すぐインストール」をクリック
   - 「有効化」をクリック

4. **拡張機能のインストール（オプション）**

   サイトサイズが512MBを超える場合：

   - 「All-in-One WP Migration Unlimited Extension」を購入（$69）
   - または、「File Extension」を使用（後述の代替方法）

#### ステップ2: エクスポート

1. **エクスポートメニューを開く**

   - 左メニュー：「All-in-One WP Migration」→「エクスポート」

2. **エクスポート先を選択**

   ```
   「エクスポート先」→「ファイル」を選択
   ```

3. **エクスポート設定（オプション）**

   必要に応じて以下を除外できます：

   - 「高度なオプション」をクリック
   - 不要なものにチェック：
     - スパムコメント
     - 投稿のリビジョン
     - メディアライブラリ（後で手動アップロードする場合）

4. **エクスポート実行**

   - 「エクスポート先」→「ファイル」をクリック
   - エクスポートが完了するまで待つ（数分～数十分）
   - `.wpress` ファイルがダウンロードされる
   - ファイル名例：`hibari-konaweb-20251016-123456-789.wpress`

5. **エクスポートファイルの保存**
   ```bash
   # 分かりやすい場所に保存
   例: C:\Users\yooth-k\Desktop\wordpress-backup.wpress
   ```

**⚠️ 重要な注意点：**

- エクスポート中はブラウザを閉じないでください
- ファイルサイズが大きい場合は時間がかかります
- 完了したら必ずダウンロードしてください

#### ステップ3: サイトサイズの確認

エクスポートファイルのサイズを確認：

```
512MB以下 → 無料版で移行可能 ✅
512MB以上 → 以下の選択肢：
  - 有料版を購入（$69）
  - 代替方法を使用（後述）
  - 手動移行に切り替え
```

### 3.2 本番環境での準備

#### ステップ1: WordPressのインストール

**共有ホスティングの場合（エックスサーバー等）：**

1. **cPanelにログイン**

   - ホスティングプロバイダーから提供された情報でログイン

2. **WordPressのインストール**

   - 「WordPress」アイコンをクリック
   - または「Softaculous Apps Installer」を使用
   - インストール先ドメインを選択
   - サイト名、管理者情報を入力
   - 「インストール」をクリック

3. **インストール情報をメモ**
   ```
   サイトURL: https://your-domain.com
   管理者URL: https://your-domain.com/wp-admin
   管理者ユーザー名: （設定したもの）
   管理者パスワード: （設定したもの）
   ```

**VPS/独自サーバーの場合：**

1. **SSHでサーバーに接続**

   ```bash
   ssh user@your-server-ip
   ```

2. **WordPressのインストール**

   ```bash
   # WordPressをダウンロード
   cd /var/www/html
   wget https://ja.wordpress.org/latest-ja.tar.gz
   tar -xzf latest-ja.tar.gz
   mv wordpress/* .
   rm -rf wordpress latest-ja.tar.gz

   # パーミッション設定
   chown -R www-data:www-data /var/www/html
   chmod -R 755 /var/www/html
   ```

3. **データベースの作成**

   ```bash
   # MySQLにログイン
   mysql -u root -p

   # データベースを作成
   CREATE DATABASE wordpress_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wp_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **wp-config.phpの設定**

   ```bash
   cp wp-config-sample.php wp-config.php
   nano wp-config.php

   # データベース情報を編集
   define('DB_NAME', 'wordpress_db');
   define('DB_USER', 'wp_user');
   define('DB_PASSWORD', 'strong_password');
   define('DB_HOST', 'localhost');
   ```

5. **WordPressセットアップ**
   - ブラウザで `https://your-domain.com` にアクセス
   - 画面の指示に従ってセットアップを完了

#### ステップ2: All-in-One WP Migrationのインストール（本番環境）

1. **本番環境のWordPressにログイン**

   - `https://your-domain.com/wp-admin` にアクセス

2. **プラグインをインストール**
   - 「プラグイン」→「新規追加」
   - 「All-in-One WP Migration」を検索
   - 「今すぐインストール」→「有効化」

### 3.3 インポート（本番環境への移行）

#### ステップ1: アップロードサイズの確認と変更

1. **現在の上限を確認**

   - 「All-in-One WP Migration」→「インポート」
   - 「最大アップロードファイルサイズ」を確認

2. **アップロードサイズを増やす方法**

**方法1: .htaccessを編集（Apacheサーバー）**

```apache
# WordPressルートディレクトリの .htaccess に追加
php_value upload_max_filesize 512M
php_value post_max_size 512M
php_value max_execution_time 300
php_value max_input_time 300
```

**方法2: php.iniを編集（VPS/独自サーバー）**

```ini
upload_max_filesize = 512M
post_max_size = 512M
max_execution_time = 300
max_input_time = 300
memory_limit = 512M
```

**方法3: wp-config.phpに追加**

```php
@ini_set('upload_max_filesize', '512M');
@ini_set('post_max_size', '512M');
@ini_set('max_execution_time', '300');
```

**方法4: FTPでプラグインフォルダに直接アップロード**

```bash
# エクスポートファイルを以下のディレクトリにアップロード
wp-content/ai1wm-backups/

# FTPクライアント（FileZilla等）を使用
# または SCPコマンド
scp wordpress-backup.wpress user@server:/path/to/wp-content/ai1wm-backups/
```

#### ステップ2: インポート実行

1. **インポートメニューを開く**

   - 「All-in-One WP Migration」→「インポート」

2. **ファイルをアップロード**

   **方法A: ドラッグ&ドロップ**

   - `.wpress` ファイルをブラウザにドラッグ&ドロップ

   **方法B: ファイル選択**

   - 「ファイルからインポート」をクリック
   - エクスポートした `.wpress` ファイルを選択

   **方法C: すでにFTPでアップロード済みの場合**

   - インポート画面に自動的に表示される
   - リストから選択

3. **インポート確認**

   ```
   ⚠️ 警告メッセージが表示されます：
   「このサイトのデータは削除され、インポートしたデータに置き換えられます。」

   ✅ 「続行」をクリック
   ```

4. **インポート実行**

   - インポートが開始されます（数分～数十分）
   - **絶対にブラウザを閉じないでください**
   - 進行状況が表示されます

5. **完了確認**
   ```
   「インポートが完了しました」と表示されたら成功 ✅
   ```

#### ステップ3: パーマリンク設定の保存

インポート完了後、**必ず**以下を実行：

1. **WordPressに再ログイン**

   - 自動的にログアウトされている場合があります
   - ローカル環境の管理者情報でログイン

2. **パーマリンク設定を保存**
   - 「設定」→「パーマリンク設定」
   - 何も変更せずに「変更を保存」をクリック
   - これで `.htaccess` が再生成されます

#### ステップ4: サイトの確認

1. **フロントエンドの確認**

   ```
   https://your-domain.com
   ```

2. **管理画面の確認**

   ```
   https://your-domain.com/wp-admin
   ```

3. **REST APIの確認**
   ```
   https://your-domain.com/wp-json/wp/v2/posts
   https://your-domain.com/wp-json/wp/v2/works
   ```

### 3.4 All-in-One WP Migration 代替方法（512MB以上の場合）

エクスポートファイルが512MBを超える場合の対処法：

#### 方法1: メディアファイルを除外してエクスポート

1. **メディアなしでエクスポート**

   - 「高度なオプション」→「メディアライブラリをエクスポートしない」
   - これでファイルサイズが大幅に削減される

2. **本番環境にインポート**

   - 通常通りインポート

3. **メディアファイルを手動アップロード**
   ```bash
   # FTPで以下のディレクトリをアップロード
   ローカル: app/public/wp-content/uploads/
   本番: wp-content/uploads/
   ```

#### 方法2: Duplicatorプラグインを使用

```bash
# Duplicatorは無料で大容量対応
1. Duplicatorプラグインをインストール
2. パッケージを作成
3. installer.phpとパッケージファイルをダウンロード
4. 本番サーバーにアップロード
5. installer.phpを実行
```

#### 方法3: UpdraftPlusを使用

```bash
# バックアップを細分化できる
1. UpdraftPlusプラグインをインストール
2. バックアップを作成
3. Googleドライブ等に保存
4. 本番環境でリストア
```

### 3.5 CORS設定（ヘッドレスWordPress用）

All-in-One WP Migrationで移行後、**必ず**CORS設定を追加：

#### 方法1: プラグインを使用

1. **プラグインのインストール**

   - 「WP-CORS」プラグインをインストール
   - 作者: tstephenson
   - 検索キーワード: "WP-CORS"

2. **設定**
   - プラグインの設定画面で許可するドメインを追加
   - 許可するドメイン: `https://hibari-konaweb.netlify.app`
   - 必要に応じて `http://localhost:4321`（ローカル開発用）も追加

#### 方法2: functions.phpに追加

**⚠️ 注意**: テーマを更新すると設定が消えるため、子テーマの使用を推奨します。

```php
// wp-content/themes/arkhe/functions.php
// または子テーマの functions.php

// CORS設定（ヘッドレスWordPress用）
function add_cors_http_header() {
    // 許可するドメインのリスト
    $allowed_origins = array(
        'https://hibari-konaweb.netlify.app',  // 本番環境
        'http://localhost:4321',               // ローカル開発環境
        'http://127.0.0.1:4321',              // ローカル開発環境（代替）
    );

    // リクエスト元のドメインを取得
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    // 許可されたドメインかチェック
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
    }

    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");

    // OPTIONSリクエスト（プリフライトリクエスト）の処理
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
add_action('init', 'add_cors_http_header');
```

**編集方法:**

1. FTPまたはファイルマネージャーで `wp-content/themes/arkhe/functions.php` を開く
2. ファイルの最後（`?>` の前）に上記のコードを追加
3. ファイルを保存

#### 方法3: .htaccessに追加

```apache
# .htaccess

<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://hibari-konaweb.netlify.app"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

### 3.6 SSL証明書の設定

1. **無料SSL証明書（Let's Encrypt）**

   **共有ホスティングの場合：**

   - cPanelの「SSL/TLS」セクション
   - 「Let's Encrypt」をクリック
   - ドメインを選択して「発行」

   **VPS/独自サーバーの場合：**

   ```bash
   # Certbotをインストール
   sudo apt install certbot python3-certbot-apache

   # SSL証明書を取得
   sudo certbot --apache -d your-domain.com -d www.your-domain.com

   # 自動更新を設定
   sudo certbot renew --dry-run
   ```

2. **WordPressのURL設定**

   ```php
   // wp-config.php に追加
   define('WP_HOME', 'https://your-domain.com');
   define('WP_SITEURL', 'https://your-domain.com');

   // HTTPSを強制
   if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
       $_SERVER['HTTPS'] = 'on';
   }
   ```

---

## 4. 方法B: 手動移行（上級者向け）

### 4.1 データベースのエクスポート

```bash
# Local by Flywheel を使用している場合
# Database タブから「Adminer」を開く

# または、MySQLダンプを直接エクスポート
# app/sql/local.sql を確認
```

**手順:**

1. **LocalのAdminerを開く**

   - Localアプリを開く
   - サイトを選択
   - 「Database」タブ → 「Open Adminer」

2. **データベースのエクスポート**
   - 左側のデータベース名をクリック
   - 「Export」をクリック
   - 形式: SQL
   - オプション: 「DROP」「CREATE」を選択
   - 「Export」ボタンをクリック
   - ファイルを保存 (例: `production-export-2025-10-16.sql`)

### 4.2 WordPress本体のアップロード

```bash
# app/public/ ディレクトリ全体を本番サーバーにアップロード

# FTPまたはSFTPを使用
# 推奨ツール: FileZilla, Cyberduck, WinSCP
```

**手順:**

1. **本番サーバーに接続**

   - ホスティングプロバイダーからFTP/SFTP情報を取得
   - FTPクライアントで接続

2. **ファイルのアップロード**

   - `app/public/` の中身を、サーバーの公開ディレクトリ（通常は `public_html/` や `www/`）にアップロード
   - **注意**: `wp-config.php` は後で編集します

3. **アップロード除外ファイル（不要なもの）**
   ```
   local-xdebuginfo.php
   readme.html
   ```

### 4.3 データベースのインポート

```bash
# 本番サーバーのphpMyAdminまたはAdminerを使用
```

**手順:**

1. **本番データベースの作成**

   - cPanelまたはホスティングパネルでMySQLデータベースを作成
   - データベース名、ユーザー名、パスワードをメモ

2. **データベースのインポート**

   - phpMyAdminを開く
   - 作成したデータベースを選択
   - 「インポート」タブをクリック
   - エクスポートしたSQLファイルを選択
   - 「実行」をクリック

3. **URLの置換（重要！）**

   データベース内のローカルURLを本番URLに置き換えます。

   **方法1: WP-CLIを使用（推奨）**

   ```bash
   # SSHで本番サーバーに接続
   cd /path/to/wordpress

   wp search-replace 'http://hibari-konaweb.local' 'https://your-domain.com' --all-tables
   ```

   **方法2: Better Search Replace プラグインを使用**

   - WordPressにログイン
   - プラグイン「Better Search Replace」をインストール
   - ツール → Better Search Replace
   - Search for: `http://hibari-konaweb.local`
   - Replace with: `https://your-domain.com`
   - Select tables: すべて選択
   - 「Run Search/Replace」をクリック

   **方法3: SQLを直接実行（上級者向け）**

   ```sql
   UPDATE wp_options
   SET option_value = replace(option_value, 'http://hibari-konaweb.local', 'https://your-domain.com')
   WHERE option_name = 'home' OR option_name = 'siteurl';

   UPDATE wp_posts
   SET guid = replace(guid, 'http://hibari-konaweb.local','https://your-domain.com');

   UPDATE wp_posts
   SET post_content = replace(post_content, 'http://hibari-konaweb.local', 'https://your-domain.com');

   UPDATE wp_postmeta
   SET meta_value = replace(meta_value,'http://hibari-konaweb.local','https://your-domain.com');
   ```

### 4.4 wp-config.php の設定

本番サーバーの `wp-config.php` を編集します。

```php
<?php
/**
 * WordPress の基本設定
 */

// ** データベース設定 - この情報はホスティングから取得 ** //
define( 'DB_NAME', 'production_database_name' );
define( 'DB_USER', 'production_database_user' );
define( 'DB_PASSWORD', 'production_database_password' );
define( 'DB_HOST', 'localhost' ); // または提供されたホスト名
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

/**
 * 認証用ユニークキー
 * https://api.wordpress.org/secret-key/1.1/salt/ で新しいキーを生成
 */
define('AUTH_KEY',         'ここに新しいキーを貼り付け');
define('SECURE_AUTH_KEY',  'ここに新しいキーを貼り付け');
define('LOGGED_IN_KEY',    'ここに新しいキーを貼り付け');
define('NONCE_KEY',        'ここに新しいキーを貼り付け');
define('AUTH_SALT',        'ここに新しいキーを貼り付け');
define('SECURE_AUTH_SALT', 'ここに新しいキーを貼り付け');
define('LOGGED_IN_SALT',   'ここに新しいキーを貼り付け');
define('NONCE_SALT',       'ここに新しいキーを貼り付け');

/**
 * WordPress データベーステーブルの接頭辞
 */
$table_prefix = 'wp_';

/**
 * 開発者向け: WordPress デバッグモード
 */
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

/**
 * CORS設定（ヘッドレスWordPress用）
 */
// フロントエンドのドメインを許可
define( 'ALLOW_CORS_ORIGINS', 'https://hibari-konaweb.netlify.app' );

/* 編集が必要なのはここまでです ! */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
```

### 4.5 .htaccess の設定（Apacheの場合）

WordPress のルートディレクトリに `.htaccess` ファイルを作成または編集：

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress

# CORS設定（ヘッドレスWordPress用）
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://hibari-konaweb.netlify.app"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

### 4.6 パーマリンク設定の保存

1. WordPressダッシュボードにログイン（`https://your-domain.com/wp-admin`）
2. 「設定」→「パーマリンク設定」を開く
3. 何も変更せずに「変更を保存」をクリック（.htaccessを再生成）

### 4.7 REST API の確認

ブラウザで以下のURLにアクセスして、REST APIが動作しているか確認：

```
https://your-domain.com/wp-json/wp/v2/posts
https://your-domain.com/wp-json/wp/v2/works
```

---

## 5. Astroフロントエンドの設定

### 5.1 環境変数ファイルの作成

プロジェクトルートに `.env.production` ファイルを作成：

```bash
# .env.production

# 本番WordPressのURL
PUBLIC_API_URL=https://your-wordpress-domain.com
PUBLIC_API_PREFIX=/wp-json/wp/v2/

# Contact Form 7 設定
PUBLIC_WPCF7_API_PREFIX=contact-form-7/v1/contact-forms/
PUBLIC_WPCF7_API_ID=123
PUBLIC_WPCF7_ID=123
PUBLIC_WPCF7_UNIT_TAG=wpcf7-f123-p456-o1
PUBLIC_WPCF7_POST_ID=456
```

**Contact Form 7のIDを確認する方法:**

1. WordPress管理画面にログイン
2. 「お問い合わせ」→「コンタクトフォーム」を開く
3. フォームを選択
4. URLに表示されるID（例：`post=123`）をメモ
5. フォームのショートコードから `wpcf7-f123-p456-o1` の形式を確認

---

## 6. 環境変数の設定

### 6.1 Netlifyの環境変数設定

1. **Netlifyダッシュボードにログイン**

   - https://app.netlify.com/

2. **サイトを選択**

   - デプロイするサイトをクリック

3. **環境変数を追加**

   - 「Site configuration」→「Environment variables」を開く
   - 「Add a variable」をクリック

   以下の変数を追加：

   ```
   Key: PUBLIC_API_URL
   Value: https://your-wordpress-domain.com
   Scopes: All scopes (or Production)

   Key: PUBLIC_API_PREFIX
   Value: /wp-json/wp/v2/

   Key: PUBLIC_WPCF7_API_PREFIX
   Value: contact-form-7/v1/contact-forms/

   Key: PUBLIC_WPCF7_API_ID
   Value: 123

   Key: PUBLIC_WPCF7_ID
   Value: 123

   Key: PUBLIC_WPCF7_UNIT_TAG
   Value: wpcf7-f123-p456-o1

   Key: PUBLIC_WPCF7_POST_ID
   Value: 456
   ```

4. **保存**
   - すべての変数を入力したら「Save」をクリック

### 6.2 ローカル環境変数の設定（開発用）

プロジェクトルートに `.env` ファイルを作成（ローカル開発用）：

```bash
# .env (ローカル開発用)

PUBLIC_API_URL=http://hibari-konaweb.local
PUBLIC_API_PREFIX=/wp-json/wp/v2/
PUBLIC_WPCF7_API_PREFIX=contact-form-7/v1/contact-forms/
PUBLIC_WPCF7_API_ID=123
PUBLIC_WPCF7_ID=123
PUBLIC_WPCF7_UNIT_TAG=wpcf7-f123-p456-o1
PUBLIC_WPCF7_POST_ID=456
```

**⚠️ 注意**: `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。

---

## 7. デプロイ

### 7.1 ローカルでビルドテスト

```bash
# 依存関係のインストール（必要な場合）
npm install

# 本番環境用の環境変数を使用してビルド
npm run build

# ローカルでプレビュー
npm run preview
```

### 7.2 Gitにプッシュ

```bash
# 変更をステージング
git add .

# コミット
git commit -m "feat: 本番環境設定の追加"

# GitHubにプッシュ
git push origin main
```

### 7.3 Netlifyで自動デプロイ

Netlifyは自動的にGitHubリポジトリを監視しているため、プッシュすると自動的にデプロイが開始されます。

**手動デプロイの場合:**

1. Netlifyダッシュボードを開く
2. 「Deploys」タブをクリック
3. 「Trigger deploy」→「Deploy site」をクリック

### 7.4 デプロイログの確認

1. Netlifyダッシュボードで「Deploys」タブを開く
2. 最新のデプロイをクリック
3. ログを確認してエラーがないか確認

---

## 8. 確認とテスト

### 8.1 WordPressバックエンドの確認

```bash
# REST APIの動作確認
curl https://your-wordpress-domain.com/wp-json/wp/v2/posts

# Works APIの確認
curl https://your-wordpress-domain.com/wp-json/wp/v2/works

# カテゴリーAPIの確認
curl https://your-wordpress-domain.com/wp-json/wp/v2/categories
```

### 8.2 フロントエンドの確認

本番サイトにアクセスして、以下を確認：

- ✅ トップページが正しく表示される
- ✅ ブログ一覧ページ（/blog）が表示される
- ✅ ブログ詳細ページ（/blog/[slug]）が表示される
- ✅ Works一覧ページ（/works）が表示される
- ✅ Works詳細ページ（/works/[slug]）が表示される
- ✅ カテゴリーページ（/blog/category/[slug]）が表示される
- ✅ お問い合わせフォームが動作する
- ✅ 画像が正しく表示される

### 8.3 パフォーマンスの確認

```bash
# Lighthouse でパフォーマンス測定
# Chrome DevTools → Lighthouse

# PageSpeed Insights
https://pagespeed.web.dev/?url=https://hibari-konaweb.netlify.app
```

---

## 9. トラブルシューティング

### 問題1: REST APIが404エラーを返す

**原因:**

- パーマリンク設定が正しくない
- .htaccessが正しく設定されていない

**解決策:**

```bash
# WordPressダッシュボード
# 設定 → パーマリンク設定 → 変更を保存

# .htaccessを確認
# mod_rewriteが有効か確認
```

### 問題2: CORSエラーが発生する

**エラーメッセージ:**

```
Access to fetch at 'https://your-wordpress-domain.com/wp-json/...' from origin 'https://hibari-konaweb.netlify.app' has been blocked by CORS policy
```

**解決策:**

WordPress側で CORS を許可：

**方法1: プラグインを使用**

- 「WP Headless CMS」プラグインをインストール
- 許可するドメインを設定

**方法2: functions.php に追加**

```php
// wp-content/themes/your-theme/functions.php

function add_cors_http_header(){
    header("Access-Control-Allow-Origin: https://hibari-konaweb.netlify.app");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
}
add_action('init','add_cors_http_header');
```

### 問題3: 画像が表示されない

**原因:**

- 画像のURLがローカルのままになっている
- アップロードディレクトリが正しくない

**解決策:**

```bash
# データベースのURL置換を再実行
wp search-replace 'http://hibari-konaweb.local' 'https://your-domain.com' --all-tables

# または、wp-content/uploads/ ディレクトリを本番サーバーにアップロード
```

### 問題4: Contact Form 7 が動作しない

**原因:**

- API IDが間違っている
- エンドポイントが正しくない

**解決策:**

```bash
# フォームIDを確認
WordPress管理画面 → お問い合わせ → コンタクトフォーム

# Netlifyの環境変数を確認
PUBLIC_WPCF7_API_ID=正しいID
PUBLIC_WPCF7_ID=正しいID

# APIエンドポイントをテスト
curl https://your-wordpress-domain.com/wp-json/contact-form-7/v1/contact-forms/
```

### 問題5: ビルドが失敗する

**エラーメッセージ:**

```
Please set environment variables: PUBLIC_API_URL
```

**解決策:**

```bash
# Netlifyの環境変数が正しく設定されているか確認
# Site configuration → Environment variables

# ローカルでテスト
cp .env.example .env
# .env ファイルを編集
npm run build
```

---

## 📚 参考リンク

### WordPress

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WP-CLI Commands](https://developer.wordpress.org/cli/commands/)
- [Better Search Replace Plugin](https://wordpress.org/plugins/better-search-replace/)

### Astro

- [Astro Documentation](https://docs.astro.build/)
- [Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Static Site Generation](https://docs.astro.build/en/guides/static-vs-ssr/)

### Netlify

- [Netlify Documentation](https://docs.netlify.com/)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Deploy Notifications](https://docs.netlify.com/site-deploys/notifications/)

---

## 🔄 定期メンテナンス

### WordPress の更新

```bash
# WP-CLIを使用（推奨）
wp core update
wp plugin update --all
wp theme update --all
```

### フロントエンドの再ビルド

WordPressのコンテンツを更新した場合、Astroサイトを再ビルドする必要があります：

```bash
# Netlifyで手動デプロイ
# または、Gitにダミーコミットをプッシュ
git commit --allow-empty -m "chore: rebuild for content update"
git push origin main
```

### 自動再ビルドの設定（オプション）

WordPressのコンテンツ更新時に自動的にNetlifyをトリガーする：

1. **Netlify Build Hookを作成**

   - Netlify Dashboard → Site configuration → Build & deploy
   - 「Build hooks」→「Add build hook」
   - 名前: "WordPress Content Update"
   - ブランチ: main
   - URLをコピー（例: `https://api.netlify.com/build_hooks/xxx`）

2. **WordPressにプラグインをインストール**

   - 「WP Webhooks」プラグインをインストール
   - Webhookを設定してNetlifyのBuild Hook URLを指定

3. **投稿保存時に自動トリガー**
   - 投稿を公開/更新すると自動的にフロントエンドが再ビルドされる

---

## ✅ チェックリスト

### WordPressバックエンド

- [ ] データベースをエクスポート
- [ ] WordPressファイルを本番サーバーにアップロード
- [ ] データベースをインポート
- [ ] URLを置換（ローカル → 本番）
- [ ] wp-config.php を設定
- [ ] .htaccess を設定（Apacheの場合）
- [ ] パーマリンク設定を保存
- [ ] REST API が動作することを確認
- [ ] CORS 設定を追加

### Astroフロントエンド

- [ ] .env.example を作成
- [ ] .env.production を作成（ローカルテスト用）
- [ ] Netlifyに環境変数を設定
- [ ] ローカルでビルドテスト
- [ ] Gitにプッシュ
- [ ] Netlifyでデプロイ
- [ ] 本番サイトの動作確認

### セキュリティ

- [ ] WordPressを最新バージョンに更新
- [ ] プラグインを最新バージョンに更新
- [ ] 強力なパスワードを設定
- [ ] SSL証明書を設定（HTTPS）
- [ ] wp-config.php のセキュリティキーを生成
- [ ] 不要なプラグインを削除
- [ ] デバッグモードを無効化（WP_DEBUG = false）

---

## 🎉 完了！

おめでとうございます！ヘッドレスWordPressの本番環境移行が完了しました。

何か問題が発生した場合は、このガイドのトラブルシューティングセクションを参照してください。
