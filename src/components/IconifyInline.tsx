import type { ReactElement } from "react";

// アイコンセット（必要なものだけ）をローカルJSONから読み込み
// 文字列指定の @iconify/react は外部（api.iconify.design）フェッチが発生し得るため避ける
import biRaw from "@iconify-json/bi/icons.json";
import deviconRaw from "@iconify-json/devicon/icons.json";
import fa6solidRaw from "@iconify-json/fa6-solid/icons.json";
import flatColorIconsRaw from "@iconify-json/flat-color-icons/icons.json";
import fluentEmojiRaw from "@iconify-json/fluent-emoji/icons.json";
import fluentEmojiFlatRaw from "@iconify-json/fluent-emoji-flat/icons.json";
import fluentEmojiHighContrastRaw from "@iconify-json/fluent-emoji-high-contrast/icons.json";
import icRaw from "@iconify-json/ic/icons.json";
import streamlineUltimateColorRaw from "@iconify-json/streamline-ultimate-color/icons.json";
import twemojiRaw from "@iconify-json/twemoji/icons.json";
import vscodeIconsRaw from "@iconify-json/vscode-icons/icons.json";

type IconifyIcon = {
  body: string;
  width?: number;
  height?: number;
};

type IconifyIconsJSON = {
  prefix: string;
  width?: number;
  height?: number;
  icons: Record<string, IconifyIcon>;
  // aliases 等は必要になったら対応（現状利用アイコンは icons の直指定想定）
};

// JSONインポートの型を明示的に指定
const bi = biRaw as IconifyIconsJSON;
const devicon = deviconRaw as IconifyIconsJSON;
const fa6solid = fa6solidRaw as IconifyIconsJSON;
const flatColorIcons = flatColorIconsRaw as IconifyIconsJSON;
const fluentEmoji = fluentEmojiRaw as IconifyIconsJSON;
const fluentEmojiFlat = fluentEmojiFlatRaw as IconifyIconsJSON;
const fluentEmojiHighContrast = fluentEmojiHighContrastRaw as IconifyIconsJSON;
const ic = icRaw as IconifyIconsJSON;
const streamlineUltimateColor = streamlineUltimateColorRaw as IconifyIconsJSON;
const twemoji = twemojiRaw as IconifyIconsJSON;
const vscodeIcons = vscodeIconsRaw as IconifyIconsJSON;

const ICON_SETS: Record<string, IconifyIconsJSON> = {
  [bi.prefix]: bi,
  [devicon.prefix]: devicon,
  [fa6solid.prefix]: fa6solid,
  [flatColorIcons.prefix]: flatColorIcons,
  [fluentEmoji.prefix]: fluentEmoji,
  [fluentEmojiFlat.prefix]: fluentEmojiFlat,
  [fluentEmojiHighContrast.prefix]: fluentEmojiHighContrast,
  [ic.prefix]: ic,
  [streamlineUltimateColor.prefix]: streamlineUltimateColor,
  [twemoji.prefix]: twemoji,
  [vscodeIcons.prefix]: vscodeIcons,
};

function parseIconName(icon: string): { prefix: string; name: string } | null {
  const trimmed = icon.trim();
  if (trimmed === "") return null;
  const idx = trimmed.indexOf(":");
  if (idx <= 0 || idx === trimmed.length - 1) return null;
  return { prefix: trimmed.slice(0, idx), name: trimmed.slice(idx + 1) };
}

export type IconifyInlineProps = {
  icon: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  "aria-hidden"?: boolean;
  title?: string;
};

export default function IconifyInline({
  icon,
  width,
  height,
  className,
  title,
  "aria-hidden": ariaHidden = true,
}: IconifyInlineProps): ReactElement | null {
  const parsed = parseIconName(icon);
  if (!parsed) return null;

  const set = ICON_SETS[parsed.prefix];
  if (!set) return null;

  const iconData = set.icons[parsed.name];
  if (!iconData) return null;

  const vbW = iconData.width ?? set.width ?? 16;
  const vbH = iconData.height ?? set.height ?? 16;

  // titleがある場合はimgロール、ない場合はpresentationロール
  const hasTitle = title != null && title !== "";

  // ARIA属性を条件分岐で設定（ESLintのjsx-a11y-strictルール対応）
  // aria-hiddenは条件付きで設定（trueの場合のみ）
  const svgProps: React.SVGProps<SVGSVGElement> = {
    className,
    width,
    height,
    viewBox: `0 0 ${vbW} ${vbH}`,
    xmlns: "http://www.w3.org/2000/svg",
    role: hasTitle ? "img" : "presentation",
    focusable: "false",
    dangerouslySetInnerHTML: { __html: iconData.body },
  };

  // aria-hiddenはtrueの場合のみ設定（falseの場合は属性を省略）
  if (ariaHidden) {
    svgProps["aria-hidden"] = "true";
  }

  return <svg {...svgProps} />;
}
