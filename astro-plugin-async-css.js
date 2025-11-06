/**
 * Astroプラグイン: CSSを非同期読み込みにする
 * レンダリングブロックを削減してLCPを改善
 * クリティカルCSSはインライン化済みのため、すべてのCSSファイルを非同期化
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function asyncCssPlugin() {
  return {
    name: "async-css",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        try {
          // ビルド後のHTMLファイルを処理
          const buildDir = typeof dir === "string" ? dir : dir.pathname || dir.href || "./dist";
          const htmlFiles = findHtmlFiles(buildDir);

          console.log(`[async-css] Processing ${htmlFiles.length} HTML files...`);

          for (const htmlFile of htmlFiles) {
            let html = fs.readFileSync(htmlFile, "utf-8");
            let modified = false;

            // すべてのCSSを非同期読み込みに変換
            // クリティカルCSSはすでにインライン化されているため安全
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

              modified = true;

              // media="print" hack を使用して非同期読み込み
              // より確実に動作し、CSPにも対応
              const normalizedHref = href.startsWith("/") ? href : `/${href}`;

              return `<link rel="stylesheet" href="${normalizedHref}" media="print" onload="this.media='all'" />\n<noscript><link rel="stylesheet" href="${normalizedHref}" /></noscript>`;
            });

            if (modified) {
              fs.writeFileSync(htmlFile, html, "utf-8");
              console.log(`[async-css] ✅ Optimized: ${path.relative(buildDir, htmlFile)}`);
            }
          }

          console.log(`[async-css] ✅ CSS optimization complete!`);
        } catch (error) {
          console.error("[async-css] ❌ Error:", error);
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
