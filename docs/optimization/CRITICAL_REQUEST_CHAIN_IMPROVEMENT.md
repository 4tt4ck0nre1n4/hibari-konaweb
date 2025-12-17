# クリティカル リクエスト チェーン改善提案

## 📖 クリティカル リクエスト チェーンとは？

**クリティカル リクエスト チェーン（Critical Request Chain）** とは、ページの初期表示に必要なリソースが**順次読み込まれる依存関係の連鎖**のことです。

### 問題の仕組み

```
HTML → JSファイル1 → JSファイル2 → JSファイル3 → ...
  ↓         ↓            ↓            ↓
832ms   2,523ms      2,786ms      2,534ms
```

各リソースが**前のリソースの読み込み完了を待つ**ため、待ち時間が**累積**されます。

現在のサイトでは：

- **メインページ**: 832ms
- **JavaScriptファイル群**: 各2,000ms以上
- **合計クリティカルパス待ち時間**: **3,803ms** 🔴

### なぜ問題なのか？

1. **LCP（Largest Contentful Paint）の遅延**: ページの主要コンテンツが表示されるまで時間がかかる
2. **TTI（Time to Interactive）の遅延**: ユーザーが操作できるようになるまで時間がかかる
3. **ユーザー体験の悪化**: 特にモバイル環境で顕著

---

## 🎯 改善戦略

### 基本方針

1. **非クリティカルなリソースを遅延読み込み**
2. **コード分割とチャンク最適化**
3. **インラインスクリプトの外部化と遅延読み込み**
4. **コンポーネントの条件付き読み込み**

---

## 📋 具体的な改善提案

### 【優先度1】インラインスクリプトの外部化と遅延読み込み ⚡

#### 現状の問題

`src/pages/index.astro`に2つの大きなインラインスクリプトがあります：

1. **JSConfettiスクリプト** (281-440行目)
2. **GSAPスクリプト** (1263-1759行目)

これらがHTMLに直接埋め込まれているため、HTMLのダウンロードと同時に実行され、クリティカルパスをブロックしています。

#### 改善案

**1. JSConfettiスクリプトの外部化**

```diff
// src/pages/index.astro
- <script>
-   // @ts-nocheck
-   import JSConfetti from "js-confetti";
-   // ... 400行以上のコード ...
- </script>

+ <script>
+   // 外部ファイルに移動
+   import("./scripts/confetti-init.js");
+ </script>
```

**新規ファイル作成**: `src/scripts/confetti-init.ts`

```typescript
import JSConfetti from "js-confetti";

function initConfetti() {
  // 既存のコードを移動
  // ...
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initConfetti);
} else {
  initConfetti();
}
```

**2. GSAPスクリプトの遅延読み込み**

```diff
// src/pages/index.astro
- <script>
-   // @ts-nocheck
-   import { gsap } from "gsap";
-   import { ScrollTrigger } from "gsap/ScrollTrigger";
-   // ... 500行以上のコード ...
- </script>

+ <script>
+   // requestIdleCallbackで遅延読み込み
+   const initGSAP = async () => {
+     const [{ gsap }, { ScrollTrigger }] = await Promise.all([
+       import("gsap"),
+       import("gsap/ScrollTrigger")
+     ]);
+
+     gsap.registerPlugin(ScrollTrigger);
+     // 既存のコードを実行
+     // ...
+   };
+
+   if ("requestIdleCallback" in window) {
+     window.requestIdleCallback(() => {
+       void initGSAP();
+     }, { timeout: 2000 });
+   } else {
+     setTimeout(() => {
+       void initGSAP();
+     }, 100);
+   }
+ </script>
```

**期待される改善**:

- クリティカルパスから **約2,000ms削減** ✅
- HTMLサイズ **-50KB以上削減** ✅
- 初期JavaScript実行時間 **大幅削減** ✅

---

### 【優先度2】コンポーネントの遅延読み込み 🔄

#### 現状の問題

画像の依存関係ツリーから、以下のコンポーネントが即座に読み込まれています：

