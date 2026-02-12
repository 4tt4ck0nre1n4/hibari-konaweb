# WordPressセキュリティガイド（ConoHaWing + ヘッドレスCMS）

このガイドでは、ConoHaWing上で動作するヘッドレスWordPressのセキュリティ設定について説明します。

## 目次

1. [ConoHaWing WAF設定](#conohawing-waf設定)
2. [WordPressセキュリティプラグイン](#wordpressセキュリティプラグイン)
3. [推奨セキュリティ設定](#推奨セキュリティ設定)
4. [定期的なメンテナンス](#定期的なメンテナンス)

---

## ConoHaWing WAF設定

### 現在の設定（推奨）

| 項目 | 設定 | 説明 |
|------|------|------|
| **管理画面ログイン** | ✅ ON | ブルートフォース攻撃を防止 |
| **スパムコメント/トラックバック** | ✅ ON | スパム対策として必須 |
| **海外コメント/トラックバック** | ✅ ON | 日本国内向けサイトのため |
| **ダッシュボード（海外アクセス制限）** | ⚠️ **ON推奨** | 管理画面は日本からのみアクセス |
| **REST-API** | ✅ ON | ヘッドレスWordPressとして必須 |
| **XML-RPC API** | ✅ OFF | ヘッドレスCMSでは不要 |
| **wlwmanifest.xml** | ✅ OFF | Windows Live Writerは古いツール |
| **Abilities API** | ✅ ON | プラグインの互換性維持 |

### 設定変更の手順

1. ConoHaWingコントロールパネルにログイン
2. 「サイト管理」→「サイトセキュリティ」→「WordPress セキュリティ」
3. 上記の推奨設定に変更
4. 「保存」をクリック

---

## WordPressセキュリティプラグイン

### 推奨プラグイン

#### 1. Wordfence Security（最優先）

**機能:**
- WAF（Web Application Firewall）
- マルウェアスキャン
- ログイン試行回数制限
- リアルタイム脅威検知
- 二段階認証

**設定手順:**
1. WordPress管理画面→「プラグイン」→「新規追加」
2. 「Wordfence Security」を検索してインストール・有効化
3. 「Wordfence」→「All Options」で以下を設定:
   - **Firewall**: Extended Protection（有料版推奨、無料版でも可）
   - **Login Security**: 失敗5回で30分ロックアウト
   - **Rate Limiting**: 1分間に最大60リクエスト
   - **Two-Factor Authentication**: 有効化（管理者アカウント）

#### 2. All In One WP Security & Firewall（代替案）

**機能:**
- ファイアウォール
- ログインセキュリティ
- データベース保護
- ファイルシステム保護

**設定手順:**
1. インストール・有効化後、「WP Security」メニューから設定
2. **User Login**: ログイン試行回数制限を有効化
3. **Firewall**: Basic Firewall Rulesを有効化
4. **Database Security**: プレフィックス変更（初期セットアップ時のみ）

#### 3. Limit Login Attempts Reloaded（軽量版）

**機能:**
- ログイン試行回数制限のみ（シンプル）
- Wordfenceより軽量

**設定手順:**
1. インストール・有効化
2. 「Settings」→「Limit Login Attempts」
3. 試行回数: 5回、ロックアウト時間: 30分

---

## 推奨セキュリティ設定

### 1. wp-config.php の強化

```php
<?php
// セキュリティキーの設定（WordPress.org で生成）
// https://api.wordpress.org/secret-key/1.1/salt/

// ファイル編集の無効化（セキュリティ向上）
define('DISALLOW_FILE_EDIT', true);

// デバッグモードの無効化（本番環境）
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// SSL強制（HTTPS通信）
define('FORCE_SSL_ADMIN', true);

// データベーステーブルプレフィックスの変更
// $table_prefix = 'wp_'; ← デフォルト（セキュリティリスク）
// $table_prefix = 'wp_a1b2c3_'; ← ランダムな文字列に変更
```

### 2. .htaccess の強化

ConoHaWingでは `.htaccess` ファイルを編集できます。

```apache
# wp-config.php へのアクセス拒否
<Files wp-config.php>
    order allow,deny
    deny from all
</Files>

# .htaccess へのアクセス拒否
<Files .htaccess>
    order allow,deny
    deny from all
</Files>

# ディレクトリブラウジングの無効化
Options -Indexes

# セキュリティヘッダーの追加（Netlify側で設定済みだが念のため）
<IfModule mod_headers.c>
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### 3. 管理者ユーザー名の変更

**重要**: デフォルトの `admin` ユーザー名は攻撃の標的になります。

**手順:**
1. 新しい管理者アカウントを作成（例: `site_admin_123`）
2. 新アカウントでログイン
3. 旧 `admin` アカウントを削除
4. 投稿を新アカウントに移行

### 4. パスワードポリシー

- **長さ**: 最低16文字以上
- **複雑さ**: 大文字、小文字、数字、記号を含む
- **パスワードマネージャー**: 1Password、Bitwarden等を使用
- **定期変更**: 3ヶ月ごとに変更

### 5. 二段階認証（2FA）

**推奨プラグイン**: Two-Factor（WordPress公式）

**設定手順:**
1. プラグインをインストール・有効化
2. ユーザープロフィール画面で2FAを有効化
3. 認証アプリ（Google Authenticator、Authy等）でQRコードをスキャン

---

## 定期的なメンテナンス

### 毎週

- [ ] Wordfenceのスキャン結果を確認
- [ ] ログイン試行ログを確認
- [ ] 不審なアクティビティをチェック

### 毎月

- [ ] WordPressコア、プラグイン、テーマの更新
- [ ] バックアップの動作確認（ConoHaWingの自動バックアップ）
- [ ] セキュリティプラグインのログレビュー

### 3か月ごと

- [ ] 管理者パスワードの変更
- [ ] 使用していないプラグイン・テーマの削除
- [ ] ユーザーアカウントの棚卸し（不要なアカウント削除）

### 半年ごと

- [ ] セキュリティ監査（外部ツールでスキャン）
- [ ] バックアップからの復元テスト
- [ ] SSL証明書の有効期限確認

---

## セキュリティチェックリスト

実装後、以下の項目を確認してください：

- [x] ConoHaWing WAF設定（推奨設定適用済み）
- [ ] Wordfence Security または All In One WP Securityのインストール
- [ ] ログイン試行回数制限の設定（5回/30分）
- [ ] wp-config.php の強化（DISALLOW_FILE_EDIT、FORCE_SSL_ADMIN）
- [ ] .htaccess の強化（wp-config.php保護、ディレクトリブラウジング無効化）
- [ ] 管理者ユーザー名の変更（`admin` 以外）
- [ ] 強力なパスワードの設定（16文字以上）
- [ ] 二段階認証（2FA）の有効化
- [ ] WordPress、プラグイン、テーマの最新化
- [ ] 不要なプラグイン・テーマの削除
- [ ] 定期バックアップの設定確認

---

## トラブルシューティング

### Wordfenceが重い場合

1. **スキャンスケジュールの調整**:
   - アクセスの少ない時間帯（深夜）に実行
   - スキャン頻度を週1回に変更

2. **キャッシュの調整**:
   - ページキャッシュプラグインとの競合を確認
   - Wordfenceのキャッシュ設定を最適化

### ログインできなくなった場合

1. **FTPでプラグインを無効化**:
   - `/wp-content/plugins/wordfence/` フォルダ名を変更
   - ログイン後、再度有効化

2. **ConoHaWingのファイルマネージャー**:
   - コントロールパネルから `.htaccess` を編集
   - Wordfence関連の設定をコメントアウト

### REST APIが動作しない場合

1. **ConoHaWingの設定確認**:
   - 「REST-API」が「ON」になっているか確認
   - 「海外アクセス制限」の「REST-API」が適切に設定されているか

2. **プラグインの競合**:
   - Disable REST APIプラグインが無効化されているか確認
   - Wordfenceの「Blocking」設定で誤ってブロックされていないか確認

---

## 参考リンク

- [WordPress Codex - Hardening WordPress](https://wordpress.org/support/article/hardening-wordpress/)
- [Wordfence公式ドキュメント](https://www.wordfence.com/help/)
- [ConoHaWing サポート](https://support.conoha.jp/w/)
- [OWASP WordPress Security Guide](https://owasp.org/www-project-wordpress-security/)

---

## 更新履歴

- **2026-02-12**: 初版作成（ConoHaWing WAF設定、推奨プラグイン、セキュリティ設定）
