// その他の機能 サブ項目の型定義
export interface FunctionOption {
  id: string;
  name: string;
  basePrice: number;
}

// その他の機能 サブ項目一覧（金額はモーダルに表記しない）
export const OTHER_FUNCTIONS_OPTIONS: FunctionOption[] = [
  { id: 'search',      name: '検索機能', basePrice: 10000 },
  { id: 'reservation', name: '予約機能', basePrice: 10000 },
  { id: 'payment',     name: '決済機能', basePrice: 30000 },
];

// 料金項目の型定義
export interface PricingItem {
  id: string;
  name: string;
  basePrice: number;
  isQuantifiable: boolean;
  category?: string;
  icon?: string;
  iconClass?: string;
  iconColorOverride?: string;
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
  { id: 'other-functions', name: 'その他の機能', basePrice: 0, isQuantifiable: false, icon: 'streamline-kameleon-color:windows-coding-duo' },
  { id: 'update', name: 'サイト更新・修正業務', basePrice: 5000, isQuantifiable: false, icon: 'material-icon-theme:folder-update-open' },
  { id: 'maintenance', name: 'サイト運用・保守業務', basePrice: 5000, isQuantifiable: false, icon: 'mdi:progress-wrench', iconClass: 'icon-maintenance' },
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

// ホームページ制作プラン 料金項目一覧
export const HOMEPAGE_PRICING_ITEMS: PricingItem[] = [
  {
    id: 'site-design',
    name: 'サイト設計',
    basePrice: 30000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:website-build',
  },
  {
    id: 'wire-frame',
    name: 'ワイヤーフレーム作成',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'fxemoji:framewithtiles',
  },
  {
    id: 'site-map',
    name: 'サイトマップ作成',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:hierarchy-5',
  },
  {
    id: 'top-design',
    name: 'トップページデザイン',
    basePrice: 30000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:design-file-pen',
    iconColorOverride: 'blue',
  },
  {
    id: 'top-design-responsive',
    name: 'トップページレスポンシブ対応デザイン',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:responsive-design-1',
    iconColorOverride: 'green',
  },
  {
    id: 'sub-design',
    name: '下層ページデザイン',
    basePrice: 10000,
    isQuantifiable: true,
    icon: 'streamline-ultimate-color:design-file-pen',
  },
  {
    id: 'sub-design-responsive',
    name: '下層ページレスポンシブ対応デザイン',
    basePrice: 5000,
    isQuantifiable: true,
    icon: 'streamline-ultimate-color:responsive-design-1',
  },
  {
    id: 'logo',
    name: 'ロゴ制作',
    basePrice: 20000,
    isQuantifiable: false,
    icon: 'vscode-icons:file-type-image',
  },
  {
    id: 'manuscript',
    name: '原稿作成',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'fluent-emoji-flat:writing-hand-light',
  },
  {
    id: 'photo-shoot',
    name: '写真撮影',
    basePrice: 30000,
    isQuantifiable: false,
    icon: 'streamline-kameleon-color:camera-front-duo',
  },
  {
    id: 'google-map',
    name: 'Googleマップ設置（MEO）',
    basePrice: 30000,
    isQuantifiable: false,
    icon: 'streamline-kameleon-color:map-pin',
  },
  {
    id: 'seo',
    name: 'SEO対策',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:seo-search-graph',
    iconColorOverride: 'red',
  },
  {
    id: 'sns',
    name: 'SNS設置・運用代行',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:messages-bubble-text',
  },
  {
    id: 'line',
    name: '公式LINE設置・連携',
    basePrice: 15000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:line-app-logo',
  },
  {
    id: 'banner',
    name: 'バナー作成',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'streamline-ultimate-color:design-tool-ink',
  },
  {
    id: 'business-card',
    name: '名刺デザイン',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'streamline-kameleon-color:businessman-globe-duo',
  },
  {
    id: 'domain-server',
    name: 'ドメイン・サーバー取得代行',
    basePrice: 3000,
    isQuantifiable: false,
    icon: 'streamline-kameleon-color:servers',
  },
  {
    id: 'illust-diagrams',
    name: 'イラスト・図表作成',
    basePrice: 10000,
    isQuantifiable: false,
    icon: 'material-icon-theme:folder-app',
  },
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