- `SwiperMenu.astro` → `swiper-bundle.js` (2,786ms, 22.42 KiB)
- `SoundToggle` → `SoundToggle.DokelzoC.js` (3,280ms, 1.11 KiB)
- `ParticlesComponent` → `ParticlesComponent.Bk60KCue.js` (3,267ms, 1.92 KiB)
- `HamburgerMenu` → `HamburgerMenu.peXHxMzl.js` (2,219ms, 3.66 KiB)
- `iconify` → `iconifyCBCyBAgn.js` (2,526ms, 7.36 KiB)

これらは初期表示に**必須ではない**ため、遅延読み込みが可能です。

#### 改善案

**1. SwiperMenuの遅延読み込み**

```diff
// src/pages/index.astro
- <div class="sidebar">
-   <SwiperMenu />
- </div>

+ <div class="sidebar">
+   <SwiperMenu client:idle />
+ </div>
```

**2. SoundToggleの遅延読み込み**

```diff
// src/components/Navigation.astro
- <SoundToggle client:only="react" />
+ <SoundToggle client:idle />
```

**3. ParticlesComponentの遅延読み込み**

```diff
// src/components/Aside.astro
- <ParticlesComponent client:only="react" />
+ <ParticlesComponent client:idle />
```

**4. HamburgerMenuの遅延読み込み**

```diff
// src/components/Header.astro または Navigation.astro
- <HamburgerMenu />
+ <HamburgerMenu client:idle />
```

**期待される改善**:

- クリティカルパスから **約3,000ms削減** ✅
- 初期JavaScriptサイズ **-35KB削減** ✅

---

### 【優先度3】コード分割とチャンク最適化 📦

#### 現状の問題

`astro.config.mjs`でGSAPのみが手動チャンクに分けられていますが、他のライブラリは最適化されていません。

#### 改善案

**astro.config.mjsの拡張**

```diff
// astro.config.mjs
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/gsap")) {
              return "gsap";
            }
+           // Swiperを別チャンクに
+           if (id.includes("swiper")) {
+             return "swiper";
+           }
+           // React関連を別チャンクに
+           if (id.includes("react") || id.includes("react-dom") || id.includes("react/jsx-runtime")) {
+             return "react-vendor";
+           }
+           // Iconifyを別チャンクに
+           if (id.includes("@iconify") || id.includes("iconify")) {
+             return "iconify";
+           }
+           // JSConfettiを別チャンクに
+           if (id.includes("js-confetti")) {
+             return "confetti";
+           }
+           // その他のnode_modules
+           if (id.includes("node_modules")) {
+             return "vendor";
+           }
          },
        },
      },
    },
  },
```

**期待される改善**:

- 並列ダウンロードが可能になり、**待ち時間を分散** ✅
- キャッシュ効率の向上 ✅

---

### 【優先度4】リソースのプリロード/プリコネクト最適化 🔗

#### 現状の問題

画像のプリロードは設定されていますが、JavaScriptファイルの優先度が最適化されていません。

#### 改善案

**クリティカルなJavaScriptのみをプリロード**

```diff
// src/layouts/Layout.astro または HeadLayout.astro
  <link slot="head" rel="preload" href={fvBackgroundImage.src} as="image" fetchpriority="high" />
  <link slot="head" rel="preload" href={fvAnimeImage.src} as="image" fetchpriority="high" />
  <link slot="head" rel="preload" href={gridBackgroundImage.src} as="image" fetchpriority="high" />
+
+ <!-- クリティカルなJavaScriptのみをプリロード -->
+ <!-- 注意: 実際のファイル名はビルド後に確認が必要 -->
+ <!-- <link slot="head" rel="modulepreload" href="/_astro/index.astro_ast....DISqnwfP.js" /> -->
```

**非クリティカルなリソースは遅延読み込み**

```diff
+ <!-- 非クリティカルなリソースは読み込まない -->
+ <!-- Swiper、Particles、SoundToggleなどは client:idle で遅延読み込み -->
```

**期待される改善**:

- クリティカルパスの**最適化** ✅
- 不要なプリロードの削減 ✅

---

### 【優先度5】Iconifyアイコンの自己ホスティング 🎨

#### 現状の問題

`iconifyCBCyBAgn.js` (2,526ms, 7.36 KiB) が外部API (`api.iconify.design`) から読み込まれている可能性があります。

#### 改善案

**1. 使用するアイコンの確認**

```bash
# プロジェクト内で使用されているアイコンを確認
grep -r "iconify" src/
```

