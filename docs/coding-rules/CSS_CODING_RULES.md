# CSSコーディングルール

## 適用範囲

このルールは `src/styles/` フォルダ内のCSSファイルに適用されます。

## ルール一覧

### 1. カラー値の統一

#### ルール

- `#ffffff` → `var(--color-white, #f1f5f9)` に変更
- `var(--color-white, #ffffff)` → `var(--color-white, #f1f5f9)` に変更
- `#000000` → `var(--color-black, #010101)` に変更
- `var(--color-black, #000000)` → `var(--color-black, #010101)` に変更
- `var(--color-gray, #666)` → `var(--color-gray, #808080)` に変更
- `var(--color-white)` → `var(--color-white, #f1f5f9)` に変更
- `var(--color-black)` → `var(--color-black, #010101)` に変更
- `var(--color-purple)` → `var(--color-purple, #639)` に変更
- `var(--color-red)` → `var(--color-purple, #ff4f48)` に変更

#### 良い例

```css
background-color: var(--color-white, #f1f5f9);
color: var(--color-black, #010101);
border-color: var(--color-gray, #808080);
```

#### 悪い例
```css
background-color: #ffffff;
color: #000000;
border-color: var(--color-gray, #666);
```

---

### 2. 色関数表記の統一

#### ルール
`rgba()` 形式を `rgb()` 形式に統一します。

#### 良い例
```css
background-color: rgb(0 0 0 / 0.7);
box-shadow: 0 1.25rem 3.75rem rgb(0 0 0 / 0.3);
```

#### 悪い例
```css
background-color: rgba(0, 0, 0, 0.7);
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
```

---

### 3. 疑似クラスの統一

#### ルール
`:hover` と `:focus-visible` の個別指定を `:is(:hover, :focus-visible)` に統一します。

#### 良い例
```css
.button:is(:hover, :focus-visible) {
  background-color: var(--color-purple, #8b5cf6);
  outline: var(--color-purple, #8b5cf6) 0.125rem solid;
}
```

#### 悪い例
```css
.button:hover {
  background-color: var(--color-purple, #8b5cf6);
}

.button:focus-visible {
  outline: var(--color-purple, #8b5cf6) 0.125rem solid;
}
```

---

### 4. padding表記の統一

#### ルール
`padding: X Y;` 形式を `padding-block` と `padding-inline` に分割します。

#### 良い例
```css
padding-block: 1rem;
padding-inline: 0.5rem;
```

#### 悪い例
```css
padding: 1rem 0.5rem;
```

#### 単一値の場合
```css
/* 良い例 */
padding-block: 2rem;
padding-inline: 2rem;

/* 悪い例 */
padding: 2rem;
```

---

### 5. 単位の変換（px → rem）

#### ルール
`border-radius`のpx値をremに変換します。

#### 変換表
- `2px` → `0.125rem`
- `4px` → `0.25rem`
- `8px` → `0.5rem`
- `12px` → `0.75rem`
- `16px` → `1rem`
- `32px` → `2rem`
- `50px` → `3.125rem`

#### 良い例
```css
border-radius: 0.5rem;
```

#### 悪い例
```css
border-radius: 8px;
```

---

### 6. border表記の統一

#### ルール
カラー変数を先頭に配置します。

#### 良い例
```css
border: var(--color-black, #010101) 1px solid;
border-bottom: var(--color-gray-light, #e0e0e0) 1px solid;
```

#### 悪い例
```css
border: 1px solid var(--color-black, #010101);
border-bottom: 1px solid var(--color-gray-light, #e0e0e0);
```

---

### 7. margin/padding方向の変更

#### ルール
`margin-block-end`、`padding-block-end` を `margin-block-start`、`padding-block-start` に変更します。

#### 注意事項
- デザイン崩れを防ぐため、要素の順序とスペーシングを慎重に確認してください
- 最初の要素には `margin-block-start` を適用し、要素間のスペースを維持します

#### 良い例
```css
.header {
  margin-block-start: 2rem;
}

.section {
  margin-block-start: 2rem;
}
```

#### 悪い例
```css
.header {
  margin-block-end: 2rem;
}

.section {
  margin-block-end: 2rem;
}
```

---

### 8. 頻出色の変数化

#### ルール
頻出する色をCSS変数として定義し、使用箇所を置き換えます。

#### 定義済み変数
以下の変数は `src/styles/global.css` の `:root` に定義されています：

```css
:root {
  --color-gray-light: #e0e0e0;
  --color-gray-lightest: #f8f9fa;
  --color-blue-light: #4a90e2;
  --color-blue-hover: #3a7bc8;
  --color-purple-dark: #7c3aed;
}
```

#### 良い例
```css
background-color: var(--color-blue-light, #4a90e2);
border-color: var(--color-gray-light, #e0e0e0);
```

#### 悪い例
```css
background-color: #4a90e2;
border-color: #e0e0e0;
```

---

## CSS変数一覧

### 基本カラー
- `--color-white: #f1f5f9`
- `--color-black: #010101`
- `--color-purple: #639`
- `--color-red: #ff4f48`
- `--color-blue: #0d0950`
- `--color-gray: #808080`

### 拡張カラー
- `--color-gray-light: #e0e0e0`
- `--color-gray-lightest: #f8f9fa`
- `--color-blue-light: #4a90e2`
- `--color-blue-hover: #3a7bc8`
- `--color-purple-dark: #7c3aed`

---

## チェックリスト

新しいCSSファイルを作成する際は、以下の項目を確認してください：

- [ ] カラー値がCSS変数を使用しているか
- [ ] `rgba()` が `rgb()` 形式に変換されているか
- [ ] `:hover` と `:focus-visible` が `:is(:hover, :focus-visible)` に統一されているか
- [ ] `padding` が `padding-block` と `padding-inline` に分割されているか
- [ ] px値がremに変換されているか（border-radius、top、rightなど）
- [ ] `border` のカラー変数が先頭に配置されているか
- [ ] `margin-block-end` が `margin-block-start` に変更されているか
- [ ] 頻出色がCSS変数として定義されているか

---

## 参考

- [CSS Logical Properties and Values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Modern CSS Color Functions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Colors/Color_function_syntax)
