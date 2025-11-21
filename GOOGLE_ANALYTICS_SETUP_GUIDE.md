# Google Analytics 4 (GA4) 導入ガイド

このガイドでは、Astro フロントエンド + WordPress バックエンド構成でのGoogle Analytics 4 (GA4) の完全な導入手順を説明します。

## 📋 目次

1. [Google Analytics アカウントの準備](#1-google-analytics-アカウントの準備)
2. [Astro フロントエンドへの導入](#2-astro-フロントエンドへの導入)
3. [WordPress バックエンドへの導入](#3-wordpress-バックエンドへの導入)
4. [動作確認](#4-動作確認)
5. [カスタムイベントの追跡](#5-カスタムイベントの追跡)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. Google Analytics アカウントの準備

### 1.1 Google Analytics アカウントの作成

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 「測定を開始」をクリック
3. アカウント名を入力（例: `hibari-konaweb`）
4. データ共有設定を確認して「次へ」

### 1.2 プロパティの作成

1. プロパティ名を入力（例: `hibari-konaweb サイト` `MyPortfolioSite`）
2. レポートのタイムゾーン: `日本`
3. 通貨: `日本円（JPY）`
4. 「次へ」をクリック

### 1.3 ビジネス情報の入力

1. 業種を選択
2. ビジネスの規模を選択
3. 「作成」をクリック
4. 利用規約に同意

### 1.4 データストリームの設定

1. プラットフォームで「ウェブ」を選択
2. ウェブサイトのURLを入力: `https://hibari-konaweb.netlify.app`
3. ストリーム名: `Hibari Konaweb``MyPortfolioSite`
4. 「ストリームを作成」をクリック

### 1.5 測定IDの取得

- **測定ID**（`G-XXXXXXXXXX`形式）が表示されます
- この ID をコピーして保管してください

---

## 2. Astro フロントエンドへの導入

### 2.1 環境変数の設定

#### ローカル開発環境

`.env` ファイルを作成（または既存のものを編集）：

```bash
# Google Analytics 4 Configuration
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**注意**: `.env` ファイルは `.gitignore` に含まれているため、リポジトリにコミットされません。

#### Netlify 本番環境

1. Netlify ダッシュボードにログイン
2. サイトを選択
3. **Site settings** → **Environment variables** に移動
4. 「Add a variable」をクリック
5. 以下を設定：
   - **Key**: `PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX`（取得した測定ID）
6. 「Save」をクリック

### 2.2 実装の確認

以下のファイルが既に実装されています：

- ✅ `src/components/GoogleAnalytics.astro` - GA4トラッキングコンポーネント
- ✅ `src/layouts/HeadLayout.astro` - GA4の統合
- ✅ `src/util/analytics.ts` - カスタムイベント用ヘルパー関数
- ✅ `src/env.d.ts` - TypeScript型定義

### 2.3 ビルドとデプロイ

```bash
# ローカル開発サーバーで確認（GAは無効化されています）
npm run dev

# 本番ビルド
npm run build

# Netlifyへデプロイ（環境変数設定後）
git push origin main
```

---

## 3. WordPress バックエンドへの導入

WordPress側でもGA4を導入する場合、以下の3つの方法があります。

### 方法A: プラグインを使用（推奨）

#### オプション1: Site Kit by Google（公式プラグイン）

1. WordPressダッシュボードにログイン
2. **プラグイン** → **新規追加**
3. 「Site Kit by Google」を検索
4. 「今すぐインストール」→「有効化」
5. Google アカウントで認証
6. Google Analytics を接続

**メリット**:
- Google公式プラグイン
- WordPress管理画面内で分析データを確認可能
- 自動設定で簡単

#### オプション2: GA Google Analytics（軽量）

1. WordPressダッシュボードにログイン
2. **プラグイン** → **新規追加**
3. 「GA Google Analytics」を検索
4. 「今すぐインストール」→「有効化」
5. **設定** → **GA Google Analytics**
6. 測定IDを入力: `G-XXXXXXXXXX`

**メリット**:
- 軽量で高速
- シンプルな設定
- 余計な機能がない

### 方法B: テーマに直接追加

WordPressテーマの `header.php` または `functions.php` に以下を追加：

#### header.php に追加する方法

```php
<?php
// header.php の <head> タグ内に追加
?>
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### functions.php に追加する方法（推奨）

```php
<?php
// functions.php に追加
function add_google_analytics() {
    // 管理画面では実行しない
    if (is_admin()) {
        return;
    }
    
    $ga_measurement_id = 'G-XXXXXXXXXX'; // 測定IDを設定
    ?>
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($ga_measurement_id); ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '<?php echo esc_js($ga_measurement_id); ?>');
    </script>
    <?php
}
add_action('wp_head', 'add_google_analytics', 10);
```

### 方法C: Google Tag Manager（高度な追跡用）

より複雑なイベント追跡が必要な場合：

1. [Google Tag Manager](https://tagmanager.google.com/) でアカウントを作成
2. コンテナIDを取得（`GTM-XXXXXXX`形式）
3. WordPressに「Google Tag Manager for WordPress」プラグインをインストール
4. コンテナIDを設定

---

## 4. 動作確認

### 4.1 Google Analytics リアルタイムレポート

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 左メニューから「レポート」→「リアルタイム」を選択
3. サイトを開いて、リアルタイムでアクセスが表示されるか確認

### 4.2 ブラウザの開発者ツールで確認

#### Chrome DevTools

1. サイトを開く
2. `F12` で開発者ツールを開く
3. **Network**タブを選択
4. `collect?` または `gtag` でフィルタ
5. Google Analyticsへのリクエストが送信されているか確認

#### Console でのデバッグ

```javascript
// ブラウザのコンソールで実行
window.dataLayer
// データが配列として表示されればOK
```

### 4.3 Google Analytics DebugView

1. ブラウザに拡張機能をインストール:
   - Chrome: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. 拡張機能を有効化
3. サイトにアクセス
4. Google Analytics → **設定** → **DebugView** でイベントをリアルタイム確認

---

## 5. カスタムイベントの追跡

### 5.1 Astro での実装例

```typescript
// src/components/ContactForm.tsx など
import { trackFormSubmit, trackEvent } from '../util/analytics';

function handleSubmit(success: boolean) {
  // フォーム送信の追跡
  trackFormSubmit('contact_form', success);
}

function handleButtonClick() {
  // カスタムイベントの追跡
  trackEvent('button_click', {
    button_name: 'download_catalog',
    page_location: window.location.href
  });
}
```

### 5.2 利用可能なヘルパー関数

`src/util/analytics.ts` に実装済み：

- `trackEvent(eventName, params)` - 汎用イベント追跡
- `trackPageView(path, title)` - ページビュー追跡
- `trackFormSubmit(formName, success)` - フォーム送信
- `trackLinkClick(url, type)` - リンククリック
- `trackScrollDepth(percentage)` - スクロール深度
- `trackVideoPlay(name, duration)` - 動画再生
- `trackSearch(term, resultCount)` - 検索
- `trackError(type, message)` - エラー追跡
- `trackTiming(category, variable, value)` - パフォーマンス計測

### 5.3 WordPress での実装例

```javascript
// カスタムJavaScriptで追跡
jQuery(document).ready(function($) {
    // ボタンクリックの追跡
    $('.download-button').on('click', function() {
        gtag('event', 'button_click', {
            'button_name': 'download_pdf',
            'page_location': window.location.href
        });
    });
    
    // フォーム送信の追跡
    $('form').on('submit', function() {
        gtag('event', 'form_submit', {
            'form_name': $(this).attr('id')
        });
    });
});
```

---

## 6. トラブルシューティング

### 問題: リアルタイムレポートにデータが表示されない

**解決策**:

1. **測定IDが正しいか確認**
   - `.env` または Netlify の環境変数を確認
   - `G-XXXXXXXXXX` 形式になっているか

2. **ブラウザの広告ブロッカーを無効化**
   - AdBlockなどがGA4をブロックしている可能性

3. **開発環境で確認していないか**
   - 開発環境（`npm run dev`）ではGA4は無効化されています
   - 本番ビルド（`npm run build && npm run preview`）で確認

4. **CSPエラーがないか確認**
   - ブラウザのコンソールでエラーを確認
   - `HeadLayout.astro` のCSP設定を確認

### 問題: コンソールに "gtag is not defined" エラー

**解決策**:

```javascript
// カスタムイベント送信前にgtagの存在を確認
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'my_event');
}
```

または `src/util/analytics.ts` のヘルパー関数を使用してください。

### 問題: WordPress側でデータが重複して送信される

**解決策**:

- Astro と WordPress の両方でGA4を設定すると、データが重複する可能性があります
- 推奨: Astro フロントエンドのみでGA4を設定し、WordPressでは設定しない
- WordPress管理画面のアクセスのみを追跡したい場合は、WordPressでも設定してください

### 問題: Netlify環境変数が反映されない

**解決策**:

1. Netlify ダッシュボードで環境変数を確認
2. `PUBLIC_` プレフィックスが付いているか確認（必須）
3. デプロイをトリガーし直す（Settings → Deploys → Trigger deploy）

---

## 📊 推奨されるイベント追跡

### 必須イベント

- ✅ ページビュー（自動）
- ✅ スクロール深度（90%以上）
- ✅ フォーム送信
- ✅ エラー発生

### 推奨イベント

- 外部リンククリック
- ファイルダウンロード
- 動画再生
- 検索実行
- ボタンクリック（CTAボタンなど）

---

## 🔒 プライバシー対応

### Consent Mode v2 対応

`GoogleAnalytics.astro` では、デフォルトでConsent Mode v2に対応しています：

- デフォルトで全ての同意を拒否
- 日本国内向けには `analytics_storage` のみ許可

### Cookie 同意バナーの実装（オプション）

より厳格なプライバシー保護が必要な場合：

```typescript
// ユーザーが同意した場合
function grantConsent() {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted'
    });
  }
}

// ユーザーが拒否した場合
function denyConsent() {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied'
    });
  }
}
```

---

## 📚 参考リンク

- [Google Analytics 4 公式ドキュメント](https://support.google.com/analytics/answer/10089681)
- [Consent Mode v2 ガイド](https://support.google.com/analytics/answer/9976101)
- [GA4 イベントリファレンス](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Astro 公式ドキュメント](https://docs.astro.build/)

---

## ✅ チェックリスト

導入完了の確認：

- [ ] Google Analytics アカウントを作成
- [ ] 測定IDを取得（`G-XXXXXXXXXX`）
- [ ] Astro の `.env` に測定IDを設定
- [ ] Netlify の環境変数に測定IDを設定
- [ ] サイトをデプロイ
- [ ] リアルタイムレポートでアクセスを確認
- [ ] カスタムイベントが正しく送信されるか確認
- [ ] （オプション）WordPress にもGA4を導入
- [ ] プライバシーポリシーを更新

---

## 🆘 サポート

問題が解決しない場合：

1. ブラウザのコンソールでエラーを確認
2. Network タブでGA4リクエストを確認
3. Google Analytics の DebugView を使用
4. 環境変数の設定を再確認

導入お疲れ様でした！🎉
