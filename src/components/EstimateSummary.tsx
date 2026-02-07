import type { PriceCalculation } from '../types/pricing';
import '../styles/pricing/EstimateSummary.css';

interface EstimateSummaryProps {
  calculation: PriceCalculation;
  isUrgent: boolean;
}

export function EstimateSummary({ calculation, isUrgent }: EstimateSummaryProps) {
  const formatPrice = (price: number): string => {
    return `¥${price.toLocaleString()}`;
  };

  return (
    <div className="estimate-summary">
      <h3 className="estimate-summary__title">お見積り金額</h3>
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
          <span className="estimate-summary__label">合計金額</span>
          <span className="estimate-summary__value estimate-summary__value--total">
            {formatPrice(calculation.total)}
          </span>
        </div>
      </div>
      <p className="estimate-summary__note">
        ※ この金額は概算です。正式なお見積りは別途ご案内いたします。
      </p>
    </div>
  );
}
