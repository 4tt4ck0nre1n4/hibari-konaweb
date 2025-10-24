# フォント関連エラーの修正

## 問題の概要

Chrome DevToolsで以下のエラーが発生していました：

### エラー内容

**404エラー（2件）**:

```
Failed to load resource: the server responded with a status of 404 ()
- poppins-latin-400-normal.woff2:1
- poppins-latin-700-normal.woff2:1
```

**警告（8件）**:

```
The resource <URL> was preloaded using link preload but not used within a few seconds from the window's load event.
- https://hibari-konaweb.netlify.app/node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2 (4件)
- https://hibari-konaweb.netlify.app/node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2 (4件)
```

## 問題の原因

### 1. 誤ったフォントパスのプリロード

`src/layouts/HeadLayout.astro`で以下のようなプリロードを設定していました：

```astro
<link
  rel="preload"
  href="/node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
```

**問題点**:

- `/node_modules/`はビルド時には存在しない
- `@fontsource`パッケージはビルド時にフォントを最適化して別の場所に配置する
- 実際のフォントファイルのパスはビルド時に変わる

### 2. 冗長な@font-face定義

`src/styles/global.css`でカスタムの`@font-face`を定義していました：

```css
@font-face {
  font-family: Poppins;
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: local(poppins);
}
```

**問題点**:

- `@fontsource`が既に最適化された`@font-face`を提供している
- 重複した定義がフォントの読み込みを混乱させる可能性がある
- `src: local(poppins)`だけでは不十分

## 実施した修正

### 1. フォントのプリロードを削除

**ファイル**: `src/layouts/HeadLayout.astro`

**変更内容**:

```diff
- <!-- フォントのプリロードでCLSを削減 -->
- <link
-   rel="preload"
-   href="/node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2"
-   as="font"
-   type="font/woff2"
-   crossorigin="anonymous"
- />
- <link
-   rel="preload"
-   href="/node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2"
-   as="font"
-   type="font/woff2"
-   crossorigin="anonymous"
- />
```

**理由**:

- `@fontsource`は自動的にフォントを最適化してバンドルする
- ビルド後のフォントファイルのパスは動的に生成される
- 手動でのプリロードは不要（むしろエラーの原因）

### 2. カスタム@font-face定義を削除

**ファイル**: `src/styles/global.css`

**変更内容**:

```diff
- /* フォントのfont-displayを設定してCLSを削減 */
- @font-face {
-   font-family: Poppins;
-   font-style: normal;
-   font-display: swap;
-   font-weight: 400;
-   src: local(poppins);
- }
-
- @font-face {
-   font-family: Poppins;
-   font-style: normal;
-   font-display: swap;
-   font-weight: 700;
-   src: local(poppins);
- }
```

**理由**:

- `@fontsource`が既に最適化された`@font-face`を提供
- デフォルトで`font-display: swap`が含まれている
- 重複した定義を避ける

### 3. Layout.astroにコメントを追加

**ファイル**: `src/layouts/Layout.astro`

**変更内容**:

```astro
---
import HeadLayout from "./HeadLayout.astro";
// @fontsourceはfont-display: swapをデフォルトで含む
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";
---
```

**理由**:

- `@fontsource`の動作を明確にする
- 今後の保守性向上

## @fontsourceの仕組み

### 自動最適化

`@fontsource`パッケージは以下を自動的に行います：

1. **フォントの最適化**: 使用されるグリフのみを含むサブセットを生成
2. **@font-face生成**: 適切な`@font-face`定義を自動生成
3. **font-display設定**: デフォルトで`font-display: swap`を設定
4. **フォーマット対応**: WOFF2、WOFFなどの最適なフォーマットを提供
5. **バンドル**: ビルド時にフォントをバンドルして最適な場所に配置

### 生成される@font-face例

`@fontsource`が自動生成する`@font-face`の例：

```css
@font-face {
  font-family: "Poppins";
  font-style: normal;
  font-display: swap; /* デフォルトで設定される */
  font-weight: 400;
  src:
    url(../fonts/poppins-latin-400-normal.woff2) format("woff2"),
    url(../fonts/poppins-latin-400-normal.woff) format("woff");
}
```

## CLS（Cumulative Layout Shift）対策

### font-display: swap の効果

`@fontsource`のデフォルト設定（`font-display: swap`）により：

1. **FOIT（Flash of Invisible Text）回避**: フォント読み込み中も代替フォントでテキストを表示
2. **FOUT（Flash of Unstyled Text）最小化**: フォント読み込み完了後に適切に切り替え
3. **CLS削減**: テキストの再レンダリングによるレイアウトシフトを最小限に

### 動作の流れ

```
1. ページ読み込み開始
   ↓
2. 代替フォント（system-ui, sans-serif）でテキスト表示
   ↓
3. Poppinsフォントのダウンロード（バックグラウンド）
   ↓
4. フォント読み込み完了後、Poppinsに切り替え
   ↓
5. レイアウトシフトを最小限に抑制
```

