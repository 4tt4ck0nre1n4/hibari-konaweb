import { Icon } from "@iconify/react";

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

  const isSvgAsset =
    typeof snsIconSvg === "string" &&
    snsIconSvg.trim() !== "" &&
    (snsIconSvg.endsWith(".svg") || snsIconSvg.startsWith("/") || snsIconSvg.startsWith("."));

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
          <img
            src={snsIconSvg}
            width={snsIconWidth}
            height={snsIconHeight}
            alt={snsIconName ?? ""}
            loading="lazy"
            decoding="async"
            aria-hidden={snsIconName == null}
            data-sns-icon={snsIconSvg}
          />
        ) : (
          <Icon icon={snsIconSvg ?? ""} width={snsIconWidth} height={snsIconHeight} />
        )}
        {snsIconName && <span className="sns-icon__name">{snsIconName}</span>}
      </a>
    </li>
  );
};

export default SnsLink;
