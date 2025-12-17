# Netlify環境変数の設定手順

## 問題

本番環境で`blog/[...page].astro`と`works/[slug].astro`が404エラーになる原因は、ビルド時にWordPress APIにアクセスできないためです。

## 解決策

### 1. Netlifyダッシュボードにログイン

https://app.netlify.com/ にアクセスし、該当のサイトを選択

### 2. 環境変数を設定

1. `Site settings` → `Environment variables` に移動
2. 以下の環境変数を追加：

```
PUBLIC_API_URL=https://your-production-wordpress-url.com
PUBLIC_API_PREFIX=/wp-json/wp/v2/
```

**重要**: `PUBLIC_API_URL`には、本番環境でアクセス可能なWordPress サイトのURLを指定してください。

### 3. オプション（必要に応じて）

Contact Form 7を使用している場合：

```
PUBLIC_WPCF7_API_PREFIX=contact-form-7/v1/contact-forms/
PUBLIC_WPCF7_API_ID=123
PUBLIC_WPCF7_ID=123
PUBLIC_WPCF7_UNIT_TAG=wpcf7-f123-p456-o1
PUBLIC_WPCF7_POST_ID=456
```

### 4. 再デプロイ

環境変数を設定後、`Deploys` → `Trigger deploy` → `Deploy site` をクリック

## WordPress APIの要件

- WordPress サイトは **公開アクセス可能** である必要があります
- REST APIが有効になっている必要があります
- CORS設定が適切である必要があります

## WordPress サイトがローカルのみの場合の対応

ローカルのWordPress（`http://hibari-konaweb.local`）しかない場合は、以下のいずれかの対応が必要です：

### オプションA: WordPressを公開ホストにデプロイ

- ConoHa WING
- さくらのレンタルサーバー
- AWS EC2
- その他のWordPressホスティングサービス

### オプションB: ローカルでビルドしてデプロイ

```bash
# ローカル環境でビルド
npm run build

# Netlify CLIでデプロイ
netlify deploy --prod --dir=dist
```

### オプションC: JSON形式でデータをエクスポート

1. WordPress データをJSON形式でエクスポート
2. `src/data/`フォルダに保存
3. APIの代わりにJSONファイルを使用するようコードを修正

## 確認方法

設定が正しければ、以下のURLにアクセスできるはずです：

- `https://your-domain.com/blog`
- `https://your-domain.com/blog/2`
- `https://your-domain.com/works/your-slug`
