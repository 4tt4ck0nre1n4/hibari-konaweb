import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import node from "@astrojs/node";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
// import dynamicImport from 'vite-plugin-dynamic-import'; // pagefindと競合するため削除
import sitemap from "@astrojs/sitemap";

import netlify from "@astrojs/netlify";
import { asyncSwiperCssPlugin } from "./async-css-optimizer.js";

// WordPressドメインを環境変数から取得（リモート画像最適化用）
function getWordPressDomain() {
  const apiUrl = process.env.PUBLIC_API_URL;
  if (!apiUrl) {
    return undefined;
  }
  try {
    const url = new URL(apiUrl);
    return url.hostname;
  } catch {
    return undefined;
  }
}

const wordPressDomain = getWordPressDomain();
const imageDomains = ["astro.build"];
if (wordPressDomain) {
  imageDomains.push(wordPressDomain);
  console.log(`✅ [Image Config] WordPress domain added for image optimization: ${wordPressDomain}`);
} else {
  console.warn("⚠️ [Image Config] WordPress domain not found. Remote image optimization may not work.");
}

export default defineConfig({
  site: "https://hibari-konaweb.netlify.app",
  build: {
    format: "file",
    inlineStylesheets: "auto", // 自動的に小さなCSSをインライン化
  },
  // docs/ディレクトリをビルドから除外（ドキュメントは本番環境には不要）
  publicDir: "public",
  // src/pages/以外の.mdファイルはビルド対象外
  // docs/ディレクトリはGitHubリポジトリには含まれるが、本番ビルドには含まれない
  integrations: [
    react(),
    pagefind(),
    sitemap({
      i18n: {
        defaultLocale: "ja",
        xslURL: "/sitemap.xsl",
      },
    }),
    icon({
      include: {
        devicon: [
          "twitter",
          "github",
          "notion",
          "html5",
          "css3",
          "sass",
          "javascript",
          "typescript",
          "jquery",
          "swiper",
          "react",
          "canva",
          "xd",
          "vitejs",
          "astro",
          "vscode",
          "vercel",
        ],
        logos: ["wordpress-icon", "greensock-icon", "netlify-icon", "gulp"],
        "fa6-solid": ["cat", "envelope"],
        "fa6-brands": ["instagram"],
        ic: ["baseline-contact-mail"],
        "fluent-emoji": [
          "red-heart",
          "mobile-phone",
          "mobile-phone-with-arrow",
          "party-popper",
          "magic-wand",
          "wrapped-gift",
          "woman-technologist-light",
        ],
        "fluent-emoji-flat": [
          "house",
          "envelope",
          "confetti-ball",
          "desktop-computer",
          "woman-technologist-medium-light",
          "man-technologist-medium-light",
        ],
        "fluent-emoji-high-contrast": ["party-popper", "mobile-phone", "mobile-phone-with-arrow"],
        "emojione-v1": ["alarm-clock", "bookmark"],
        bi: ["alarm-fill", "github"],
        octicon: ["play-24"],
        carbon: ["pause-outline"],
        ion: ["play-back-circle-outline"],
        solar: ["restart-circle-outline"],
        "flat-color-icons": ["home"],
        "vscode-icons": ["file-type-cursorrules"],
      },
      iconDir: "src/assets/icons",

      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: "removeRasterImages",
            active: false,
          },
          {
            name: "removeViewBox",
            active: false,
          },
        ],
      },
    }),
    asyncSwiperCssPlugin(), // CSSの非同期読み込み最適化（Swiper CSS、非クリティカルなフォント、reset/global CSS）
  ],
  image: {
    // リモート画像最適化を許可するドメイン
    // WordPressのドメインは環境変数から動的に取得（ビルド時に解決）
    domains: imageDomains,
    // リモート画像のサービス設定
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  base: "/",
  trailingSlash: "ignore",
  output: "static", // 完全静的サイト生成（pagefind対応）
  // output: "server", // SSRが必要な場合（pagefind非対応）
  server: {
    port: 4321, // ポートを4321に固定
    host: true,
    open: true,
    hmr: {
      host: "localhost",
      port: 4321,
      protocol: "ws",
    },
  },
  vite: {
    plugins: [
      // dynamicImport() // pagefindと競合するため削除
    ],
    cacheDir: ".vite-cache", // node_modules外にキャッシュを配置
    build: {
      emptyOutDir: false, // Windowsのファイルロック問題を回避
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      sourcemap: false, // 本番環境では無効化（ファイルサイズ削減とセキュリティのため）
      minify: "esbuild", // JavaScriptの最小化を有効化（パフォーマンス改善）
      cssCodeSplit: true, // CSSコード分割を有効化
      cssMinify: true, // CSSの最小化を有効化
      // チャンクサイズの最適化
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // GSAPなどのライブラリを適切にバンドル
          manualChunks: (id) => {
            if (id.includes("node_modules/gsap")) {
              return "gsap";
            }
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    assetsInclude: ["**/*.wasm"],
  },
});
