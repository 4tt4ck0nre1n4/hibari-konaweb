import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import node from "@astrojs/node";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
// import dynamicImport from 'vite-plugin-dynamic-import'; // pagefindと競合するため削除
import sitemap from "@astrojs/sitemap";

import netlify from "@astrojs/netlify";
import { asyncSwiperCssPlugin } from "./astro-plugin-async-swiper-css.js";

export default defineConfig({
  site: "https://hibari-konaweb.netlify.app",
  build: {
    format: "file",
    inlineStylesheets: "auto", // 自動的に小さなCSSをインライン化
  },
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
    asyncSwiperCssPlugin(), // Swiper CSSのみを非同期読み込み
  ],
  image: {
    domains: ["astro.build"],
  },
  base: "/",
  trailingSlash: "ignore",
  output: "static", // 完全静的サイト生成（pagefind対応）
  // output: "server", // SSRが必要な場合（pagefind非対応）
  server: {
    host: true,
    open: true,
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
      sourcemap: true, // デバッグ用に一時的に有効化
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
              // GSAPコアとプラグインを分割
              if (id.includes("gsap/ScrollTrigger")) {
                return "gsap-scrolltrigger";
              }
              return "gsap";
            }
            // Reactとその他のライブラリも分割
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "react-vendor";
            }
            if (id.includes("node_modules/swiper")) {
              return "swiper";
            }
            if (id.includes("node_modules")) {
              return "vendor";
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
