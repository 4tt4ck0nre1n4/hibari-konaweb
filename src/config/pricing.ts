// 料金項目の型定義
export interface PricingItem {
  id: string;
  name: string;
  basePrice: number;
  isQuantifiable: boolean;
  category?: string;
  icon?: string;
  iconClass?: string;
}

// プランの型定義
export interface Plan {
  id: 'coding' | 'design' | 'urgent';
  name: string;
  icon?: string;
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
  { id: 'top-page', name: 'トップページ', basePrice: 30000, isQuantifiable: false, icon: 'emojione-v1:laptop-computer' },
  { id: 'sub-page', name: '下層ページ', basePrice: 5000, isQuantifiable: true, icon: 'emojione-v1:pages', iconClass: 'icon-sub-page' },
  { id: 'landing-page', name: 'ランディングページ', basePrice: 30000, isQuantifiable: false, icon: 'fxemoji:pages', iconClass: 'icon-landing' },
  { id: 'top-responsive', name: 'トップページ レスポンシブ対応', basePrice: 0, isQuantifiable: false, icon: 'flat-color-icons:smartphone-tablet', iconClass: 'icon-resp-top' },
  { id: 'sub-responsive', name: '下層ページ レスポンシブ対応', basePrice: 0, isQuantifiable: true, icon: 'flat-color-icons:smartphone-tablet', iconClass: 'icon-resp-sub' },
  { id: 'landing-responsive', name: 'ランディングページ レスポンシブ対応', basePrice: 5000, isQuantifiable: false, icon: 'flat-color-icons:smartphone-tablet', iconClass: 'icon-resp-lp' },
  { id: 'wordpress-setup', name: 'WordPress 環境構築', basePrice: 15000, isQuantifiable: false, icon: 'material-icon-theme:folder-wordpress-open' },
  { id: 'wordpress-theme', name: 'WordPress オリジナルテーマ制作', basePrice: 30000, isQuantifiable: false, icon: 'material-icon-theme:folder-wordpress-open', iconClass: 'icon-wp-theme' },
  { id: 'wordpress-custom-field', name: 'WordPress カスタムフィールド', basePrice: 10000, isQuantifiable: false, icon: 'material-icon-theme:folder-wordpress-open', iconClass: 'icon-wp-field' },
  { id: 'fade-animation', name: 'フェードインアニメーション', basePrice: 5000, isQuantifiable: true, icon: 'marketeq:log-in' },
  { id: 'slide-animation', name: 'スライドアニメーション', basePrice: 5000, isQuantifiable: true, icon: 'devicon:swiper' },
  { id: 'accordion-animation', name: 'アコーディオンアニメーション', basePrice: 5000, isQuantifiable: true, icon: 'twemoji:accordion' },
  { id: 'tab-animation', name: 'タブ切り替えアニメーション', basePrice: 5000, isQuantifiable: true, icon: 'icon-park:switch-button' },
  { id: 'other-animation', name: 'その他アニメーション', basePrice: 5000, isQuantifiable: true, icon: 'noto-v1:video-game', iconClass: 'icon-other-animation' },
  { id: 'headless-cms', name: 'ヘッドレスCMS', basePrice: 110000, isQuantifiable: false, icon: 'streamline-ultimate:coding-apps-website-web-dev-api-cloud', iconClass: 'icon-headless-cms' },
  { id: 'blog', name: 'ブログ機能', basePrice: 10000, isQuantifiable: false, icon: 'vscode-icons:file-type-libreoffice-writer' },
  { id: 'contact-form', name: 'お問い合わせ機能', basePrice: 30000, isQuantifiable: false, icon: 'fluent-emoji-flat:envelope', iconClass: 'icon-contact' },
  { id: 'news', name: 'お知らせ機能', basePrice: 10000, isQuantifiable: false, icon: 'streamline-kameleon-color:newspaper' },
];

// プラン一覧
export const PLANS: Plan[] = [
  { id: 'coding', name: 'コーディング', icon: 'streamline-color:keyboard' },
  { id: 'design', name: 'ホームページ制作', icon: 'twemoji:desktop-computer' },
  { id: 'urgent', name: '特急案件', icon: 'twemoji:woman-running-light-skin-tone' },
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

// アニメーション数量オプション
export const ANIMATION_COUNT_OPTIONS: PageCountOption[] = [
  { id: '1', label: '1', value: 1 },
  { id: '2', label: '2', value: 2 },
  { id: '3', label: '3', value: 3 },
  { id: '4', label: '4', value: 4 },
  { id: '5', label: '5', value: 5 },
  { id: '6-10', label: '6～10', value: 6 },
  { id: '10+', label: '10～', value: 10 },
  { id: 'unknown', label: '未定', value: 1 },
];
