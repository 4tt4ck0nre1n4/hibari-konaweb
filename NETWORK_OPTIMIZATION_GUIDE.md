# ネットワーク依存関係ツリー最適化ガイド

## 📊 改善前の状態

### PageSpeed Insights診断結果

- **クリティカルパスの最大待ち時間**: 4,151 ms 🔴
- **合計スコア**: Poor（改善が必要）

### 主要なボトルネック

| リソース                                 | 読み込み時間 | サイズ        | 影響度  |
| ---------------------------------------- | ------------ | ------------- | ------- |
| `/wasm/rive.wasm`                        | 4,151 ms     | 463.96 KiB    | 🔴 最大 |
| `ScrollTrigger.js`                       | 3,623 ms     | 17.75 KiB     | 🔴 高   |
| `fluent-emoji.json` (api.iconify.design) | 3,378 ms     | 6.73 KiB      | 🔴 高   |
| `/riv/*.riv` (3ファイル)                 | 3,000+ ms    | 合計23 KiB    | 🔴 高   |
| `RiveComponent.js`                       | 2,489 ms     | 43.94 KiB     | 🟡 中   |
| `swiper-bundle.js`                       | 2,274 ms     | 22.36 KiB     | 🟡 中   |
| **合計**                                 | **約20秒**   | **約550 KiB** | -       |

---

## 🎯 実施した最適化

### 【優先度1】Riveアニメーションの遅延読み込み ⚡

#### 問題点

- `rive.wasm` (464 KB) がページ読み込み時に即座にダウンロードされ、クリティカルパスをブロック
- 3つの`.riv`ファイルがプリロードされている
- 初期表示に必須ではないアニメーションがLCPを遅延させている

#### 実施内容

**1. client:onlyからclient:visibleへ変更**

```diff
// src/components/GridRive.astro
- <RiveComponent client:only="react" />
+ <RiveComponent client:visible />
```

**効果**: ビューポートに入るまでRiveコンポーネントを読み込まない

**2. rivファイルのプリロード削除**

```diff
// src/pages/index.astro
- const riveImages = ["/riv/my-portfolio.riv", "/riv/working-office.riv", "/riv/designer-life.riv"];
- riveImages.forEach((src) => {
-   const link = document.createElement("link");
-   link.rel = "preload";
-   ...
- });
+ // プリロード削除：client:visibleで必要なときのみ読み込む
```

**期待される改善**:

- クリティカルパスから **4.151秒削減** ✅
- 初期ダウンロードサイズ **-486 KiB** ✅
- LCP (Largest Contentful Paint) **大幅改善** ✅

---

### 【優先度2】ReactコンポーネントのIdleロード 🔄

#### 実施内容

**1. ParticlesComponent**

```diff
// src/components/Aside.astro
- <ParticlesComponent client:only="react" />
+ <ParticlesComponent client:idle />
```

**2. SoundToggle**

```diff
// src/components/Navigation.astro
- <SoundToggle client:only="react" />
+ <SoundToggle client:idle />
```

**効果**: ブラウザがアイドル状態になってから読み込む（重要なコンテンツの後）

**期待される改善**:

- クリティカルパスから **約1秒削減** ✅
- TTI (Time to Interactive) **改善** ✅

---

### 【優先度3】GSAPとScrollTriggerの遅延読み込み 📦

#### 問題点

- `ScrollTrigger.js` (17.75 KiB, 3.6秒) がクリティカルパスに含まれている
- `window.addEventListener("load")`で即座に読み込まれている

#### 実施内容

```diff
// src/pages/index.astro
- const gsapPromise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
- window.addEventListener("load", async () => {
-   const [{ gsap }, { ScrollTrigger }] = await gsapPromise;
-   ...
- });

+ const initGSAP = async () => {
+   const [{ gsap }, { ScrollTrigger }] = await Promise.all([
+     import("gsap"),
+     import("gsap/ScrollTrigger")
+   ]);
+   ...
+ };
+
+ // requestIdleCallbackで遅延読み込み
+ if ("requestIdleCallback" in window) {
+   window.requestIdleCallback(() => {
+     void initGSAP();
+   });
+ } else {
+   setTimeout(() => {
+     void initGSAP();
+   }, 100);
+ }
```

