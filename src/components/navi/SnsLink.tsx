import type { ComponentType } from "react";
import { useEffect, useState, useMemo, memo } from "react";
import type { IconifyInlineProps } from "@/components/ui/IconifyInline";

export interface SnsLinkProps {
  itemClassName?: string;
  linkClassName?: string;
  href: string;
  snsIconSvg?: string;
  /** ダークモード時に差し替えるSVGアセット（公式ロゴの白版など） */
  snsIconDarkSvg?: string;
  snsIconName?: string;
  ariaLabel: string;
  ariaTitle: string;
  targetBlank?: string;
}

const SnsLink = ({
  itemClassName = "sns-icon__item",
  linkClassName = "sns-icon__link",
  href,
  snsIconSvg,
  snsIconDarkSvg,
  snsIconName,
  ariaLabel,
  ariaTitle,
  targetBlank,
}: SnsLinkProps) => {
  const snsIconWidth = 28;
  const snsIconHeight = 28;
  const [IconifyInline, setIconifyInline] = useState<ComponentType<IconifyInlineProps> | null>(null);

  // メインスレッド処理の最適化: useMemoでメモ化（不要な再計算を防止）
  const isSvgAsset = useMemo(
    () =>
      typeof snsIconSvg === "string" &&
      snsIconSvg.trim() !== "" &&
      (snsIconSvg.endsWith(".svg") || snsIconSvg.startsWith("/") || snsIconSvg.startsWith(".")),
    [snsIconSvg]
  );

  const hasDarkVariant = isSvgAsset && typeof snsIconDarkSvg === "string" && snsIconDarkSvg.trim() !== "";
  const imgClassName = hasDarkVariant ? "sns-icon__img sns-icon__img--light" : "sns-icon__img";

  const hasIconName = useMemo(() => snsIconName != null && snsIconName.trim() !== "", [snsIconName]);

  // ネットワーク依存関係ツリー最適化: アイコンがSVGアセットでない場合のみ、IconifyInlineを遅延ロード
  useEffect(() => {
    if (isSvgAsset) return;
    if (IconifyInline) return;
    if (typeof snsIconSvg !== "string" || snsIconSvg.trim() === "") return;

    // クリティカルパスをブロックしないように、アイコン読み込みを非同期で実行
    const loadIconify = () => {
      import("@/components/ui/IconifyInline")
        .then((mod) => {
          setIconifyInline(() => mod.default);
        })
        .catch(() => {
          // 失敗時はアイコン無しで表示（リンク自体は機能させる）
          setIconifyInline(null);
        });
    };

    // requestIdleCallbackで遅延読み込み（クリティカルパスをブロックしない）
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadIconify, { timeout: 3000 });
    } else {
      // フォールバック: setTimeoutで遅延読み込み
      setTimeout(loadIconify, 200);
    }
  }, [IconifyInline, isSvgAsset, snsIconSvg]);

  return (
    <li className={itemClassName}>
      <a
        className={linkClassName}
        href={href}
        {...(targetBlank === "_blank" ? { target: "_blank" as const, rel: "noopener noreferrer" } : {})}
        aria-label={ariaLabel}
        title={ariaTitle}
      >
        {isSvgAsset ? (
          hasIconName ? (
            <img
              src={snsIconSvg}
              width={snsIconWidth}
              height={snsIconHeight}
              alt={snsIconName ?? ""}
              loading="lazy"
              decoding="async"
              data-sns-icon={snsIconSvg}
              className={imgClassName}
            />
          ) : (
            <img
              src={snsIconSvg}
              width={snsIconWidth}
              height={snsIconHeight}
              alt={snsIconName ?? ""}
              loading="lazy"
              decoding="async"
              aria-hidden="true"
              data-sns-icon={snsIconSvg}
              className={imgClassName}
            />
          )
        ) : IconifyInline ? (
          <IconifyInline icon={snsIconSvg ?? ""} width={snsIconWidth} height={snsIconHeight} aria-hidden />
        ) : null}
        {hasDarkVariant ? (
          <img
            src={snsIconDarkSvg}
            width={snsIconWidth}
            height={snsIconHeight}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="sns-icon__img sns-icon__img--dark"
          />
        ) : null}
        {hasIconName ? <span className="sns-icon__name">{snsIconName}</span> : null}
      </a>
    </li>
  );
};

// メインスレッド処理の最適化: React.memoでコンポーネントをメモ化
const SnsLinkMemoized = memo(SnsLink);

export default SnsLinkMemoized;
