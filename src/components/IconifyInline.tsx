import type { ReactElement } from "react";

// アイコンセット（必要なものだけ）をローカルJSONから読み込み
// 文字列指定の @iconify/react は外部（api.iconify.design）フェッチが発生し得るため避ける
import bi from "@iconify-json/bi/icons.json";
import devicon from "@iconify-json/devicon/icons.json";
import fa6solid from "@iconify-json/fa6-solid/icons.json";
import flatColorIcons from "@iconify-json/flat-color-icons/icons.json";
import fluentEmojiFlat from "@iconify-json/fluent-emoji-flat/icons.json";
import ic from "@iconify-json/ic/icons.json";
import streamlineUltimateColor from "@iconify-json/streamline-ultimate-color/icons.json";
import twemoji from "@iconify-json/twemoji/icons.json";
import vscodeIcons from "@iconify-json/vscode-icons/icons.json";

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

const ICON_SETS: Record<string, IconifyIconsJSON> = {
  [bi.prefix]: bi as unknown as IconifyIconsJSON,
  [devicon.prefix]: devicon as unknown as IconifyIconsJSON,
  [fa6solid.prefix]: fa6solid as unknown as IconifyIconsJSON,
  [flatColorIcons.prefix]: flatColorIcons as unknown as IconifyIconsJSON,
  [fluentEmojiFlat.prefix]: fluentEmojiFlat as unknown as IconifyIconsJSON,
  [ic.prefix]: ic as unknown as IconifyIconsJSON,
  [streamlineUltimateColor.prefix]: streamlineUltimateColor as unknown as IconifyIconsJSON,
  [twemoji.prefix]: twemoji as unknown as IconifyIconsJSON,
  [vscodeIcons.prefix]: vscodeIcons as unknown as IconifyIconsJSON,
};

function parseIconName(icon: string): { prefix: string; name: string } | null {
  const trimmed = icon.trim();
  if (!trimmed) return null;
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

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${vbW} ${vbH}`}
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={ariaHidden}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: iconData.body }}
    />
  );
}
