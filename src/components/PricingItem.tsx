import type { PricingItem as PricingItemType } from '../config/pricing';
import { PAGE_COUNT_OPTIONS, ANIMATION_COUNT_OPTIONS } from '../config/pricing';
import IconifyInline from './IconifyInline';
import '../styles/pricing/PricingItem.css';

interface PricingItemButtonProps {
  item: PricingItemType;
  isSelected: boolean;
  onToggle: (itemId: string) => void;
  quantity?: number;
  selectedFunctions?: string[];
}

export function PricingItemButton({
  item,
  isSelected,
  onToggle,
  quantity,
  selectedFunctions,
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

  // iconColorOverride に対応する色置換マップ
  const COLOR_REPLACE_MAP: Record<string, Record<string, string>> = {
    // 赤 → 青（design-file-pen: #ff808c/#ffbfc5 → blue）
    blue: { '#ff808c': '#66e1ff', '#ffbfc5': '#c2f3ff' },
    // 青 → 緑（responsive-design-1: #66e1ff/#c2f3ff → green）
    green: { '#66e1ff': '#52e6a3', '#c2f3ff': '#b2f5d8' },
    // 青 → 赤（seo-search-graph: #66e1ff/#c2f3ff → red）
    red: { '#66e1ff': '#ff808c', '#c2f3ff': '#ffbfc5' },
  };

  // CSS カラーマップ（monochrome アイコン向け）
  const CSS_COLOR_MAP: Record<string, string> = {
    red: '#e53e3e',
  };

  // アイコンを表示するためのヘルパー関数
  const renderIcon = () => {
    if (item.icon === undefined) return null;
    const iconValue = String(item.icon);
    if (iconValue === '') return null;

    // mdi など monochrome アイコンは cssColor で色変更
    const isMonochrome = iconValue.startsWith('mdi:');
    const cssColor =
      isMonochrome && item.iconColorOverride !== undefined
        ? CSS_COLOR_MAP[item.iconColorOverride]
        : undefined;
    const colorReplace =
      !isMonochrome && item.iconColorOverride !== undefined
        ? COLOR_REPLACE_MAP[item.iconColorOverride]
        : undefined;

    return (
      <div className={`pricing-item__icon ${item.iconClass ?? ''}`}>
        <IconifyInline
          icon={iconValue}
          width="40"
          height="40"
          colorReplace={colorReplace}
          cssColor={cssColor}
        />
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
          {item.id === 'other-functions' && isSelected && selectedFunctions !== undefined && selectedFunctions.length > 0 && (
            <span className="pricing-item__line">{selectedFunctions.length}種選択</span>
          )}
          {item.id !== 'other-functions' && isSelected && quantity !== undefined && quantity > 0 && (
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