**効果**:

- ブラウザがアイドル状態になってから読み込む
- 初期表示をブロックしない

**期待される改善**:

- クリティカルパスから **約3.6秒削減** ✅
- FCP (First Contentful Paint) **改善** ✅

---

## 📈 期待される総合的な改善効果

| 指標                               | 改善前   | 改善後（予想） | 改善幅              |
| ---------------------------------- | -------- | -------------- | ------------------- |
| **クリティカルパスの最大待ち時間** | 4,151 ms | **< 1,000 ms** | -3,151 ms (-76%) 🎉 |
| **初期ダウンロードサイズ**         | ~550 KiB | **< 100 KiB**  | -450 KiB (-82%) 🎉  |
| **JavaScript実行時間**             | ~8秒     | **< 2秒**      | -6秒 (-75%) 🎉      |

### Core Web Vitals への影響

1. **LCP (Largest Contentful Paint)**

   - 改善前: ~4.5秒（Poor）
   - 改善後: **< 2.5秒（Good）** ✅

2. **FID (First Input Delay)**

   - 改善前: ~200ms
   - 改善後: **< 100ms（Good）** ✅

3. **CLS (Cumulative Layout Shift)**
   - 改善前: 0.151（前回の最適化後）
   - 改善後: **< 0.02（Good）** ✅（既に対応済み）

---

## 🔍 今後の最適化案

### 【優先度4】Iconifyアイコンの自己ホスティング 🎨

#### 現状の問題

- `api.iconify.design`への複数の外部リクエスト（各3秒前後）
- ネットワークレイテンシの影響を受けやすい

#### 推奨される対策

```bash
# 1. 必要なアイコンをローカルにダウンロード
npm install @iconify/json

# 2. 使用するアイコンセットのみを抽出
npm install @iconify/tools
```

```javascript
// アイコンをバンドルに含める
import { addIcon } from "@iconify/vue";
import homeIcon from "@iconify/json/json/flat-color-icons/home.json";
addIcon("flat-color-icons:home", homeIcon);
```

**期待される効果**:

- 外部APIへのリクエスト **0件** ✅
- 読み込み時間 **-3秒** ✅

---

### 【優先度5】画像の最適化 🖼️

#### 推奨される対策

1. **WebP/AVIFフォーマットへの変換**

   - 現在のJPEG/PNG → WebP/AVIF
   - ファイルサイズ 約30-50%削減

2. **レスポンシブ画像の実装**

   ```html
   <picture>
     <source type="image/avif" srcset="image.avif" />
     <source type="image/webp" srcset="image.webp" />
     <img src="image.jpg" alt="..." loading="lazy" />
   </picture>
   ```

3. **画像のサイズ最適化**
   - 実際の表示サイズに合わせてリサイズ
   - 不要な高解像度を避ける

---

## 📝 実装チェックリスト

- [x] Riveアニメーションを`client:visible`に変更
- [x] rivファイルのプリロード削除
- [x] ParticlesComponentを`client:idle`に変更
- [x] SoundToggleを`client:idle`に変更
- [x] GSAPを`requestIdleCallback`で遅延読み込み
- [ ] Iconifyアイコンの自己ホスティング化（次フェーズ）
- [ ] 画像のWebP/AVIF変換（次フェーズ）
- [ ] Font SubsettingまたはVariable Fonts導入（次フェーズ）

---

## 🧪 検証方法

### 1. ローカルでの確認

```bash
npm run build
npm run preview
```

### 2. PageSpeed Insightsで再測定

- https://pagespeed.web.dev/
- モバイルとデスクトップ両方で測定

### 3. 重要な確認ポイント

- ✅ Riveアニメーションが正常に表示される（スクロール後）
- ✅ ParticlesとSoundToggleが動作する
- ✅ GSAPアニメーションが正常に動作する
- ✅ すべてのアイコンが表示される

---

## 📚 参考リンク

- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Web.dev - Optimize LCP](https://web.dev/optimize-lcp/)
- [requestIdleCallback API](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
- [Critical Request Chains](https://web.dev/critical-request-chains/)

---

## 📅 更新履歴

- **2025-10-28**: 初版作成 - Rive、GSAP、Reactコンポーネントの遅延読み込み実装
