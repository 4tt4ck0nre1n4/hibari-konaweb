import type { PricingItem as PricingItemType } from '../config/pricing';
import { PAGE_COUNT_OPTIONS } from '../config/pricing';
import '../styles/pricing/PricingItem.css';

interface PricingItemButtonProps {
  item: PricingItemType;
  isSelected: boolean;
  onToggle: (itemId: string) => void;
  quantity?: number;
}

export function PricingItemButton({
  item,
  isSelected,
  onToggle,
  quantity,
}: PricingItemButtonProps) {
  // ページ数のラベルを取得
  const getPageLabel = () => {
    if (!isSelected || quantity === undefined || quantity <= 1) return null;

    const option = PAGE_COUNT_OPTIONS.find((opt) => opt.value === quantity);

    if (option) {
      // "10～19ページ" などのラベルをそのまま返す
      return option.label;
    }

    return `${quantity}ページ`;
  };

  return (
    <button
      type="button"
      className={`pricing-item ${isSelected ? 'pricing-item--selected' : ''}`}
      onClick={() => onToggle(item.id)}
      {...(isSelected ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
    >
      <div className="pricing-item__text">
        <span className="pricing-item__line">{item.name}</span>
        {isSelected && quantity !== undefined && quantity > 0 && (
          <span className="pricing-item__line">
            {getPageLabel()}
          </span>
        )}
      </div>
      {isSelected && (
        <div className="pricing-item__badge">選択中</div>
      )}
    </button>
  );
}
