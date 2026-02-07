// プランタイプ
export type PlanType = 'coding' | 'design' | 'urgent';

// 選択された項目
export interface SelectedItem {
  itemId: string;
  quantity: number;
  price: number;
}

// 料金計算結果
export interface PriceCalculation {
  subtotal: number;
  urgentFee: number;
  tax: number;
  total: number;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
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
}

// 保存された状態
export interface SavedState {
  selectedItems: SelectedItem[];
  selectedPlan: PlanType;
  isUrgent: boolean;
}

