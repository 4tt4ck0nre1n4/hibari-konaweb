# 料金シュミレーター追加プログラム

2026/02/25 ver1.0

このドキュメントは、料金シュミレーターのプラン「ホームページ制作」の開発仕様書です。

## 参照ドキュメント、ファイル

- .cursor/plans/料金シミュレーター開発_8b0ab99a.plan.md
- types/pricing.ts
- config/pricing.ts
- PricingSimulator.tsx
- PricingItem.tsx
- ModalDialog.tsx
- iconifyInline.tsx
- utils/**.ts
- styles/pricing/**.css
- service/index.astro（.pricing-simulator-wrapper内に設置）
- EstimateDocument.tsx
- EstimateSummary.tsx

## 使用技術

Astro
TypeScript
react
CSS

## 料金シュミレーターのプラン「ホームページ制作」画面の開発

- 料金シュミレーターのプランのデフォルトのタブは「コーディング」ボタン
- styles/PricingSimulator.css（.pricing-plan-button--disabled）の削除

## 「ホームページ制作」ボタンを選択後の挙動について

1. タブ切り替えで「ホームページ制作」画面になる
   - タブ切り替えのプログラムを追加（アクセシビリティ完全対応）- -「ホームページ制作」の料金シュミレーターは、「コーディング」の料金シュミレーターと同様にCSSを指定
   - 「ホームページ制作」と「コーディング」が別の画面でそれぞれ選択ができる
   - 「ホームページ制作」、「コーディング」それぞれで項目を選択した場合、画面が切り替わっても概算見積書のデータは消えない仕組み

## 「ホームページ制作」画面

- 既存の料金シュミレーターのプログラムと同様に項目を選択していくと、「この結果で概算見積書を作成」へ進める、または「やり直し」できる仕組み
- 項目ボタンはアイコン画像とボタンテキストを並列表示
- レスポンシブ対応も既存の料金シュミレーターと同様のCSSを指定

## 「特急案件」ボタン

- 「コーディング」、「ホームページ制作」のどちらかの画面で「特急案件」ボタンを選択した場合、両方選択できない仕組み。どちらを選択しても計算プログラムは20%割増しのまま変わらない。
- 「特急案件」ボタンのみで項目ボタンの選択を何もしない場合、「この結果で概算見積書を作成」ボタンは押せない仕組み

## 「ホームページ制作」項目ボタン名

1. サイト設計
2. ワイヤーフレーム作成
3. サイトマップ作成
4. トップページデザイン
5. トップページレスポンシブ対応デザイン
6. 下層ページデザイン
7. 下層ページレスポンシブ対応デザイン
8. ロゴ制作
9. 原稿作成
10. 写真撮影
11. Googleマップ設置（MEO）
12. SEO対策
13. SNS設置・運用代行
14. 公式LINE設置・連携
15. バナー作成
16. 名刺デザイン
17. ドメイン・サーバー取得代行
18. イラスト・図表作成

## 項目ボタンの単価初期値

1. サイト設計
   - 30000円
2. ワイヤーフレーム作成
   - 10000円
3. サイトマップ作成
   - 10000円
4. トップページデザイン
   - 30000円
5. トップページレスポンシブ対応デザイン
   - 10000円
6. 下層ページデザイン
   - 1ページごとに10000円加算
   - 10～19ページを選択すると10%割増
   - 20～50ページを選択すると25%割増
   - 50ページ～を選択すると50%割増
   - わからないを選択する場合は加算なし
7. 下層ページレスポンシブ対応デザイン
   - 1ページごとに5000円加算
   - 10～19ページを選択すると10%割増
   - 20～50ページを選択すると25%割増
   - 50ページ～を選択すると50%割増
   - わからないを選択する場合は加算なし
8. ロゴ制作
    - 20000円
9. 原稿作成
   - 10000円
10. 写真撮影
    - 30000円
11. Googleマップ設置（MEO）
    - 30000円
12. SEO対策
    - 10000円
13. SNS設置・運用代行
    - 10000円
14. 公式LINE設置・連携
    - 15000円
15. バナー作成
    - 10000円
16. 名刺デザイン
    - 10000円
17. ドメイン・サーバー取得代行
    - 3000円
18. イラスト・図表作成
    - 10000円

## 項目ボタンのアイコン画像

アイコンの設定、設置はiconifyInline.tsxなどを参照してください。

1. サイト設計
   - icon "streamline-ultimate-color:website-build"

2. ワイヤーフレーム作成
   - icon "fxemoji:framewithtiles"

3. サイトマップ作成
   - icon "vscode-icons:file-type-sitemap"

4. トップページデザイン
   - icon "streamline-ultimate-color:design-file-pen"
   - 赤色の箇所を青系の色に変更してください。

5. トップページレスポンシブ対応デザイン
   - icon "streamline-ultimate-color:responsive-design-1"
   - 青色の箇所を緑系の色に変更してください。

6. 下層ページデザイン
   - icon "streamline-ultimate-color:design-file-pen"

7. 下層ページレスポンシブ対応デザイン
   - icon "streamline-ultimate-color:responsive-design-1"

8. ロゴ制作
    - icon "vscode-icons:file-type-image"

9. 原稿作成
    - icon "fluent-emoji-flat:writing-hand-light"

10. 写真撮影
    - icon "streamline-kameleon-color:camera-front-duo"

11. Googleマップ設置（MEO）
    - icon "streamline-kameleon-color:map-pin"

12. SEO対策
    - icon "lineicons:seo-monitor"
    - 赤系の色に変更してください。

13. SNS設置・運用代行
    - icon "streamline-ultimate-color:messages-bubble-text"
14. 公式LINE設置・連携
    - icon "streamline-ultimate-color:line-app-logo"

15. バナー作成
    - icon "streamline-ultimate-color:design-tool-ink"

16. 名刺デザイン
    - icon "streamline-kameleon-color:businessman-globe-duo"

17. ドメイン・サーバー取得代行
    - icon "streamline-kameleon-color:servers"

18. イラスト・図表作成
    - icon "material-icon-theme:folder-app"

## CSS

CSSのコーディングルールは、CSS_CODING_RULES.mdを参照してください。

## 概算料金自動計算プログラム

- config/pricing.tsに「ホームページ制作」項目ボタンのデータを追加
- 新たに計算プログラムの追加

## 概算見積書

EstimateDocument.tsx

1. 明細
   (a).「ホームページ制作」のみで料金シュミレーターを行った場合
      - 品名の行の先頭に「ホームページ制作料金」と記載する（colSpan={4}）
   (b).「コーディング」のみで料金シュミレーターを行った場合
      - 品名の行の先頭に「コーディング料金」と記載する（colSpan={4}）
   (c).「ホームページ制作」「コーディング」両方で料金シュミレーターを行った場合
      - 品名の行の先頭にまず「ホームページ制作料金」と記載する（colSpan={4}）
      - 次の行に「ホームページ制作」と記載する（colSpan={4}）
      - 次の行から「ホームページ制作」の料金シュミレーター結果の項目を記載する
      - その後の行に、「コーディング」と記載する（colSpan={4}）
      - 次の行から「コーディング」の料金シュミレーター結果の項目を記載する

## 項目ボタンのまとめ

1. サイト設計
   - id: "site-design"
   - 初期単価: 30000円
   - icon "streamline-ultimate-color:website-build"

2. ワイヤーフレーム作成
   - id: "wire-frame"
   - 初期単価: 10000円
   - icon "fxemoji:framewithtiles"

3. サイトマップ作成
   - id: "site-map"
   - 初期単価: 10000円
   - icon "vscode-icons:file-type-sitemap"

4. トップページデザイン
   - id: "top-design"
   - 初期単価: 30000円
   - icon "streamline-ultimate-color:design-file-pen"
   - 赤色の箇所を青系の色に変更してください。

5. トップページレスポンシブ対応デザイン
   - id: "top-design-responsive"
   - 初期単価: 10000円
   - icon "streamline-ultimate-color:responsive-design-1"
   - 青色の箇所を緑系の色に変更してください。

6. 下層ページデザイン
   - id: "sub-design"
   - icon "streamline-ultimate-color:design-file-pen"
   - クリックすると、以下のページ数入力モーダルが表示
   - config/pricing.tsのPAGE_COUNT_OPTIONSを利用
     - 1ページごとに10000円加算
     - 10～19ページを選択すると10%割増
     - 20～50ページを選択すると25%割増
     - 50ページ～を選択すると50%割増
     - わからないを選択する場合は加算なし

7. 下層ページレスポンシブ対応デザイン
   - id: "sub-design-responsive"
   - icon "streamline-ultimate-color:responsive-design-1"
   - クリックすると、以下のページ数入力モーダルが表示
   - config/pricing.tsのPAGE_COUNT_OPTIONSを利用
     - 1ページごとに5000円加算
     - 10～19ページを選択すると10%割増
     - 20～50ページを選択すると25%割増
     - 50ページ～を選択すると50%割増
     - わからないを選択する場合は加算なし

8. ロゴ制作
   - id: "logo"
   - 初期単価: 20000円
   - icon "vscode-icons:file-type-image"

9. 原稿作成
    - id: "manuscript"
    - 初期単価: 10000円
    - icon "fluent-emoji-flat:writing-hand-light"

10. 写真撮影
    - id: "photo-shoot"
    - 初期単価: 30000円
    - icon "streamline-kameleon-color:camera-front-duo"

11. Googleマップ設置（MEO）
    - id: "google-map"
    - 初期単価: 30000円
    - icon "streamline-kameleon-color:map-pin"

12. SEO対策
    - id: "seo"
    - 初期単価: 10000円
    - icon "lineicons:seo-monitor"
    - 赤系の色に変更してください。

13. SNS設置・運用代行
    - id: "sns"
    - 初期単価: 10000円
    - icon "streamline-ultimate-color:messages-bubble-text"

14. 公式LINE設置・連携
    - id: "line"
    - 初期単価: 15000円
    - icon "streamline-ultimate-color:line-app-logo"

15. バナー作成
    - id: "banner"
    - 初期単価: 10000円
    - icon "streamline-ultimate-color:design-tool-ink"

16. 名刺デザイン
    - id: "business-card"
    - 初期単価: 10000円
    - icon "streamline-kameleon-color:businessman-globe-duo"

17. ドメイン・サーバー取得代行
    - id: "domain-server"
    - 初期単価: 3000円
    - icon "streamline-kameleon-color:servers"

18. イラスト・図表作成
    - id: "illust-diagrams"
    - 初期単価: 10000円
    - icon "material-icon-theme:folder-app"

## テスト

チェックリスト
□ タブの切り替え
□ 料金シュミレーターの計算プログラムの挙動
□「特急案件」ボタン
□ 概算見積書の明細の記載事項
