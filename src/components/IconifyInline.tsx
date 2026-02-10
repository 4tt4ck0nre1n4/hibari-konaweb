import type { ReactElement } from "react";
import { useState, useEffect, useMemo, memo } from "react";

// アイコンセットを動的インポートで遅延読み込み（クリティカルパスを短縮）
// 文字列指定の @iconify/react は外部（api.iconify.design）フェッチが発生し得るため避ける

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

// アイコンセットのキャッシュ（一度読み込んだら再利用）
const iconSetCache = new Map<string, IconifyIconsJSON>();

// アイコンセットを動的に読み込む関数
const loadIconSet = async (prefix: string): Promise<IconifyIconsJSON | null> => {
  // キャッシュをチェック
  if (iconSetCache.has(prefix)) {
    return iconSetCache.get(prefix) ?? null;
  }

  try {
    let iconSet: IconifyIconsJSON | null = null;

    // 必要なアイコンセットのみを動的インポート
    switch (prefix) {
      case "bi":
        iconSet = (await import("@iconify-json/bi/icons.json")).default as IconifyIconsJSON;
        break;
      case "devicon":
        iconSet = (await import("@iconify-json/devicon/icons.json")).default as IconifyIconsJSON;
        break;
      case "fa6-solid":
        iconSet = (await import("@iconify-json/fa6-solid/icons.json")).default as IconifyIconsJSON;
        break;
      case "fxemoji":
        iconSet = (await import("@iconify-json/fxemoji/icons.json")).default as IconifyIconsJSON;
        break;
      case "flat-color-icons":
        iconSet = (await import("@iconify-json/flat-color-icons/icons.json")).default as IconifyIconsJSON;
        break;
      case "fluent-emoji":
        iconSet = (await import("@iconify-json/fluent-emoji/icons.json")).default as IconifyIconsJSON;
        break;
      case "fluent-emoji-flat":
        iconSet = (await import("@iconify-json/fluent-emoji-flat/icons.json")).default as IconifyIconsJSON;
        break;
      case "fluent-emoji-high-contrast":
        iconSet = (await import("@iconify-json/fluent-emoji-high-contrast/icons.json")).default as IconifyIconsJSON;
        break;
      case "ic":
        iconSet = (await import("@iconify-json/ic/icons.json")).default as IconifyIconsJSON;
        break;
      case "streamline-ultimate-color":
        iconSet = (await import("@iconify-json/streamline-ultimate-color/icons.json")).default as IconifyIconsJSON;
        break;
      case "twemoji":
        iconSet = (await import("@iconify-json/twemoji/icons.json")).default as IconifyIconsJSON;
        break;
      case "vscode-icons":
        iconSet = (await import("@iconify-json/vscode-icons/icons.json")).default as IconifyIconsJSON;
        break;
      default:
        return null;
    }

    if (iconSet !== null) {
      iconSetCache.set(prefix, iconSet);
    }

    return iconSet;
  } catch (error) {
    // 本番環境ではエラーログを抑制（PageSpeed Insightsのエラーを防ぐ）
    // 開発環境でのみログを出力
    if (typeof window !== "undefined") {
      const isDev = (window as Window & { __DEV__?: boolean }).__DEV__;
      if (isDev === true) {
        console.warn(`Failed to load icon set: ${prefix}`, error);
      }
    }
    return null;
  }
};

// メインスレッド処理の最適化: parseIconNameをメモ化（同じアイコン名の再計算を避ける）
const parseIconNameCache = new Map<string, { prefix: string; name: string } | null>();

function parseIconName(icon: string): { prefix: string; name: string } | null {
  // キャッシュをチェック
  if (parseIconNameCache.has(icon)) {
    return parseIconNameCache.get(icon) ?? null;
  }

  const trimmed = icon.trim();
  if (trimmed === "") {
    parseIconNameCache.set(icon, null);
    return null;
  }
  const idx = trimmed.indexOf(":");
  if (idx <= 0 || idx === trimmed.length - 1) {
    parseIconNameCache.set(icon, null);
    return null;
  }
  const result = { prefix: trimmed.slice(0, idx), name: trimmed.slice(idx + 1) };
  parseIconNameCache.set(icon, result);
  return result;
}

export type IconifyInlineProps = {
  icon: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  "aria-hidden"?: boolean;
  title?: string;
};

function IconifyInlineComponent({
  icon,
  width,
  height,
  className,
  title,
  "aria-hidden": ariaHidden = true,
}: IconifyInlineProps): ReactElement | null {
  const [iconData, setIconData] = useState<IconifyIcon | null>(null);
  const [iconSet, setIconSet] = useState<IconifyIconsJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // メインスレッド処理の最適化: parseIconNameの結果をメモ化
  const parsed = useMemo(() => parseIconName(icon), [icon]);

  useEffect(() => {
    if (!parsed) {
      setIsLoading(false);
      return;
    }

    // アイコンはユーザーに見える重要な要素のため、即座に読み込む
    // 優先度を上げるため、Promise.resolve()で即座に実行
    void Promise.resolve()
      .then(() => loadIconSet(parsed.prefix))
      .then((set) => {
        if (set) {
          setIconSet(set);
          const data = set.icons[parsed.name];
          setIconData(data ?? null);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        // デバッグ用: エラーをログに出力
        if (typeof window !== "undefined") {
          const isDev = (window as Window & { __DEV__?: boolean }).__DEV__;
          if (isDev === true) {
            console.error(`Failed to load icon: ${icon}`, error);
          }
        }
        setIsLoading(false);
      });
  }, [icon, parsed]);

  if (!parsed || isLoading || !iconSet || !iconData) {
    // ローディング中は空のSVGを返す（レイアウトシフトを防ぐ）
    // デバッグ用: 開発環境でのみログを出力
    if (typeof window !== "undefined") {
      const isDev = (window as Window & { __DEV__?: boolean }).__DEV__;
      if (isDev === true) {
        console.log(`IconifyInline loading: icon=${icon}, parsed=${Boolean(parsed)}, isLoading=${isLoading}, iconSet=${Boolean(iconSet)}, iconData=${Boolean(iconData)}`);
      }
    }
    const placeholderProps: React.SVGProps<SVGSVGElement> = {
      className,
      width,
      height,
      viewBox: "0 0 16 16",
      xmlns: "http://www.w3.org/2000/svg",
      role: "presentation",
      focusable: "false",
    };

    if (ariaHidden) {
      placeholderProps["aria-hidden"] = "true";
    }

    return <svg {...placeholderProps} />;
  }

  const vbW = iconData.width ?? iconSet.width ?? 16;
  const vbH = iconData.height ?? iconSet.height ?? 16;

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

// メインスレッド処理の最適化: React.memoでコンポーネントをメモ化（不要な再レンダリングを防止）
const IconifyInline = memo(IconifyInlineComponent);

export default IconifyInline;
