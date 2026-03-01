import { PRICING_ITEMS, HOMEPAGE_PRICING_ITEMS, OTHER_FUNCTIONS_OPTIONS } from '../config/pricing';
import { ESTIMATE_CONFIG } from '../config/companyInfo';
import type { SelectedItem, PriceCalculation, CalculationLineItem } from '../types/pricing';

/**
 * ページ数に応じた料金を計算
 */
export function calculatePagePrice(
  basePrice: number,
  quantity: number,
  multiplier?: number
): number {
  if (multiplier === undefined || multiplier === null || multiplier <= 1) {
    return basePrice * quantity;
  }
  return Math.round(basePrice * quantity * multiplier);
}

/**
 * 選択項目リストから明細行を生成
 * コーディング項目とホームページ制作項目の両方を検索。
 * other-functions は selectedFunctions の各サブ項目を個別行として展開する。
 */
function buildLineItems(selectedItems: SelectedItem[]): CalculationLineItem[] {
  const lineItems: CalculationLineItem[] = [];

  for (const item of selectedItems) {
    // other-functions はサブ選択を個別明細行に展開
    if (item.itemId === 'other-functions' && item.selectedFunctions !== undefined) {
      for (const fnId of item.selectedFunctions) {
        const fn = OTHER_FUNCTIONS_OPTIONS.find(o => o.id === fnId);
        if (fn !== undefined) {
          lineItems.push({
            itemId: fnId,
            name: fn.name,
            quantity: 1,
            unitPrice: fn.basePrice,
            totalPrice: fn.basePrice,
          });
        }
      }
      continue;
    }

    const pricingItem =
      PRICING_ITEMS.find(p => p.id === item.itemId) ??
      HOMEPAGE_PRICING_ITEMS.find(p => p.id === item.itemId);
    const name =
      pricingItem?.name !== undefined &&
      pricingItem.name !== null &&
      pricingItem.name.trim() !== ''
        ? pricingItem.name
        : item.itemId;
    const unitPrice = item.quantity > 0 ? item.price / item.quantity : item.price;

    lineItems.push({
      itemId: item.itemId,
      name,
      quantity: item.quantity,
      unitPrice,
      totalPrice: item.price,
    });
  }

  return lineItems;
}

/**
 * コーディングとホームページ制作の両プランを合算して料金を計算
 */
export function calculatePrice(
  codingSelectedItems: SelectedItem[],
  designSelectedItems: SelectedItem[],
  isUrgent: boolean
): PriceCalculation {
  const codingItems = buildLineItems(codingSelectedItems);
  const designItems = buildLineItems(designSelectedItems);

  const codingSubtotal = codingItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const designSubtotal = designItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const subtotal = codingSubtotal + designSubtotal;

  const urgentFee = isUrgent
    ? Math.round(subtotal * ESTIMATE_CONFIG.urgentFeeRate)
    : 0;
  const subtotalWithUrgent = subtotal + urgentFee;
  const tax = Math.round(subtotalWithUrgent * ESTIMATE_CONFIG.taxRate);
  const total = subtotalWithUrgent + tax;

  return {
    codingSubtotal,
    designSubtotal,
    subtotal,
    urgentFee,
    tax,
    total,
    codingItems,
    designItems,
  };
}
