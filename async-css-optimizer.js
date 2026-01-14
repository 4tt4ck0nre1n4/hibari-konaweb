/**
 * Astroプラグイン: CSSの非同期読み込み最適化
 * レンダリングブロックを削減してLCPを改善
 * - reset.css と global.css を含むCSSファイル: preload + onload パターン
 * - Swiper CSS: media="print" hack
 * - 非クリティカルなフォントの CSS: <link rel="preload"> で遅延読み込み
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function asyncSwiperCssPlugin() {
  return {
    name: "async-css-optimizer",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        try {
          // ビルド後のHTMLファイルを処理
          // dir は URL オブジェクトの場合があるので、fileURLToPath で変換
          let buildDir = "./dist";
          if (typeof dir === "string") {
            buildDir = dir;
          } else if (dir && typeof dir === "object") {
            // URL オブジェクトの場合
            try {
              if (dir.href) {
                buildDir = fileURLToPath(dir.href);
              } else if (dir.pathname) {
                // pathname が URL オブジェクトの場合
                if (typeof dir.pathname === "string" && dir.pathname.startsWith("file://")) {
                  buildDir = fileURLToPath(dir.pathname);
                } else {
                  buildDir = dir.pathname;
                }
              }
            } catch (e) {
              // fileURLToPath が失敗した場合は文字列として使用
              buildDir = dir.pathname || dir.href || "./dist";
            }
          }

          // パスの正規化
          buildDir = path.resolve(buildDir);

          console.log(`[async-css-optimizer] Build directory: ${buildDir}`);

          const htmlFiles = findHtmlFiles(buildDir);

          console.log(`[async-css-optimizer] Processing ${htmlFiles.length} HTML files...`);

          for (const htmlFile of htmlFiles) {
            let html = fs.readFileSync(htmlFile, "utf-8");
            let modified = false;

            // すべてのstylesheetリンクを収集して処理
            const stylesheetRegex = /<link([^>]*?)rel=["']stylesheet["']([^>]*?)>/gi;
            const stylesheetMatches = [];
            let match;

            // すべてのマッチを収集
            while ((match = stylesheetRegex.exec(html)) !== null) {
              const hrefMatch = match[0].match(/href=["']([^"']+)["']/);
              if (!hrefMatch) continue;

              const href = hrefMatch[1];

              // インライン化されたCSSや既に処理済みのCSSはスキップ
              if (
                href.startsWith("data:") ||
                match[0].includes('rel="preload"') ||
                match[0].includes('media="print"') ||
                match[0].includes("onload=")
              ) {
                continue;
              }

              stylesheetMatches.push({
                fullMatch: match[0],
                index: match.index,
                href: href,
              });
            }

            // 置換内容を収集（まず正順でカウント、その後逆順で置換）
            const replacements = [];
            let nonSwiperCssIndex = 0;

            // 正順で処理して、nonSwiperCssIndexをカウント
            for (let i = 0; i < stylesheetMatches.length; i++) {
              const { fullMatch, index, href } = stylesheetMatches[i];
              const normalizedHref = href.startsWith("/") ? href : `/${href}`;
              let replacement = null;

              // Swiper CSS: media="print" hack を使用
              if (href.includes("swiper")) {
                modified = true;
                replacement = `<link rel="stylesheet" href="${normalizedHref}" media="print" onload="this.media='all'" />\n<noscript><link rel="stylesheet" href="${normalizedHref}" /></noscript>`;
                replacements.push({ index, fullMatch, replacement });
              }
              // 非クリティカルなフォントの CSS: <link rel="preload"> で遅延読み込み
              // NonCriticalFonts コンポーネントの CSS を識別
              else if (
                href.includes("NonCriticalFonts") ||
                href.includes("non-critical") ||
                (href.includes("poppins") && href.includes("700")) ||
                href.includes("cinzel") ||
                href.includes("playfair") ||
                href.includes("marcellus")
              ) {
                modified = true;
                // <link rel="preload"> で遅延読み込み
                // requestIdleCallback を使用してブラウザがアイドル状態の時に読み込む
                replacement = `<link rel="preload" href="${normalizedHref}" as="style" onload="this.onload=null;this.rel='stylesheet'" />\n<noscript><link rel="stylesheet" href="${normalizedHref}" /></noscript>`;
                replacements.push({ index, fullMatch, replacement });
              }
              // コンポーネントのCSS（index.*.cssなど）: media="print" hack を使用
              // ただし、最初の2つのCSSファイル（reset.cssとglobal.cssを含む）は除外
              else if (
                (href.match(/index\.[A-Za-z0-9]+\.css/) || href.match(/_[A-Za-z0-9]+\.css/)) &&
                nonSwiperCssIndex >= 2
              ) {
                modified = true;
                // media="print" hack を使用して遅延読み込み
                replacement = `<link rel="stylesheet" href="${normalizedHref}" media="print" onload="this.media='all'" />\n<noscript><link rel="stylesheet" href="${normalizedHref}" /></noscript>`;
                replacements.push({ index, fullMatch, replacement });
              }
              // reset.css と global.css を含むCSSファイル: クリティカルCSSなので同期的に読み込む
              // HeadLayout.astroから読み込まれるCSSは通常、最初の2つ（または最初の1つにバンドルされる）
              // Swiper CSSと非クリティカルなフォントの CSS を除外した最初の2つは同期的に読み込む（変更なし）
              else {
                nonSwiperCssIndex++;
                // reset.css と global.css を含むクリティカルCSSは同期的に読み込むため、
                // 最初の2つのCSSファイルは非同期読み込みに変換しない
                // （ページ遷移時のFOUCを防ぐため）
              }
            }

            // 逆順で置換（インデックスがずれないようにするため）
            for (let i = replacements.length - 1; i >= 0; i--) {
              const { index, fullMatch, replacement } = replacements[i];
              html = html.substring(0, index) + replacement + html.substring(index + fullMatch.length);
            }

            if (modified) {
              fs.writeFileSync(htmlFile, html, "utf-8");
              console.log(`[async-css-optimizer] ✅ Optimized: ${path.relative(buildDir, htmlFile)}`);
            }
          }

          console.log(`[async-css-optimizer] ✅ CSS optimization complete!`);
        } catch (error) {
          console.error("[async-css-optimizer] ❌ Error:", error);
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
