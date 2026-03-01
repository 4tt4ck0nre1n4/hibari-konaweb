// プランタイプ
export type PlanType = 'coding' | 'design' | 'urgent';

// 選択された項目
export interface SelectedItem {
  itemId: string;
  quantity: number;
  price: number;
  selectedFunctions?: string[]; // 'other-functions' 項目のサブ選択 ID リスト
}

// 明細行
export interface CalculationLineItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// 料金計算結果（両プラン対応）
export interface PriceCalculation {
  codingSubtotal: number;
  designSubtotal: number;
  subtotal: number;
  urgentFee: number;
  tax: number;
  total: number;
  codingItems: CalculationLineItem[];
  designItems: CalculationLineItem[];
}

// 見積書データ
export interface EstimateData {
  estimateNumber: string;
  issueDate: string;
  expiryDate: string;
  subject: string;
  calculation: PriceCalculation;
  isUrgent: boolean;
  selectedPlan: PlanType;
  hasCodingItems: boolean;
  hasDesignItems: boolean;
}

// 保存された状態（後方互換フィールド含む）
export interface SavedState {
  codingItems: SelectedItem[];
  designItems: SelectedItem[];
  selectedPlan: PlanType;
  isUrgent: boolean;
}
