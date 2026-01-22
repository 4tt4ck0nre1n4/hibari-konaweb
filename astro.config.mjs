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
    inlineStylesheets: "auto", // 小さなCSSを自動的にインライン化（Critical CSSと組み合わせて最適化）
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
      sourcemap: "hidden", // ソースマップを生成するが、JSファイルに参照を含めない（PageSpeed Insights対応 + セキュリティ）
      minify: "esbuild", // JavaScriptの最小化を有効化（パフォーマンス改善）
      cssCodeSplit: true, // CSSコード分割を有効化
      cssMinify: true, // CSSの最小化を有効化
      // チャンクサイズの最適化
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // Tree shakingを強化: 未使用のコードを削除
          treeshake: {
            moduleSideEffects: (id) => {
              // CSSファイルとAstroファイルは副作用ありとして扱う
              if (id.endsWith(".css") || id.endsWith(".scss") || id.endsWith(".astro")) {
                return true;
              }
              // その他のモジュールはTree shakingを適用
              return false;
            },
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false,
          },
          // GSAPなどのライブラリを適切にバンドル
          manualChunks: (id) => {
            // GSAPライブラリ（動的インポートで読み込まれるため、使用されないページではバンドルされない）
            if (id.includes("node_modules/gsap")) {
              return "gsap";
            }
            // Iconify関連のライブラリを細分化（ネットワーク依存関係ツリー最適化）
            // コアライブラリとJSONデータを分離して、必要なものだけを読み込む
            if (id.includes("node_modules/@iconify/react") || id.includes("node_modules/@iconify/types")) {
              return "iconify-core";
            }
            // 各アイコンセットを個別のチャンクに分割（必要なものだけを読み込む）
            if (id.includes("node_modules/@iconify-json/bi")) {
              return "iconify-bi";
            }
            if (id.includes("node_modules/@iconify-json/devicon")) {
              return "iconify-devicon";
            }
            if (id.includes("node_modules/@iconify-json/fa6")) {
              return "iconify-fa6";
            }
            if (id.includes("node_modules/@iconify-json/fluent-emoji")) {
              return "iconify-fluent";
            }
            if (id.includes("node_modules/@iconify-json/flat-color-icons")) {
              return "iconify-flat";
            }
            if (id.includes("node_modules/@iconify-json/ic")) {
              return "iconify-ic";
            }
            if (id.includes("node_modules/@iconify-json/streamline")) {
              return "iconify-streamline";
            }
            if (id.includes("node_modules/@iconify-json/twemoji")) {
              return "iconify-twemoji";
            }
            if (id.includes("node_modules/@iconify-json/vscode-icons")) {
              return "iconify-vscode";
            }
            // その他のIconify関連（フォールバック）
            if (id.includes("node_modules/@iconify") || id.includes("node_modules/@iconify-json")) {
              return "iconify-other";
            }
            // tsParticles関連のライブラリをまとめる
            if (id.includes("node_modules/@tsparticles")) {
              return "tsparticles";
            }
            // React関連のライブラリ（client:*ディレクティブで使用されるページでのみバンドルされる）
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "react-vendor";
            }
            // Rive関連のライブラリ
            if (id.includes("node_modules/@rive-app")) {
              return "rive";
            }
            // js-confetti（動的インポートで読み込まれるため、使用されないページではバンドルされない）
            if (id.includes("node_modules/js-confetti")) {
              return "js-confetti";
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
