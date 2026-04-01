import type { PriceCalculation } from "../types/pricing";
import "../styles/pricing/EstimateSummary.css";

interface EstimateSummaryProps {
  calculation: PriceCalculation;
  isUrgent: boolean;
  activeTab: "coding" | "design";
}

function planContextHeading(activeTab: "coding" | "design", codingLineCount: number, designLineCount: number): string {
  const hasC = codingLineCount > 0;
  const hasD = designLineCount > 0;
  let name: string;
  if (hasC && hasD) name = "コーディング・ホームページ制作";
  else if (hasC) name = "コーディング";
  else if (hasD) name = "ホームページ制作";
  else name = activeTab === "design" ? "ホームページ制作" : "コーディング";
  return `選択中の項目 — ${name}プラン`;
}

export function EstimateSummary({ calculation, isUrgent, activeTab }: EstimateSummaryProps) {
  const formatPrice = (price: number): string => {
    return `¥${price.toLocaleString()}`;
  };

  const chipItems = [
    ...calculation.codingItems.map((row) => ({
      key: `c-${row.itemId}-${row.quantity}-${row.name}`,
      text: row.quantity > 1 ? `${row.name} ×${row.quantity}` : row.name,
    })),
    ...calculation.designItems.map((row) => ({
      key: `d-${row.itemId}-${row.quantity}-${row.name}`,
      text: row.quantity > 1 ? `${row.name} ×${row.quantity}` : row.name,
    })),
  ];

  const heading = planContextHeading(activeTab, calculation.codingItems.length, calculation.designItems.length);

  return (
    <div className="estimate-summary">
      <h3 className="estimate-summary__heading">{heading}</h3>
      <ul className="estimate-summary__chips" aria-label="選択中の項目一覧">
        {chipItems.length === 0 ? (
          <li className="estimate-summary__chip estimate-summary__chip--placeholder">項目がまだありません</li>
        ) : (
          chipItems.map((chip, index) => (
            <li key={`${chip.key}-${index}`} className="estimate-summary__chip">
              {chip.text}
            </li>
          ))
        )}
      </ul>
      <div className="estimate-summary__grid">
        <div className="estimate-summary__item">
          <span className="estimate-summary__label">小計</span>
          <span className="estimate-summary__value">{formatPrice(calculation.subtotal)}</span>
        </div>
        {isUrgent && calculation.urgentFee > 0 && (
          <div className="estimate-summary__item estimate-summary__item--urgent">
            <span className="estimate-summary__label">急ぎ料金（20%割増）</span>
            <span className="estimate-summary__value">{formatPrice(calculation.urgentFee)}</span>
          </div>
        )}
        <div className="estimate-summary__item">
          <span className="estimate-summary__label">消費税（10%）</span>
          <span className="estimate-summary__value">{formatPrice(calculation.tax)}</span>
        </div>
        <div className="estimate-summary__item estimate-summary__item--total">
          <span className="estimate-summary__label">合計金額（概算）</span>
          <span className="estimate-summary__value estimate-summary__value--total">
            {formatPrice(calculation.total)}
          </span>
        </div>
      </div>
      <p className="estimate-summary__note">※ この金額は概算です。正式なお見積りは別途ご案内いたします。</p>
    </div>
  );
}
