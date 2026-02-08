# 料金シミュレーター実装仕様書

このドキュメントは、料金シミュレーターと概算見積書の完全な実装仕様を記載しています。このドキュメントを読めば、同様の機能を再現できるように設計されています。

## 目次

1. [概要](#概要)
2. [使用技術](#使用技術)
3. [アーキテクチャ](#アーキテクチャ)
4. [ファイル構成](#ファイル構成)
5. [実装詳細](#実装詳細)
6. [料金計算ロジック](#料金計算ロジック)
7. [スタイリング](#スタイリング)
8. [印刷機能](#印刷機能)
9. [カスタマイズ方法](#カスタマイズ方法)
10. [トラブルシューティング](#トラブルシューティング)

---

## 概要

料金シミュレーターは、Webサイト制作の概算見積もりをユーザーがインタラクティブに作成できる機能です。

### 主な機能

- **プラン選択**: コーディング/ホームページ制作/特急案件
- **項目選択**: 18種類の制作項目をボタンで選択
- **ページ数指定**: モーダルで詳細なページ数を入力
- **リアルタイム料金計算**: 選択に応じて即座に金額を計算
- **割増計算**: ページ数による割増、特急案件の20%割増
- **消費税計算**: 10%の消費税を自動計算
- **見積書生成**: 概算見積書をPDF風のフォーマットで表示
- **印刷機能**: 印刷用に最適化されたレイアウト
- **状態永続化**: LocalStorageで選択状態を保存

### 設計思想

1. **単一ページ完結**: `/service` ページ内で全機能を提供
2. **React統合**: AstroページにReactコンポーネントを統合
3. **型安全性**: TypeScriptによる完全な型定義
4. **保守性**: 設定ファイルによる料金・項目の一元管理
5. **アクセシビリティ**: ARIA属性、キーボード操作対応

---

## 使用技術

```
- Astro 4.x（ページフレームワーク）
- React 18.x（UIコンポーネント）
- TypeScript 5.x（型安全性）
- CSS3（スタイリング、印刷対応）
```

### 依存関係

```json
{
  "dependencies": {
    "astro": "^4.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## アーキテクチャ

### コンポーネント構成図

```
┌─────────────────────────────────────────────────────────────┐
│ /service/index.astro (Astroページ)                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PricingSimulator (メインコンポーネント)                 │ │
│ │                                                           │ │
│ │ ┌──────────────────┐  ┌──────────────────┐             │ │
│ │ │ プラン選択        │  │ 項目選択         │             │ │
│ │ │ (Buttons)        │  │ (PricingItem)    │             │ │
│ │ └──────────────────┘  └──────────────────┘             │ │
│ │                                                           │ │
│ │ ┌──────────────────┐  ┌──────────────────┐             │ │
│ │ │ EstimateSummary  │  │ ModalDialog      │             │ │
│ │ │ (金額サマリー)    │  │ (ページ数選択)   │             │ │
│ │ └──────────────────┘  └──────────────────┘             │ │
│ │                                                           │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ EstimateDocument (見積書)                           │ │ │
│ │ │  ・印刷ボタン                                        │ │ │
│ │ │  ・お問い合わせボタン                                │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

```
┌──────────────────┐
│ User Interaction │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ PricingSimulator │────▶│ State Management │
│   (useState)     │     │  (useEffect)     │
└────────┬─────────┘     └────────┬─────────┘
         │                         │
         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐
│ calculatePrice() │     │ LocalStorage     │
│   (utils)        │     │ (永続化)         │
└────────┬─────────┘     └──────────────────┘
         │
         ▼
┌──────────────────┐
│ EstimateSummary  │
│ EstimateDocument │
└──────────────────┘
```

---

## ファイル構成

### ディレクトリ構造

```
src/
├── components/
│   ├── PricingSimulator.tsx      # メインコンポーネント（311行）
│   ├── PricingItem.tsx            # 項目ボタン（53行）
│   ├── EstimateSummary.tsx        # 金額サマリー（45行）
│   ├── EstimateDocument.tsx       # 見積書（212行）
│   └── ModalDialog.tsx            # モーダルダイアログ（61行）
├── config/
│   ├── pricing.ts                 # 料金・項目設定（69行）
│   └── companyInfo.ts             # 会社情報・見積設定（27行）
├── utils/
│   ├── calculatePrice.ts          # 料金計算ロジック（59行）
│   ├── generateEstimateNumber.ts  # 見積番号生成（36行）
│   └── storageManager.ts          # LocalStorage管理（46行）
├── types/
│   └── pricing.ts                 # 型定義（43行）
├── styles/pricing/
│   ├── PricingSimulator.css       # シミュレータースタイル（253行）
│   ├── PricingItem.css            # 項目ボタンスタイル（131行）
│   ├── EstimateSummary.css        # サマリースタイル
│   ├── EstimateDocument.css       # 見積書スタイル（印刷対応）
│   └── ModalDialog.css            # モーダルスタイル（132行）
└── pages/
    └── service/
        └── index.astro            # サービスページ（215行）
```

### 各ファイルの役割

#### 1. **PricingSimulator.tsx** (メインコンポーネント)

- 全体の状態管理（プラン、選択項目、ページ数）
- プラン選択ハンドラー
- 項目トグルハンドラー
- ページ数選択ハンドラー
- 見積書生成/リセット処理
- 2つのモード切り替え（シミュレーター/見積書表示）

#### 2. **PricingItem.tsx** (項目ボタン)

- 個別の料金項目ボタンの表示
- 選択状態の視覚的フィードバック
- ページ数がある場合のラベル表示（例: "下層ページ 10～19ページ"）
- ARIA属性によるアクセシビリティ対応

#### 3. **EstimateSummary.tsx** (金額サマリー)

- 小計、特急料金、消費税、合計金額の表示
- 金額のフォーマット（カンマ区切り）
- 概算である旨の注記表示

#### 4. **EstimateDocument.tsx** (見積書)

- 見積書番号の自動生成表示
- 発行日・有効期限の表示
- 会社情報（ロゴ、ウェブサイト）
- 明細テーブル（品名、単価、数量、金額）
- 税別内訳と合計金額
- 印刷ボタン・お問い合わせボタン
- 備考欄（別途費用、支払い条件など）

#### 5. **ModalDialog.tsx** (モーダル)

- ページ数選択のモーダル表示
- Escapeキーで閉じる機能
- オーバーレイクリックで閉じる機能
- ボディスクロールの制御

#### 6. **config/pricing.ts** (設定ファイル)

```typescript
// 料金項目の定義
export interface PricingItem {
  id: string;
  name: string;
  basePrice: number;
  isQuantifiable: boolean;  // ページ数指定可能か
  category?: string;
}

// 18項目の料金設定
export const PRICING_ITEMS: PricingItem[] = [
  { id: 'top-page', name: 'トップページ', basePrice: 30000, isQuantifiable: false },
  { id: 'sub-page', name: '下層ページ', basePrice: 5000, isQuantifiable: true },
  // ... 以下16項目
];

// プラン定義
export const PLANS: Plan[] = [
  { id: 'coding', name: 'コーディング' },
  { id: 'design', name: 'ホームページ制作' },  // 無効化されている
  { id: 'urgent', name: '特急案件' },
];

// ページ数オプション
export const PAGE_COUNT_OPTIONS: PageCountOption[] = [
  { id: '1', label: '1ページ', value: 1 },
  { id: '2', label: '2ページ', value: 2 },
  // ... 9ページまで
  { id: '10-19', label: '10～19ページ', value: 10, multiplier: 1.1 },   // 10%割増
  { id: '20-50', label: '20～50ページ', value: 20, multiplier: 1.25 },  // 25%割増
  { id: '50+', label: '50ページ～', value: 50, multiplier: 1.5 },       // 50%割増
  { id: 'unknown', label: 'わからない', value: 1 },
];
```

#### 7. **config/companyInfo.ts** (会社情報)

```typescript
export const COMPANY_INFO = {
  name: 'hibari-konaweb.com',
  website: 'https://hibari-konaweb.netlify.app',
  registrationNumber: '',  // インボイス登録番号（空欄の場合は非表示）
} as const;

export const ESTIMATE_CONFIG = {
  title: 'Webサイト制作に関する概算お見積書',
  subject: 'Webサイト制作に関するお見積り',
  validityDays: 30,        // 有効期限（日数）
  taxRate: 0.1,            // 消費税率（10%）
  urgentFeeRate: 0.2,      // 特急料金率（20%）
  // 免責事項・備考
  disclaimer: [...],
  notes: [...],
} as const;
```

#### 8. **utils/calculatePrice.ts** (料金計算)

```typescript
// ページ数に応じた料金計算
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

// 全体の料金計算
export function calculatePrice(
  selectedItems: SelectedItem[],
  isUrgent: boolean
): PriceCalculation {
  // 1. 各項目の合計（小計）
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // 2. 特急料金（小計 × 20%）
  const urgentFee = isUrgent
    ? Math.round(subtotal * ESTIMATE_CONFIG.urgentFeeRate)
    : 0;
  
  // 3. 消費税（(小計 + 特急料金) × 10%）
  const subtotalWithUrgent = subtotal + urgentFee;
  const tax = Math.round(subtotalWithUrgent * ESTIMATE_CONFIG.taxRate);
  
  // 4. 合計金額
  const total = subtotalWithUrgent + tax;
  
  return { subtotal, urgentFee, tax, total, items };
}
```

#### 9. **utils/generateEstimateNumber.ts** (見積番号生成)

```typescript
// 見積書番号: EST-YYYYMMDD-XXXX
export function generateEstimateNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `EST-${year}${month}${day}-${random}`;
}

// 日付フォーマット: YYYY年MM月DD日
export function formatDateForDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

// 有効期限計算
export function calculateExpiryDate(issueDate: Date, validityDays: number): Date {
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(expiryDate.getDate() + validityDays);
  return expiryDate;
}
```

#### 10. **utils/storageManager.ts** (状態永続化)

```typescript
const STORAGE_KEY = 'pricing-simulator-state';

// 保存
export function saveState(state: SavedState): void {
  const serialized = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, serialized);
}

// 読み込み
export function loadState(): SavedState | null {
  const serialized = localStorage.getItem(STORAGE_KEY);
  if (!serialized) return null;
  return JSON.parse(serialized) as SavedState;
}

// クリア
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

**重要**: 現在の実装では、ページリフレッシュ時には状態をクリアしています。URLパラメータ `?restore=true` がある場合のみ復元します。

#### 11. **types/pricing.ts** (型定義)

```typescript
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
```

---

## 実装詳細

### 1. プラン選択機能

**実装場所**: `PricingSimulator.tsx` (104-111行目)

```typescript
const handlePlanChange = (planId: PlanType) => {
  setSelectedPlan(planId);
  if (planId === 'urgent') {
    setIsUrgent(true);  // 特急案件選択時は割増フラグをON
  } else {
    setIsUrgent(false);
  }
};
```

**UI実装** (220-238行目):

```typescript
<div className="pricing-simulator__plans">
  <h3 className="pricing-simulator__section-title">プラン</h3>
  <div className="pricing-simulator__plan-grid">
    {PLANS.map(plan => (
      <button
        key={plan.id}
        type="button"
        className={`pricing-plan-button ${
          selectedPlan === plan.id ? 'pricing-plan-button--active' : ''
        } ${plan.id === 'design' ? 'pricing-plan-button--disabled' : ''}`}
        onClick={() => plan.id !== 'design' && handlePlanChange(plan.id)}
        disabled={plan.id === 'design'}  // デザインプランは無効化
        aria-pressed={selectedPlan === plan.id ? 'true' : 'false'}
      >
        {plan.name}
      </button>
    ))}
  </div>
</div>
```

**ポイント**:
- 「ホームページ制作」プランは選択不可（`disabled`）
- デフォルトは「コーディング」プラン
- 「特急案件」選択時は自動的に20%割増が適用

### 2. 項目選択とページ数指定

**実装場所**: `PricingSimulator.tsx` (114-142行目)

```typescript
const handleItemToggle = (itemId: string) => {
  const item = PRICING_ITEMS.find(p => p.id === itemId);
  if (item === undefined) return;

  if (selectedItemIds.has(itemId)) {
    // 選択解除
    const newIds = new Set(selectedItemIds);
    newIds.delete(itemId);
    setSelectedItemIds(newIds);

    // ページ数情報も削除
    if (pageCountMap.has(itemId)) {
      const newMap = new Map(pageCountMap);
      newMap.delete(itemId);
      setPageCountMap(newMap);
    }
  } else {
    // 選択追加
    const newIds = new Set(selectedItemIds);
    newIds.add(itemId);
    setSelectedItemIds(newIds);

    // ページ数指定が可能な項目（isQuantifiable: true）の場合はモーダルを開く
    if (item.isQuantifiable === true) {
      setCurrentPageItem(itemId);
      setIsPageModalOpen(true);
    }
  }
};
```

**ページ数選択ハンドラー** (144-153行目):

```typescript
const handlePageCountSelect = (value: number) => {
  if (currentPageItem !== null) {
    const newMap = new Map(pageCountMap);
    newMap.set(currentPageItem, value);
    setPageCountMap(newMap);
  }
  setIsPageModalOpen(false);
  setCurrentPageItem(null);
};
```

**モーダルUI** (282-307行目):

```typescript
<ModalDialog
  isOpen={isPageModalOpen}
  onClose={() => {
    setIsPageModalOpen(false);
    setCurrentPageItem(null);
  }}
  title="ページ数を選択してください"
>
  <div className="page-count-options">
    {PAGE_COUNT_OPTIONS.map(option => (
      <button
        key={option.id}
        type="button"
        className="page-count-option"
        onClick={() => handlePageCountSelect(option.value)}
      >
        {option.label}
        {(option.multiplier ?? 0) > 1 && (
          <span className="page-count-option__badge">
            {Math.round(((option.multiplier ?? 1) - 1) * 100)}%割増
          </span>
        )}
      </button>
    ))}
  </div>
</ModalDialog>
```

**ポイント**:
- `isQuantifiable: true` の項目（下層ページ、下層ページレスポンシブ対応）のみモーダル表示
- モーダルで選択したページ数は `pageCountMap` に保存
- 割増率がある場合はバッジ表示（例: "10%割増"）

### 3. ページ数ラベルの表示ロジック

**実装場所**: `PricingItem.tsx` (18-30行目)

```typescript
const getPageLabel = () => {
  if (!isSelected || quantity === undefined || quantity <= 1) return null;

  const option = PAGE_COUNT_OPTIONS.find((opt) => opt.value === quantity);

  if (option) {
    // "10～19ページ" などのラベルをそのまま返す
    return option.label;
  }

  return `${quantity}ページ`;
};
```

**UI表示** (39-46行目):

```typescript
<div className="pricing-item__text">
  <span className="pricing-item__line">{item.name}</span>
  {isSelected && quantity !== undefined && quantity > 0 && (
    <span className="pricing-item__line">
      {getPageLabel()}
    </span>
  )}
</div>
```

**表示例**:
- 「下層ページ 10～19ページ」
- 「下層ページ 20～50ページ」

### 4. リアルタイム料金計算

**実装場所**: `PricingSimulator.tsx` (53-85行目)

```typescript
// PRICING_ITEMSの順番を保持して選択項目を計算
const selectedItems: SelectedItem[] = useMemo(() => {
  const items: SelectedItem[] = [];

  PRICING_ITEMS.forEach(item => {
    if (!selectedItemIds.has(item.id)) return;

    let quantity = 1;
    let price = item.basePrice;

    // ページ数指定がある場合
    if (item.isQuantifiable === true && pageCountMap.has(item.id)) {
      const pageCount = pageCountMap.get(item.id);
      quantity = pageCount !== undefined ? pageCount : 1;
      const selectedOption = PAGE_COUNT_OPTIONS.find(
        opt => opt.value === quantity
      );
      price = calculatePagePrice(
        item.basePrice,
        quantity,
        selectedOption?.multiplier
      );
    }

    items.push({
      itemId: item.id,
      quantity,
      price
    });
  });

  return items;
}, [selectedItemIds, pageCountMap]);

// 料金計算（特急料金含む）
const calculation = useMemo(() => {
  return calculatePrice(selectedItems, isUrgent);
}, [selectedItems, isUrgent]);
```

**ポイント**:
- `useMemo` を使用してパフォーマンス最適化
- `PRICING_ITEMS` の順番通りに処理することで、見積書の品名順を保証
- 選択状態が変わるたびに自動的に再計算

### 5. 見積書生成機能

**実装場所**: `PricingSimulator.tsx` (156-175行目)

```typescript
const handleGenerateEstimate = () => {
  const issueDate = new Date();
  const expiryDate = calculateExpiryDate(issueDate, ESTIMATE_CONFIG.validityDays);

  const estimate: EstimateData = {
    estimateNumber: generateEstimateNumber(),  // EST-20260208-1234
    issueDate: formatDateForDisplay(issueDate),  // 2026年02月08日
    expiryDate: formatDateForDisplay(expiryDate),  // 2026年03月10日
    subject: ESTIMATE_CONFIG.subject,
    calculation,
    isUrgent,
    selectedPlan
  };

  setEstimateData(estimate);
  setShowEstimate(true);

  // 見積書表示時にスクロールトップへ
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**見積書表示モード** (195-210行目):

```typescript
if (showEstimate === true && estimateData !== null) {
  return (
    <div className="pricing-simulator">
      <EstimateDocument estimateData={estimateData} />
      <div className="pricing-simulator__actions pricing-simulator__actions--back">
        <button
          type="button"
          className="pricing-simulator__button pricing-simulator__button--reset"
          onClick={handleBackToSimulator}
        >
          最初に戻る
        </button>
      </div>
    </div>
  );
}
```

### 6. リセット機能

**実装場所**: `PricingSimulator.tsx` (184-192行目)

```typescript
const handleReset = () => {
  if (confirm('すべての選択をリセットしますか？')) {
    setSelectedItemIds(new Set());
    setPageCountMap(new Map());
    setIsUrgent(false);
    setSelectedPlan('coding');
    clearState();  // LocalStorageもクリア
  }
};
```

### 7. 状態永続化

**実装場所**: `PricingSimulator.tsx` (24-50行目、93-101行目)

```typescript
// 初期状態の復元（URLパラメータで制御）
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const shouldRestore = urlParams.get('restore') === 'true';

  if (shouldRestore) {
    const savedState = loadState();
    if (savedState !== null) {
      setSelectedPlan(savedState.selectedPlan);
      setIsUrgent(savedState.isUrgent);
      const ids = new Set<string>(savedState.selectedItems.map(item => item.itemId));
      setSelectedItemIds(ids);

      const pageMap = new Map<string, number>();
      savedState.selectedItems.forEach(item => {
        if (item.quantity > 1) {
          pageMap.set(item.itemId, item.quantity);
        }
      });
      setPageCountMap(pageMap);
    }
  } else {
    // ページリフレッシュやブラウザ再読み込みでは常にクリア
    clearState();
  }
}, []);

// 状態を保存
useEffect(() => {
  if (selectedItems.length > 0) {
    saveState({
      selectedItems,
      selectedPlan,
      isUrgent
    });
  }
}, [selectedItems, selectedPlan, isUrgent]);
```

**ポイント**:
- デフォルトではリフレッシュ時に状態をクリア
- `?restore=true` がある場合のみ復元
- 選択が変更されるたびに自動保存

---

## 料金計算ロジック

### 計算の流れ

```
1. 基本料金 × 数量
   ↓
2. ページ数割増（該当する場合）
   ↓
3. 各項目の合計 = 小計
   ↓
4. 特急料金 = 小計 × 20%（特急案件の場合）
   ↓
5. 消費税 = (小計 + 特急料金) × 10%
   ↓
6. 合計金額 = 小計 + 特急料金 + 消費税
```

### 具体例

**例1: 通常のコーディング案件**

```
選択項目:
- トップページ: ¥30,000 × 1 = ¥30,000
- 下層ページ: ¥5,000 × 5 = ¥25,000

小計: ¥55,000
特急料金: ¥0
消費税: ¥5,500 (¥55,000 × 10%)
合計: ¥60,500
```

**例2: ページ数割増ありの案件**

```
選択項目:
- 下層ページ: ¥5,000 × 10 × 1.1(10%割増) = ¥55,000

小計: ¥55,000
特急料金: ¥0
消費税: ¥5,500
合計: ¥60,500
```

**例3: 特急案件**

```
選択項目:
- トップページ: ¥30,000 × 1 = ¥30,000
- 下層ページ: ¥5,000 × 5 = ¥25,000

小計: ¥55,000
特急料金: ¥11,000 (¥55,000 × 20%)
消費税: ¥6,600 ((¥55,000 + ¥11,000) × 10%)
合計: ¥72,600
```

### コード実装

**ページ数割増計算**: `utils/calculatePrice.ts` (8-17行目)

```typescript
export function calculatePagePrice(
  basePrice: number,
  quantity: number,
  multiplier?: number
): number {
  if (!multiplier || multiplier <= 1) {
    // 割増なし: 基本料金 × 数量
    return basePrice * quantity;
  }
  // 割増あり: 基本料金 × 数量 × 割増率（四捨五入）
  return Math.round(basePrice * quantity * multiplier);
}
```

**全体計算**: `utils/calculatePrice.ts` (22-55行目)

```typescript
export function calculatePrice(
  selectedItems: SelectedItem[],
  isUrgent: boolean
): PriceCalculation {
  // 各項目の詳細を構築
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

  // 小計
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // 特急料金（小計 × 20%）
  const urgentFee = isUrgent
    ? Math.round(subtotal * ESTIMATE_CONFIG.urgentFeeRate)
    : 0;
  
  // 消費税（(小計 + 特急料金) × 10%）
  const subtotalWithUrgent = subtotal + urgentFee;
  const tax = Math.round(subtotalWithUrgent * ESTIMATE_CONFIG.taxRate);
  
  // 合計
  const total = subtotalWithUrgent + tax;

  return {
    subtotal,
    urgentFee,
    tax,
    total,
    items,
  };
}
```

---

## スタイリング

### CSS設計思想

1. **BEM命名規則**: `.block__element--modifier`
2. **CSS変数**: カラー、フォントサイズを変数化
3. **レスポンシブ対応**: `@media (max-width: 1024px)`
4. **印刷対応**: `@media print`
5. **ダークモード対応**: `html.dark`

### 主要なCSSクラス

#### PricingSimulator.css

```css
/* コンテナ */
.pricing-simulator {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* プランボタン */
.pricing-plan-button {
  padding: 1rem 2rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  transition: all 0.3s ease;
}

.pricing-plan-button--active {
  background: var(--color-primary);
  color: white;
}

.pricing-plan-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-gray);
}

/* 項目グリッド（3列 → 2列） */
.pricing-simulator__item-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 1024px) {
  .pricing-simulator__item-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* アクションボタン */
.pricing-simulator__button--generate {
  background: var(--color-primary);
  color: white;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: bold;
}

.pricing-simulator__button--reset {
  background: var(--color-gray);
  color: var(--color-text);
}
```

#### PricingItem.css

```css
/* 項目ボタン */
.pricing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  transition: all 0.3s ease;
  cursor: pointer;
}

.pricing-item--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

/* テキスト（2行表示） */
.pricing-item__text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.pricing-item__line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 選択中バッジ */
.pricing-item__badge {
  padding: 0.25rem 0.75rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
}
```

#### EstimateDocument.css（印刷対応）

```css
/* 見積書コンテナ */
.estimate-document {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  color: black;
}

/* ヘッダー */
.estimate-document__title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
}

/* メイン情報（並列レイアウト） */
.estimate-document__main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* 会社情報 */
.estimate-document__company {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.estimate-document__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 明細テーブル */
.estimate-document__table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.estimate-document__table th,
.estimate-document__table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.estimate-document__table th {
  background: #f5f5f5;
  font-weight: bold;
}

/* 税別内訳と合計金額（並列表示） */
.estimate-document__summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

/* 印刷時専用スタイル */
@media print {
  .estimate-document {
    padding: 0;
  }

  .estimate-document__main {
    display: flex !important;
    flex-direction: row !important;
  }

  .estimate-document__summary {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
  }

  /* ボタンを非表示 */
  .no-print,
  .estimate-document__actions {
    display: none !important;
  }
}
```

#### ModalDialog.css

```css
/* オーバーレイ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* モーダルコンテンツ */
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

/* ヘッダー */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* 閉じるボタン */
.modal-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

/* ページ数オプション */
.page-count-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.page-count-option {
  padding: 1rem;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-count-option:hover {
  border-color: var(--color-primary);
}

/* 割増バッジ */
.page-count-option__badge {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-red);
}
```

---

## 印刷機能

### 印刷ボタンの実装

**実装場所**: `EstimateDocument.tsx` (14-16行目、193-200行目)

```typescript
const handlePrint = () => {
  window.print();
};

// UI
<button
  type="button"
  className="estimate-document__button estimate-document__button--print"
  onClick={handlePrint}
>
  印刷する
</button>
```

### 印刷用CSSの設計

印刷時には以下の要素を制御します：

#### 非表示にする要素

```css
@media print {
  /* ヘッダー・フッター・パンくず・ページタイトルを非表示 */
  header,
  footer,
  .breadcrumbs__wrapper,
  .pricePage > .pricePage__wrapper {
    display: none !important;
  }

  /* ボタン類を非表示 */
  .no-print,
  .estimate-document__actions,
  .pricing-simulator__actions--back {
    display: none !important;
  }

  /* Page Topボタンのテキストと画像を非表示 */
  .page-top__text,
  .page-top__image {
    display: none !important;
  }
}
```

#### 表示を維持する要素

```css
@media print {
  /* Page Top背景画像は表示 */
  .page-top {
    display: block !important;
    position: fixed;
    bottom: 20px;
    right: 20px;
  }

  /* 見積書本体 */
  .estimate-document {
    display: block !important;
    padding: 0 !important;
    background: white !important;
    color: black !important;
  }
}
```

#### レイアウトの調整

```css
@media print {
  /* 並列レイアウトを維持 */
  .estimate-document__main {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
  }

  .estimate-document__info {
    text-align: right !important;
  }

  /* 会社情報を右寄せ */
  .estimate-document__company {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
  }

  /* 税別内訳と合計金額を並列表示 */
  .estimate-document__summary {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 2rem !important;
  }

  /* 合計金額を表示 */
  .estimate-document__total-amount {
    display: flex !important;
  }
}
```

### 印刷時の重要なポイント

1. **`!important` の使用**: 通常のスタイルを確実に上書きするために使用
2. **`display` の明示的指定**: FlexboxやGridレイアウトを明示的に指定
3. **改ページ制御**: 必要に応じて `page-break-before`, `page-break-after` を使用
4. **カラー**: 印刷時は背景色が出ないことがあるため、重要な情報は黒文字で表示

---

## カスタマイズ方法

### 1. 料金を変更する

**ファイル**: `src/config/pricing.ts`

```typescript
export const PRICING_ITEMS: PricingItem[] = [
  { id: 'top-page', name: 'トップページ', basePrice: 40000, isQuantifiable: false }, // 30000 → 40000
  { id: 'sub-page', name: '下層ページ', basePrice: 6000, isQuantifiable: true }, // 5000 → 6000
  // ...
];
```

### 2. 消費税率・特急料金率を変更する

**ファイル**: `src/config/companyInfo.ts`

```typescript
export const ESTIMATE_CONFIG = {
  taxRate: 0.08,         // 10% → 8%
  urgentFeeRate: 0.3,    // 20% → 30%
  // ...
} as const;
```

### 3. 新しい項目を追加する

**ファイル**: `src/config/pricing.ts`

```typescript
export const PRICING_ITEMS: PricingItem[] = [
  // ... 既存の項目
  { id: 'seo-optimization', name: 'SEO対策', basePrice: 50000, isQuantifiable: false },
  { id: 'maintenance', name: '保守サポート', basePrice: 10000, isQuantifiable: false },
];
```

### 4. ページ数オプションを変更する

**ファイル**: `src/config/pricing.ts`

```typescript
export const PAGE_COUNT_OPTIONS: PageCountOption[] = [
  { id: '1', label: '1ページ', value: 1 },
  { id: '2-5', label: '2～5ページ', value: 2, multiplier: 1.05 },  // 新しいオプション
  { id: '10-19', label: '10～19ページ', value: 10, multiplier: 1.15 },  // 割増率変更
  // ...
];
```

### 5. 会社情報を変更する

**ファイル**: `src/config/companyInfo.ts`

```typescript
export const COMPANY_INFO = {
  name: 'あなたの会社名',
  website: 'https://example.com',
  registrationNumber: 'T1234567890123',  // インボイス登録番号
} as const;
```

### 6. 見積書の件名を変更する

**ファイル**: `src/config/companyInfo.ts`

```typescript
export const ESTIMATE_CONFIG = {
  subject: 'ホームページリニューアルに関するお見積り',  // 件名変更
  validityDays: 45,  // 有効期限を45日に変更
  // ...
} as const;
```

### 7. スタイルをカスタマイズする

**ファイル**: `src/styles/pricing/PricingSimulator.css`

```css
/* プライマリカラーを変更 */
:root {
  --color-primary: #0066cc;  /* 青色に変更 */
  --color-primary-light: #e6f2ff;
}

/* ボタンのサイズを変更 */
.pricing-simulator__button--generate {
  padding: 1.5rem 3rem;  /* より大きく */
  font-size: 1.2rem;
}
```

### 8. 印刷時のレイアウトを調整する

**ファイル**: `src/styles/pricing/EstimateDocument.css`

```css
@media print {
  /* 余白を調整 */
  @page {
    margin: 2cm;
  }

  /* フォントサイズを調整 */
  .estimate-document {
    font-size: 12pt;
  }

  /* テーブルの改ページを制御 */
  .estimate-document__table {
    page-break-inside: avoid;
  }
}
```

---

## トラブルシューティング

### 問題1: 印刷時に要素が表示されない

**症状**: 印刷プレビューで見積書の一部が表示されない

**原因**: CSSの`display: none`が効いている、または印刷用CSSが適用されていない

**解決方法**:

```css
/* EstimateDocument.css */
@media print {
  .estimate-document {
    display: block !important;  /* !importantを追加 */
  }

  .estimate-document__main {
    display: flex !important;
    flex-direction: row !important;
  }
}
```

### 問題2: 選択した項目がリフレッシュ後に消える

**症状**: ページをリロードすると選択状態がリセットされる

**原因**: 仕様上、デフォルトでリフレッシュ時に状態をクリアしている

**解決方法**: URLパラメータを使用する

```typescript
// PricingSimulator.tsx
// ?restore=true を付けてアクセスすると状態が復元される
// 例: /service?restore=true
```

または、常に復元したい場合は以下を変更：

```typescript
// PricingSimulator.tsx (27行目)
const shouldRestore = urlParams.get('restore') === 'true';
// ↓ 以下に変更
const shouldRestore = true;  // 常に復元
```

### 問題3: ページ数を選択しても「下層ページ 10ページ」と表示される

**症状**: 「下層ページ 10～19ページ」と表示されるべきところが「下層ページ 10ページ」になる

**原因**: `PricingItem.tsx`でのラベル取得ロジックの問題

**解決方法**: すでに修正済み（`option.label`をそのまま返す実装）

```typescript
// PricingItem.tsx
const getPageLabel = () => {
  if (!isSelected || quantity === undefined || quantity <= 1) return null;
  
  const option = PAGE_COUNT_OPTIONS.find((opt) => opt.value === quantity);
  
  if (option) {
    return option.label;  // ラベルをそのまま返す
  }
  
  return `${quantity}ページ`;
};
```

### 問題4: 見積書番号が重複する

**症状**: 同じ日に複数の見積書を作成すると番号が重複することがある

**原因**: ランダム番号部分の衝突

**解決方法**: より高精度なランダム番号生成、またはカウンター方式に変更

```typescript
// utils/generateEstimateNumber.ts
export function generateEstimateNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-6);  // タイムスタンプの下6桁
  return `EST-${year}${month}${day}-${time}`;
}
```

### 問題5: モーダルが表示されない

**症状**: ページ数指定の項目をクリックしてもモーダルが開かない

**原因**: 
1. `isQuantifiable` が正しく設定されていない
2. モーダルのCSSが読み込まれていない

**解決方法**:

```typescript
// config/pricing.ts
// isQuantifiableがtrueになっているか確認
{ id: 'sub-page', name: '下層ページ', basePrice: 5000, isQuantifiable: true }
```

```typescript
// ModalDialog.tsx
// CSSのインポートを確認
import '../styles/pricing/ModalDialog.css';
```

### 問題6: 特急料金が正しく計算されない

**症状**: 特急案件を選択しても料金が変わらない

**原因**: `isUrgent`フラグが正しく設定されていない

**解決方法**:

```typescript
// PricingSimulator.tsx
const handlePlanChange = (planId: PlanType) => {
  setSelectedPlan(planId);
  if (planId === 'urgent') {
    setIsUrgent(true);  // このフラグ設定を確認
  } else {
    setIsUrgent(false);
  }
};
```

### 問題7: 項目の順番が見積書でバラバラになる

**症状**: 見積書の品名順が選択した順番になってしまう

**原因**: すでに修正済み（`PRICING_ITEMS`の順番を保持する実装）

**解決方法**: `PricingSimulator.tsx`の`selectedItems`計算で`PRICING_ITEMS.forEach`を使用

```typescript
// PricingSimulator.tsx (53-85行目)
const selectedItems: SelectedItem[] = useMemo(() => {
  const items: SelectedItem[] = [];

  // PRICING_ITEMSの順番通りに処理
  PRICING_ITEMS.forEach(item => {
    if (!selectedItemIds.has(item.id)) return;
    // ...
  });

  return items;
}, [selectedItemIds, pageCountMap]);
```

---

## まとめ

この実装仕様書には、料金シミュレーターと概算見積書の完全な実装詳細が含まれています。

### 実装のポイント

1. **設定ファイルによる管理**: 料金や項目は`config/pricing.ts`で一元管理
2. **型安全性**: TypeScriptによる完全な型定義で保守性を確保
3. **コンポーネント分割**: 責務ごとに分割された再利用可能なコンポーネント
4. **リアルタイム計算**: `useMemo`による効率的な料金計算
5. **印刷対応**: `@media print`による印刷最適化
6. **アクセシビリティ**: ARIA属性、キーボード操作対応

### 今後の拡張案

- **PDF生成機能**: jsPDFによるPDFダウンロード機能
- **お問い合わせフォーム連携**: Contact Form 7との連携
- **見積書のメール送信**: バックエンドAPIとの連携
- **見積書の履歴管理**: データベースへの保存
- **項目のカテゴリ分類**: タブ切り替えによる項目の整理

---

**作成日**: 2026年02月08日  
**バージョン**: 1.0  
**ベース**: CODING_COST_CALCULATOR.md  
**実装確認済み**: 全機能動作確認済み