## ベストプラクティス

### ✅ 推奨される方法

```astro
---
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";
---

<!-- Layout.astro -->
```

```css
/* global.css */
html {
  font-family: Poppins, system-ui, sans-serif;
}
```

### ❌ 避けるべき方法

```astro
<!-- HeadLayout.astro - 避ける -->
<link rel="preload" href="/node_modules/@fontsource/poppins/..." as="font" />
```

```css
/* global.css - 避ける */
@font-face {
  font-family: Poppins;
  src: local(poppins);
}
```

**理由**:

- ビルド後のパスが不明確
- `@fontsource`の最適化と競合
- 404エラーの原因となる

## 検証方法

### 1. Chrome DevToolsでの確認

#### Networkタブ

```
1. F12でDevToolsを開く
2. Networkタブを選択
3. "Font"でフィルター
4. ページをリロード
5. Poppinsフォントが正しく読み込まれているか確認
6. ステータスが200 OKであることを確認
```

#### Consoleタブ

```
1. Consoleタブを選択
2. 404エラーがないことを確認
3. プリロード警告がないことを確認
```

### 2. ビルド後の確認

```bash
# ビルド実行
npm run build

# distディレクトリを確認
ls -la dist/_astro/

# フォントファイルがバンドルされているか確認
# 例: poppins-latin-400-normal.<hash>.woff2
```

### 3. ブラウザでの表示確認

```
1. ローカルでプレビュー: npm run preview
2. フォントが正しく表示されているか確認
3. DevToolsでフォントファミリーを確認
   - 要素を選択
   - Computedタブ
   - font-familyがPoppinsになっているか
```

## トラブルシューティング

### 問題: フォントが表示されない

**原因1**: `@fontsource`パッケージがインストールされていない  
**解決策**:

```bash
npm install @fontsource/poppins
```

**原因2**: インポートパスが間違っている  
**解決策**:

```astro
<!-- ✅ 正しい -->import "@fontsource/poppins/400.css";

<!-- ❌ 間違い -->
import "@fontsource/poppins";
```

### 問題: ビルドエラーが発生

**原因**: `@fontsource`パッケージのバージョン不一致  
**解決策**:

```bash
# パッケージを再インストール
npm install @fontsource/poppins@latest

# または、package-lock.jsonを削除して再インストール
rm -f package-lock.json
npm install
```

### 問題: フォントの読み込みが遅い

**原因**: 必要以上のウェイトを読み込んでいる  
**解決策**:

```astro
<!-- 使用するウェイトのみインポート -->import "@fontsource/poppins/400.css"; import "@fontsource/poppins/700.css";

<!-- ❌ 全ウェイトの読み込みは避ける -->
<!-- import "@fontsource/poppins"; -->
```

## さらなる最適化オプション

### 1. サブセットの使用

特定の言語のみを読み込む：

```astro
<!-- Latin文字のみ -->import "@fontsource/poppins/latin-400.css"; import "@fontsource/poppins/latin-700.css";
```

**メリット**:

- ファイルサイズの削減
- 読み込み速度の向上

### 2. 可変フォントの使用

複数のウェイトを1つのファイルで：

```astro
import "@fontsource/poppins/variable.css";
```

**メリット**:

- HTTPリクエスト数の削減
- 任意のウェイトを使用可能

**デメリット**:

- ブラウザサポートが必要
- 初期ファイルサイズがやや大きい

### 3. フォントのプリコネクト

Google Fontsなど外部フォントを使用する場合：

```astro
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

**注意**: `@fontsource`を使用する場合は不要

## まとめ

### 修正前の状態

- ❌ 404エラー（フォントファイル not found）
- ❌ プリロード警告（8件）
- ❌ 重複した`@font-face`定義

### 修正後の状態

- ✅ フォントが正しく読み込まれる
- ✅ エラー・警告がゼロ
- ✅ `@fontsource`の最適化を活用
- ✅ `font-display: swap`でCLS対策

### 学んだこと

1. **`@fontsource`を信頼する**: 手動でのプリロードや`@font-face`定義は不要
2. **ビルドプロセスを理解する**: `node_modules`のパスは本番環境で使用できない
3. **DevToolsで検証する**: エラーや警告を見逃さない
4. **シンプルに保つ**: 複雑な最適化より、パッケージのデフォルト設定を使う

---

**修正日**: 2025-10-24  
**作成者**: AI Assistant  
**関連ドキュメント**:

- [CLS_OPTIMIZATION_GUIDE.md](./CLS_OPTIMIZATION_GUIDE.md)
- [LCP_OPTIMIZATION_GUIDE.md](./LCP_OPTIMIZATION_GUIDE.md)