**2. アイコンの自己ホスティング化**

Astro Iconプラグインを使用している場合、既に最適化されている可能性がありますが、確認が必要です。

**期待される改善**:

- 外部APIへのリクエスト削減 ✅
- 読み込み時間 **-2,500ms削減** ✅

---

## 📈 期待される総合的な改善効果

| 指標                               | 改善前   | 改善後（予想） | 改善幅              |
| ---------------------------------- | -------- | -------------- | ------------------- |
| **クリティカルパスの最大待ち時間** | 3,803 ms | **< 1,000 ms** | -2,803 ms (-74%) 🎉 |
| **初期JavaScriptサイズ**           | ~100 KiB | **< 50 KiB**   | -50 KiB (-50%) 🎉   |
| **JavaScript実行時間**             | ~3秒     | **< 1秒**      | -2秒 (-67%) 🎉      |

### Core Web Vitals への影響

1. **LCP (Largest Contentful Paint)**

   - 改善前: ~3.8秒（Poor）
   - 改善後: **< 2.5秒（Good）** ✅

2. **FID (First Input Delay)**

   - 改善前: ~150ms
   - 改善後: **< 100ms（Good）** ✅

3. **TTI (Time to Interactive)**
   - 改善前: ~4秒
   - 改善後: **< 2秒** ✅

---

## 🔍 実装の優先順位

### フェーズ1: 即座に実施（影響大）

1. ✅ インラインスクリプトの外部化（JSConfetti、GSAP）
2. ✅ コンポーネントの遅延読み込み（SwiperMenu、SoundToggle、ParticlesComponent）

**期待される改善**: クリティカルパス **-3,000ms**

### フェーズ2: 短期間で実施（影響中）

3. ✅ コード分割とチャンク最適化
4. ✅ リソースのプリロード最適化

**期待される改善**: 追加で **-500ms**

### フェーズ3: 中長期で実施（影響小）

5. ✅ Iconifyアイコンの自己ホスティング化

**期待される改善**: 追加で **-300ms**

---

## 🧪 検証方法

### 1. ローカルでの確認

```bash
npm run build
npm run preview
```

### 2. Chrome DevToolsでの確認

1. **Networkタブ**で「Slow 3G」を選択
2. ページをリロード
3. **Performanceタブ**で「Record」をクリック
4. ページをリロードして記録を停止
5. **Main Thread**でJavaScript実行時間を確認

### 3. PageSpeed Insightsで再測定

- https://pagespeed.web.dev/
- モバイルとデスクトップ両方で測定
- **ネットワーク依存関係ツリー**を確認

### 4. 重要な確認ポイント

- ✅ すべての機能が正常に動作する
- ✅ アニメーションが適切なタイミングで開始される
- ✅ ユーザー体験が悪化していない

---

## 📚 参考リンク

- [Web.dev - Critical Request Chains](https://web.dev/critical-request-chains/)
- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Web.dev - Optimize LCP](https://web.dev/optimize-lcp/)
- [requestIdleCallback API](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
- [Web.dev - Reduce JavaScript execution time](https://web.dev/reduce-javascript-execution-time/)

---

## 📝 実装チェックリスト

### フェーズ1

- [x] JSConfettiスクリプトの外部化 ✅ (2025-01-XX)
- [x] GSAPスクリプトの遅延読み込み ✅ (2025-01-XX)
- [x] SwiperMenuを`client:idle`に変更 ✅ (2025-01-XX)
- [x] SoundToggleを`client:idle`に変更 ✅ (既に実装済み)
- [x] ParticlesComponentを`client:idle`に変更 ✅ (既に実装済み)
- [x] HamburgerMenuを`client:idle`に変更 ✅ (2025-01-XX)

### フェーズ2

- [x] コード分割とチャンク最適化（astro.config.mjs） ✅ (2025-01-XX)
- [ ] リソースのプリロード最適化

### フェーズ3

- [ ] Iconifyアイコンの自己ホスティング化

---

## 📅 更新履歴

- **2025-01-XX**: 初版作成 - クリティカル リクエスト チェーン改善提案
- **2025-01-XX**: フェーズ1・フェーズ2の実装完了 - JSConfetti/GSAP外部化、コンポーネント遅延読み込み、コード分割最適化
