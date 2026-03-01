# 料金シュミレーターのプラン「コーディング」画面の項目ボタンの追加

2026-02-26 ver1.0

## プラン「コーディング」の追加の項目ボタン名

1. その他の機能
2. サイト更新・修正業務
3. サイト運用・保守業務

## 項目ボタンの詳細

- config/pricing.tsのPRICING_ITEMSに追加
- アイコンの設定、設置はiconifyInline.tsxなどを参照。

1. その他の機能
   - id: "other-functions"
   - icon "streamline-kameleon-color:windows-coding-duo"
   - クリックすると、以下のモーダルが表示（金額は表記しない）
     - config/pricing.tsにモーダルの変数を追加
     - 検索機能
       - 初期単価: 10000円
     - 予約機能
       - 初期単価: 10000円
     - 決済機能
       - 初期単価: 30000円

2. サイト更新・修正業務
   - id: "update"
   - 初期単価: 5000円～
   - icon "material-icon-theme:folder-update-open"

3. サイト運用・保守業務
   - id: "maintenance"
   - 初期単価: 5000円～
   - icon "mdi:scheduled-maintenance"
   - アイコン画像は赤系の色に変更してください。

## 計算プログラムの追加

1. その他の機能
   - 追加されたモーダルの計算プログラムの追加

2. サイト更新・修正業務
3. サイト運用・保守業務
   - 初期単価: "5000円～"
   - 5000円として計算

## CSS

CSSのコーディングルールは、CSS_CODING_RULES.mdを参照。

## 概算見積書

明細は既存のプログラムのとおり、コーディング欄に記載する
