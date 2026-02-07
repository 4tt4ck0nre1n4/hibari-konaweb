// 料金項目の型定義
export interface PricingItem {
  id: string;
  name: string;
  basePrice: number;
  isQuantifiable: boolean;
  category?: string;
}

// プランの型定義
export interface Plan {
  id: 'coding' | 'design' | 'urgent';
  name: string;
}

// ページ数オプションの型定義
export interface PageCountOption {
  id: string;
  label: string;
  value: number;
  multiplier?: number;
}

// 料金項目一覧
export const PRICING_ITEMS: PricingItem[] = [
  { id: 'top-page', name: 'トップページ', basePrice: 30000, isQuantifiable: false },
  { id: 'sub-page', name: '下層ページ', basePrice: 5000, isQuantifiable: true },
  { id: 'landing-page', name: 'ランディングページ', basePrice: 30000, isQuantifiable: false },
  { id: 'top-responsive', name: 'トップページ レスポンシブ対応', basePrice: 5000, isQuantifiable: false },
  { id: 'sub-responsive', name: '下層ページ レスポンシブ対応', basePrice: 3000, isQuantifiable: true },
  { id: 'landing-responsive', name: 'ランディングページ レスポンシブ対応', basePrice: 5000, isQuantifiable: false },
  { id: 'wordpress-setup', name: 'WordPress 環境構築', basePrice: 55000, isQuantifiable: false },
  { id: 'wordpress-theme', name: 'WordPress オリジナルテーマ制作', basePrice: 110000, isQuantifiable: false },
  { id: 'wordpress-custom-field', name: 'WordPress カスタムフィールド', basePrice: 33000, isQuantifiable: false },
  { id: 'slide-animation', name: 'スライドアニメーション', basePrice: 55000, isQuantifiable: false },
  { id: 'accordion-animation', name: 'アコーディオンアニメーション', basePrice: 33000, isQuantifiable: false },
  { id: 'fade-animation', name: 'フェードインアウトアニメーション', basePrice: 33000, isQuantifiable: false },
  { id: 'tab-animation', name: 'タブ切り替えアニメーション', basePrice: 33000, isQuantifiable: false },
  { id: 'other-animation', name: 'その他アニメーション', basePrice: 55000, isQuantifiable: false },
  { id: 'headless-cms', name: 'ヘッドレスCMS', basePrice: 110000, isQuantifiable: false },
  { id: 'contact-form', name: 'お問い合わせ機能', basePrice: 55000, isQuantifiable: false },
  { id: 'blog', name: 'ブログ機能', basePrice: 55000, isQuantifiable: false },
  { id: 'news', name: 'お知らせ機能', basePrice: 33000, isQuantifiable: false },
];

// プラン一覧
export const PLANS: Plan[] = [
  { id: 'coding', name: 'コーディング' },
  { id: 'design', name: 'ホームページ制作' },
  { id: 'urgent', name: '特急案件' },
];

// ページ数オプション
export const PAGE_COUNT_OPTIONS: PageCountOption[] = [
  { id: '1', label: '1ページ', value: 1 },
  { id: '2', label: '2ページ', value: 2 },
  { id: '3', label: '3ページ', value: 3 },
  { id: '4', label: '4ページ', value: 4 },
  { id: '5', label: '5ページ', value: 5 },
  { id: '6', label: '6ページ', value: 6 },
  { id: '7', label: '7ページ', value: 7 },
  { id: '8', label: '8ページ', value: 8 },
  { id: '9', label: '9ページ', value: 9 },
  { id: '10-19', label: '10～19ページ', value: 10, multiplier: 1.1 },
  { id: '20-50', label: '20～50ページ', value: 20, multiplier: 1.25 },
  { id: '50+', label: '50ページ～', value: 50, multiplier: 1.5 },
  { id: 'unknown', label: 'わからない', value: 1 },
];
