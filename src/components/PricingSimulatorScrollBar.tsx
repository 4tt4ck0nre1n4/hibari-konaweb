import { useEffect, useRef, useState } from "react";

const SCROLL_REVEAL_PX = 120;
const FLASH_MS = 550;

export interface PricingSimulatorScrollBarProps {
  activePlanLabel: string;
  selectedCount: number;
  totalInclTax: number;
  summarySectionId: string;
}

export function PricingSimulatorScrollBar({
  activePlanLabel,
  selectedCount,
  totalInclTax,
  summarySectionId,
}: PricingSimulatorScrollBarProps) {
  const [revealed, setRevealed] = useState(false);
  const [priceFlash, setPriceFlash] = useState(false);
  const prevTotalRef = useRef<number | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setRevealed(window.scrollY > SCROLL_REVEAL_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = totalInclTax;
    if (prev === null) return;
    if (prev === totalInclTax) return;
    if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
    setPriceFlash(true);
    flashTimerRef.current = setTimeout(() => {
      setPriceFlash(false);
      flashTimerRef.current = null;
    }, FLASH_MS);
  }, [totalInclTax]);

  const formatPrice = (n: number) => `¥${n.toLocaleString()}`;

  const scrollToSummary = () => {
    const el = document.getElementById(summarySectionId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`pricing-simulator-scroll-bar${revealed ? " pricing-simulator-scroll-bar--visible" : ""}`}
      role="region"
      aria-label="料金の概要"
    >
      <div className="pricing-simulator-scroll-bar__inner">
        <div className="pricing-simulator-scroll-bar__col pricing-simulator-scroll-bar__col--plan">
          <span className="pricing-simulator-scroll-bar__label">プラン</span>
          <span className="pricing-simulator-scroll-bar__plan-pill">{activePlanLabel}</span>
        </div>
        <div className="pricing-simulator-scroll-bar__divider" aria-hidden="true" />
        <div className="pricing-simulator-scroll-bar__col pricing-simulator-scroll-bar__col--count">
          <span className="pricing-simulator-scroll-bar__label">選択</span>
          <span className="pricing-simulator-scroll-bar__count">選択中 {selectedCount}件</span>
        </div>
        <div className="pricing-simulator-scroll-bar__divider" aria-hidden="true" />
        <div className="pricing-simulator-scroll-bar__col pricing-simulator-scroll-bar__col--price">
          <span className="pricing-simulator-scroll-bar__label">概算</span>
          <span className="pricing-simulator-scroll-bar__price-row">
            <span
              className={`pricing-simulator-scroll-bar__amount${priceFlash ? " pricing-simulator-scroll-bar__amount--flash" : ""}`}
            >
              {formatPrice(totalInclTax)}
            </span>
            <span className="pricing-simulator-scroll-bar__tax-note">(税込)</span>
          </span>
        </div>
        <div className="pricing-simulator-scroll-bar__divider pricing-simulator-scroll-bar__divider--before-cta" aria-hidden="true" />
        <div className="pricing-simulator-scroll-bar__col pricing-simulator-scroll-bar__col--cta">
          <button
            type="button"
            className={`pricing-simulator-scroll-bar__cta${selectedCount === 0 ? " pricing-simulator-scroll-bar__cta--muted" : ""}`}
            onClick={scrollToSummary}
          >
            見積書を作成 →
          </button>
        </div>
      </div>
    </div>
  );
}
