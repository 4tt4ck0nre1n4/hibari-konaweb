import { PRICING_ITEMS } from '../config/pricing';
import { ESTIMATE_CONFIG } from '../config/companyInfo';
import type { SelectedItem, PriceCalculation } from '../types/pricing';

/**
 * ページ数に応じた料金を計算
 */
export function calculatePagePrice(
  basePrice: number,
  quantity: number,
  multiplier?: number
): number {
  if (!multiplier || multiplier <= 1) {
    return basePrice * quantity;
  }
  return Math.round(basePrice * quantity * multiplier);
}

/**
 * 選択された項目から料金を計算
 */
export function calculatePrice(
  selectedItems: SelectedItem[],
  isUrgent: boolean
): PriceCalculation {
  const items = selectedItems.map(item => {
    const pricingItem = PRICING_ITEMS.find(p => p.id === item.itemId);
    const name = pricingItem?.name || item.itemId;
    const unitPrice = item.price / item.quantity;

    return {
      itemId: item.itemId,
      name,
      quantity: item.quantity,
      unitPrice,
      totalPrice: item.price,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const urgentFee = isUrgent
    ? Math.round(subtotal * ESTIMATE_CONFIG.urgentFeeRate)
    : 0;
  const subtotalWithUrgent = subtotal + urgentFee;
  const tax = Math.round(subtotalWithUrgent * ESTIMATE_CONFIG.taxRate);
  const total = subtotalWithUrgent + tax;

  return {
    subtotal,
    urgentFee,
    tax,
    total,
    items,
  };
}

