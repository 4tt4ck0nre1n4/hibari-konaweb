import { defineConfig } from 'astro/config';

import react from "@astrojs/react";
import node from "@astrojs/node";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
// import dynamicImport from 'vite-plugin-dynamic-import'; // pagefindと競合するため削除
import sitemap from "@astrojs/sitemap";

import netlify from "@astrojs/netlify";

export default defineConfig({
  site: "https://hibari-konaweb.netlify.app",
  build: {
    format: "file",
  },
  integrations: [
    react(),
    pagefind(),
    sitemap({
      i18n: {
        defaultLocale: "ja",
        xslURL: "/sitemap.xsl"
      },
    }),
    icon({
      include: {
        "devicon": [
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
          "vercel"
        ],
        "logos": [
          "wordpress-icon",
          "greensock-icon",
          "netlify-icon",
          "gulp"
        ],
        "fa6-solid": [
          "cat",
          "envelope"
        ],
        "fa6-brands": [
          "instagram"
        ],
        "ic": [
          "baseline-contact-mail"
        ],
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
        "fluent-emoji-high-contrast": [
          "party-popper",
          "mobile-phone",
          "mobile-phone-with-arrow",
        ],
        "emojione-v1": [
          "alarm-clock",
          "bookmark"
        ],
        "bi": [
          "alarm-fill",
          "github"
        ],
        "octicon": [
          "play-24"
        ],
        "carbon": [
          "pause-outline"
        ],
        "ion": [
          "play-back-circle-outline"
        ],
        "solar": [
          "restart-circle-outline"
        ],
        "flat-color-icons": [
          "home"
        ],
        "vscode-icons": [
          "file-type-cursorrules"
        ],
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
  ],
  image: {
    domains: [
      "astro.build",
    ],
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
      sourcemap: false,
      minify: false,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    assetsInclude: [
      "**/*.wasm"
    ],
  },
});
