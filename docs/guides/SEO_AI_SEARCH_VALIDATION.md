# SEO・AI検索 本番検証チェックリスト

このチェックリストは、SEO・AI検索向けの変更をデプロイ後に確認するためのものです。WordPress APIに依存するページはローカル目視確認を前提にせず、本番またはステージングで確認します。

## 代表URL

- `/`
- `/about`
- `/service`
- `/works`
- `/works/{slug}`
- `/blog`
- `/blog/{slug}`
- `/blog/category`
- `/blog/category/{slug}`
- `/contact`
- `/privacy`
- `/robots.txt`
- `/sitemap-index.xml`
- `/rss.xml`
- `/llms.txt`
- `/ai.txt`

## HTML Head

- canonical が本番の正規URLになっている。
- `og:url` が canonical と一致している。
- `og:type` が固定ページ・一覧ページでは `website`、ブログ詳細・実績詳細では `article` になっている。
- `og:image`、`og:image:width`、`og:image:height`、`og:image:alt` が出力されている。
- `twitter:image:alt` が出力されている。
- `/rss.xml` の `rel="alternate"` が出力されている。
- 404、500、thanks、sorry などは `noindex` が出力されている。

## 構造化データ

- [Rich Results Test](https://search.google.com/test/rich-results) で代表URLを確認する。
- [Schema Markup Validator](https://validator.schema.org/) で代表URLを確認する。
- `#website` と `#person` の `@id` がページ固有JSON-LDから参照されている。
- ブログ詳細は `BlogPosting` として、`headline`、`description`、`datePublished`、`dateModified`、`author`、`publisher`、`image` が出力されている。
- 実績詳細は `CreativeWork` として、`creator`、`author`、`image`、`about`、`keywords` が出力されている。
- サービスページは `Service` と `OfferCatalog` が出力されている。
- カテゴリ、ブログ一覧、実績一覧は `CollectionPage` と `ItemList` で出力されている。
- パンくずがあるページでは `BreadcrumbList` が出力されている。

## 機械可読な発見性

- `/robots.txt` に `Sitemap`、`LLMS`、`AI-Policy`、`RSS` のURLが出力されている。
- `/llms.txt` に主要ページ、専門領域、引用方針、日本語補足が出力されている。
- `/ai.txt` にクロール方針、引用方針、非公開情報を使わない方針、日本語補足が出力されている。
- `/rss.xml` がXMLとして表示され、最新記事が日付降順で並んでいる。
- `/sitemap-index.xml` から主要ページが辿れる。

## Search Console

- サイトマップを送信または再送信する。
- 代表URLのURL検査を行い、canonical、クロール済みHTML、インデックス可否を確認する。
- noindex対象ページが意図通りインデックス対象外になっているか確認する。
- 構造化データ、ページエクスペリエンス、Core Web Vitals の警告を確認する。

## PageSpeed Insights

- トップページ、ブログ詳細、実績詳細、サービスページを確認する。
- LCP、CLS、INP の悪化がないか確認する。
- 画像・フォント・JavaScriptの指摘がSEO変更によって増えていないか確認する。

## 記録

- 検証日:
- デプロイURL:
- 確認した代表URL:
- Rich Results Test の主な結果:
- Schema Markup Validator の主な結果:
- Search Console の主な結果:
- PageSpeed Insights の主な結果:
- 残課題:
