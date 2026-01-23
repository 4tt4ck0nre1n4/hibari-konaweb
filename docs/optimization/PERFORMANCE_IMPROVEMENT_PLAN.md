# パフォーマンス改善計画

## 現状の問題点

PageSpeed Insights診断結果（モバイル）:
- **パフォーマンススコア**: 45点
- **Total Blocking Time**: 1,110ms（目標: <200ms）
- **Speed Index**: 7.5秒（目標: <3.4秒）
- **Largest Contentful Paint**: 7.7秒（目標: <2.5秒）
- **First Contentful Paint**: 0.9秒（良好）

## 改善策の優先順位

### 1. JavaScriptバンドルの最適化（最優先）

#### 問題点
- Total Blocking Timeが1,110msと非常に高い
- 初期読み込み時に大量のJavaScriptが実行されている
- Swiperライブラリが初期読み込み時にバンドルされている可能性

#### 改善策
1. **Swiperライブラリの遅延読み込み**
   - `SwiperMenu.astro`と`SwiperDisplay.astro`でSwiperを動的インポート
   - Intersection Observerでビューポートに入った時に読み込む

2. **Reactコンポーネントのハイドレーション最適化**
   - `client:idle`を`client:visible`に変更（より積極的な遅延）
   - 必要に応じて`client:only`を使用してSSRをスキップ

3. **GSAPの遅延読み込み強化**
   - 既存の`requestIdleCallback`を維持しつつ、タイムアウトを調整
   - より積極的な遅延（10秒以上）

### 2. CSSの最適化

#### 問題点
- 非クリティカルなCSSがレンダリングをブロックしている可能性
- Swiper CSSが初期読み込み時に含まれている

#### 改善策
1. **Critical CSSの抽出**
   - ファーストビューに必要なCSSのみをインライン化
   - 既存の`async-css-optimizer.js`を活用

2. **非クリティカルCSSの遅延読み込み強化**
   - `media="print"`ハックをより積極的に使用
   - `preload`パターンの最適化

### 3. フォント読み込みの最適化

#### 問題点
- 複数のフォントが初期読み込み時に読み込まれている
- 非クリティカルなフォント（Poppins 700、Cinzel、Playfair Display、Marcellus）が初期読み込みをブロック

#### 改善策
1. **可変フォントの使用**
   - Poppinsを可変フォントに変更（`@fontsource/poppins/variable.css`）
   - 1つのファイルで複数のウェイトを提供

2. **フォントのサブセット化**
   - Latin文字のみを読み込む（`@fontsource/poppins/latin-400.css`）
   - 日本語フォントが必要な場合は別途検討

3. **非クリティカルフォントの遅延読み込み**
   - `NonCriticalFonts.astro`の読み込みをより積極的に遅延
   - `requestIdleCallback`を使用

### 4. 画像最適化の強化

#### 問題点
- LCPが7.7秒と高い
- 画像の最適化は既に実施されているが、さらなる改善が必要

#### 改善策
1. **AVIF形式の追加**
   - WebPに加えてAVIF形式を提供
   - より高い圧縮率でファイルサイズを削減

2. **画像サイズの最適化**
   - モバイル用画像のサイズをさらに削減（1024px → 768px）
   - qualityを75から65に下げる（視覚的影響を確認しながら）

3. **画像のプリロード最適化**
   - 既存のプリロードを維持
   - `fetchpriority="high"`の使用を確認

### 5. サードパーティスクリプトの最適化

#### 問題点
- Google Analyticsが初期読み込みに影響している可能性

#### 改善策
1. **Google Analyticsの遅延読み込み強化**
   - 既存の遅延読み込みを維持
   - Intersection Observerのthresholdを調整

### 6. Reactコンポーネントの最適化

#### 問題点
- Reactコンポーネントが初期読み込み時にハイドレーションされている
- `ParticlesComponent`、`RiveComponent`などが初期読み込みをブロック

#### 改善策
1. **ハイドレーション戦略の見直し**
   - `client:idle` → `client:visible`に変更
   - より積極的な遅延読み込み

2. **SSRのスキップ**
   - 必要に応じて`client:only`を使用
   - サーバーサイドレンダリングが不要なコンポーネントを特定

## 実装計画

### フェーズ1: JavaScript最適化（即座に実施）
1. Swiperライブラリの遅延読み込み
2. Reactコンポーネントのハイドレーション最適化
3. GSAPの遅延読み込み強化

### フェーズ2: CSS最適化
1. Critical CSSの抽出
2. 非クリティカルCSSの遅延読み込み強化

### フェーズ3: フォント最適化
1. 可変フォントへの移行
2. サブセット化

### フェーズ4: 画像最適化
1. AVIF形式の追加
2. 画像サイズの最適化

## 期待される効果

- **Total Blocking Time**: 1,110ms → 200ms以下（82%削減）
- **Speed Index**: 7.5秒 → 3.4秒以下（55%削減）
- **LCP**: 7.7秒 → 2.5秒以下（68%削減）
- **パフォーマンススコア**: 45点 → 90点以上

## 注意事項

1. **視覚的品質の維持**
   - 画像のqualityを下げる際は、視覚的影響を確認
   - フォントの読み込み遅延によるFOUTを最小限に

2. **機能性の維持**
   - 遅延読み込みにより、機能が損なわれないように注意
   - ユーザー体験を優先

3. **段階的な実装**
   - 一度にすべてを変更せず、段階的に実装
   - 各変更後にPageSpeed Insightsで検証
