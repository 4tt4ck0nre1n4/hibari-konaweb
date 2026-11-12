/**
 * IconifyInline（クライアント側のアイコン描画）用のアイコンサブセットを生成する。
 *
 * 背景:
 *   以前は IconifyInline が @iconify-json/<set>/icons.json をセットごと動的 import しており、
 *   クライアントバンドルに巨大なチャンク（fluent-emoji だけで 100MB 超）が生成されていた。
 *   その結果、ビルド時のメモリ使用量が Netlify の上限を超え、ビルドが強制終了（exit 137）していた。
 *
 * 処理:
 *   src 配下のソースから "prefix:name" 形式のアイコン名を収集し、
 *   実際に使われているアイコンだけを src/generated/iconify-subset.json に書き出す。
 *   エイリアスは解決して実体（body）として格納する。
 *
 * 使い方:
 *   node scripts/generate-icon-subset.mjs
 *   （dev / build 系の npm scripts から自動で実行される）
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(rootDir, "src");
const outFile = path.join(srcDir, "generated", "iconify-subset.json");

/** IconifyInline が対応するアイコンセット（@iconify-json/<prefix> がインストール済みであること） */
const PREFIXES = [
  "bi",
  "devicon",
  "emojione",
  "emojione-v1",
  "fa6-brands",
  "fa6-solid",
  "fxemoji",
  "flat-color-icons",
  "fluent-emoji",
  "fluent-emoji-flat",
  "fluent-emoji-high-contrast",
  "ic",
  "icon-park",
  "marketeq",
  "mdi",
  "material-icon-theme",
  "noto-v1",
  "streamline-color",
  "streamline-kameleon-color",
  "streamline-ultimate",
  "streamline-ultimate-color",
  "twemoji",
  "vscode-icons",
];

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".astro", ".json", ".md", ".mdx"]);

/** 長いプレフィックスを先に照合する（"fluent-emoji-flat" を "fluent-emoji" と誤認しないため） */
const prefixPattern = [...PREFIXES]
  .sort((a, b) => b.length - a.length)
  .map((p) => p.replace(/[-]/g, "\\-"))
  .join("|");
const ICON_NAME_RE = new RegExp(`(?<![\\w-])(${prefixPattern}):([a-z0-9]+(?:-[a-z0-9]+)*)(?![\\w-])`, "g");

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fullPath === path.dirname(outFile)) continue;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

/** エイリアスを解決してアイコンの実体を返す（rotate / flip を含むエイリアスは非対応のため null） */
function resolveIcon(iconSet, name, depth = 0) {
  if (depth > 5) return null;
  const icon = iconSet.icons?.[name];
  if (icon !== undefined) return icon;
  const alias = iconSet.aliases?.[name];
  if (alias === undefined) return null;
  if (alias.rotate !== undefined || alias.hFlip === true || alias.vFlip === true) return null;
  const parent = resolveIcon(iconSet, alias.parent, depth + 1);
  if (parent === null) return null;
  return {
    ...parent,
    ...(alias.width !== undefined ? { width: alias.width } : {}),
    ...(alias.height !== undefined ? { height: alias.height } : {}),
  };
}

// 1. ソースからアイコン名を収集
const used = new Map(); // prefix -> Set<name>
for (const file of collectFiles(srcDir)) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(ICON_NAME_RE)) {
    const [, prefix, name] = match;
    if (!used.has(prefix)) used.set(prefix, new Set());
    used.get(prefix).add(name);
  }
}

// 2. 使用アイコンだけを抽出
const subset = {};
const missing = [];
let iconCount = 0;
for (const prefix of [...used.keys()].sort()) {
  const iconSet = require(`@iconify-json/${prefix}/icons.json`);
  const icons = {};
  for (const name of [...used.get(prefix)].sort()) {
    const icon = resolveIcon(iconSet, name);
    if (icon === null) {
      missing.push(`${prefix}:${name}`);
      continue;
    }
    icons[name] = icon;
    iconCount += 1;
  }
  if (Object.keys(icons).length === 0) continue;
  subset[prefix] = {
    prefix,
    ...(iconSet.width !== undefined ? { width: iconSet.width } : {}),
    ...(iconSet.height !== undefined ? { height: iconSet.height } : {}),
    icons,
  };
}

// 3. 書き出し（内容が同じなら書き換えない）
const output = `${JSON.stringify(subset, null, 2)}\n`;
mkdirSync(path.dirname(outFile), { recursive: true });
let previous = "";
try {
  previous = readFileSync(outFile, "utf8");
} catch {
  // 初回生成
}
if (previous !== output) {
  writeFileSync(outFile, output);
}

const sizeKb = (Buffer.byteLength(output) / 1024).toFixed(1);
console.log(
  `✅ Icon subset: ${iconCount} icons from ${Object.keys(subset).length} sets (${sizeKb} KB) -> ${path.relative(rootDir, outFile)}`
);
if (missing.length > 0) {
  // 文字列の一部がアイコン名の形に一致しただけの場合もあるため、警告に留める
  console.warn(`⚠️  Not found in icon sets (ignored): ${missing.join(", ")}`);
}
