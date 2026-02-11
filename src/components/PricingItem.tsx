import type { PricingItem as PricingItemType } from '../config/pricing';
import { PAGE_COUNT_OPTIONS, ANIMATION_COUNT_OPTIONS } from '../config/pricing';
import IconifyInline from './IconifyInline';
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
  // アニメーション項目かどうか判定
  const isAnimation = item.id.includes('-animation');

  // 数量ラベルを取得
  const getQuantityLabel = () => {
    if (!isSelected || quantity === undefined || quantity <= 1) return null;

    // アニメーション項目の場合は「×N」形式で表示
    if (isAnimation) {
      const option = ANIMATION_COUNT_OPTIONS.find((opt) => opt.value === quantity);
      if (option) {
        return `×${option.label}`;
      }
      return `×${quantity}`;
    }

    // ページ項目の場合は従来通り
    const option = PAGE_COUNT_OPTIONS.find((opt) => opt.value === quantity);
    if (option) {
      return option.label;
    }
    return `${quantity}ページ`;
  };

  // アイコンを表示するためのヘルパー関数
  const renderIcon = () => {
    if (item.icon === undefined) return null;
    const iconValue = String(item.icon);
    if (iconValue === '') return null;
    return (
      <div className={`pricing-item__icon ${item.iconClass ?? ''}`}>
        <IconifyInline icon={iconValue} width="40" height="40" />
      </div>
    );
  };

  return (
    <button
      type="button"
      className={`pricing-item ${isSelected ? 'pricing-item--selected' : ''}`}
      onClick={() => onToggle(item.id)}
      {...(isSelected ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
    >
      <div className="pricing-item__content">
        {renderIcon()}
        <div className="pricing-item__text">
          <span className="pricing-item__line">{item.name}</span>
          {isSelected && quantity !== undefined && quantity > 0 && (
            <span className="pricing-item__line">
              {getQuantityLabel()}
            </span>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="pricing-item__badge">選択中</div>
      )}
    </button>
  );
}
