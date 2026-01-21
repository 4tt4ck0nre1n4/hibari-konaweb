import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import type { IconifyInlineProps } from "./IconifyInline";

export interface SnsLinkProps {
  itemClassName?: string;
  linkClassName?: string;
  href: string;
  snsIconSvg?: string;
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
  snsIconName,
  ariaLabel,
  ariaTitle,
  targetBlank,
}: SnsLinkProps) => {
  const snsIconWidth = 28;
  const snsIconHeight = 28;
  const [IconifyInline, setIconifyInline] = useState<ComponentType<IconifyInlineProps> | null>(null);

  const isSvgAsset =
    typeof snsIconSvg === "string" &&
    snsIconSvg.trim() !== "" &&
    (snsIconSvg.endsWith(".svg") || snsIconSvg.startsWith("/") || snsIconSvg.startsWith("."));

  const hasIconName = snsIconName != null && snsIconName.trim() !== "";

  // アイコンがSVGアセットでない場合のみ、IconifyInlineを遅延ロード
  useEffect(() => {
    if (isSvgAsset) return;
    if (IconifyInline) return;
    if (typeof snsIconSvg !== "string" || snsIconSvg.trim() === "") return;

    void import("./IconifyInline")
      .then((mod) => {
        setIconifyInline(() => mod.default);
      })
      .catch(() => {
        // 失敗時はアイコン無しで表示（リンク自体は機能させる）
        setIconifyInline(null);
      });
  }, [IconifyInline, isSvgAsset, snsIconSvg]);

  return (
    <li className={itemClassName}>
      <a
        className={linkClassName}
        href={href}
        target={targetBlank}
        rel={targetBlank === "_blank" ? "noopener noreferrer" : undefined}
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
            />
          )
        ) : (
          IconifyInline ? (
            <IconifyInline icon={snsIconSvg ?? ""} width={snsIconWidth} height={snsIconHeight} aria-hidden />
          ) : null
        )}
        {hasIconName ? <span className="sns-icon__name">{snsIconName}</span> : null}
      </a>
    </li>
  );
};

export default SnsLink;
