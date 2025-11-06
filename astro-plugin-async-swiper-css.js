/**
 * Astroプラグイン: Swiper CSSのみを非同期読み込みにする
 * レンダリングブロックを削減してLCPを改善
 * Swiper CSSのみを対象とし、他のCSSは通常通り読み込み
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function asyncSwiperCssPlugin() {
  return {
    name: "async-swiper-css",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        try {
          // ビルド後のHTMLファイルを処理
          const buildDir = typeof dir === "string" ? dir : dir.pathname || dir.href || "./dist";
          const htmlFiles = findHtmlFiles(buildDir);

          console.log(`[async-swiper-css] Processing ${htmlFiles.length} HTML files...`);

          for (const htmlFile of htmlFiles) {
            let html = fs.readFileSync(htmlFile, "utf-8");
            let modified = false;

            // Swiper CSSのみを非同期読み込みに変換
            html = html.replace(/<link([^>]*?)rel=["']stylesheet["']([^>]*?)>/gi, (match, before, after) => {
              // すでにpreloadやその他の特別な属性がある場合はスキップ
              if (match.includes('rel="preload"') || match.includes('media="print"')) {
                return match;
              }

              // href属性を抽出
              const hrefMatch = match.match(/href=["']([^"']+)["']/);
              if (!hrefMatch) {
                return match;
              }

              const href = hrefMatch[1];

              // インライン化されたCSSはスキップ
              if (href.startsWith("data:")) {
                return match;
              }

              // Swiper CSSのみを対象とする
              if (!href.includes("swiper")) {
                return match; // Swiper以外のCSSは変更しない
              }

              modified = true;

              // media="print" hack を使用して非同期読み込み
              // より確実に動作し、CSPにも対応
              const normalizedHref = href.startsWith("/") ? href : `/${href}`;

              return `<link rel="stylesheet" href="${normalizedHref}" media="print" onload="this.media='all'" />\n<noscript><link rel="stylesheet" href="${normalizedHref}" /></noscript>`;
            });

            if (modified) {
              fs.writeFileSync(htmlFile, html, "utf-8");
              console.log(`[async-swiper-css] ✅ Optimized: ${path.relative(buildDir, htmlFile)}`);
            }
          }

          console.log(`[async-swiper-css] ✅ Swiper CSS optimization complete!`);
        } catch (error) {
          console.error("[async-swiper-css] ❌ Error:", error);
        }
      },
    },
  };
}

function findHtmlFiles(dir) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findHtmlFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}
