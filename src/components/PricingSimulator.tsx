import { useState, useEffect, useMemo } from 'react';
import { PricingItemButton } from './PricingItem';
import { EstimateSummary } from './EstimateSummary';
import { EstimateDocument } from './EstimateDocument';
import { ModalDialog } from './ModalDialog';
import { PRICING_ITEMS, PLANS, PAGE_COUNT_OPTIONS } from '../config/pricing';
import { ESTIMATE_CONFIG } from '../config/companyInfo';
import { calculatePrice, calculatePagePrice } from '../utils/calculatePrice';
import { saveState, loadState, clearState } from '../utils/storageManager';
import { generateEstimateNumber, formatDateForDisplay, calculateExpiryDate } from '../utils/generateEstimateNumber';
import type { SelectedItem, PlanType, EstimateData } from '../types/pricing';
import '../styles/pricing/PricingSimulator.css';

export function PricingSimulator() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('coding');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [pageCountMap, setPageCountMap] = useState<Map<string, number>>(new Map());
  const [isUrgent, setIsUrgent] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [currentPageItem, setCurrentPageItem] = useState<string | null>(null);
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);

  // 初期状態の復元（ページリフレッシュでは復元しない）
  useEffect(() => {
    // URLパラメータで明示的に復元を許可する場合のみ復元
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

  // 選択された項目の詳細を計算（PRICING_ITEMSの順番を保持）
  const selectedItems: SelectedItem[] = useMemo(() => {
    const items: SelectedItem[] = [];

    // PRICING_ITEMSの順番通りに処理することで、表示順を保証
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

  // 料金計算
  const calculation = useMemo(() => {
    return calculatePrice(selectedItems, isUrgent);
  }, [selectedItems, isUrgent]);

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

  // プラン選択
  const handlePlanChange = (planId: PlanType) => {
    setSelectedPlan(planId);
    if (planId === 'urgent') {
      setIsUrgent(true);
    } else {
      setIsUrgent(false);
    }
  };

  // 項目トグル
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

      // ページ数指定が可能な項目の場合はモーダルを開く
      if (item.isQuantifiable === true) {
        setCurrentPageItem(itemId);
        setIsPageModalOpen(true);
      }
    }
  };

  // ページ数選択
  const handlePageCountSelect = (value: number) => {
    if (currentPageItem !== null) {
      const newMap = new Map(pageCountMap);
      newMap.set(currentPageItem, value);
      setPageCountMap(newMap);
    }
    setIsPageModalOpen(false);
    setCurrentPageItem(null);
  };

  // 見積書作成ボタンのハンドラー
  const handleGenerateEstimate = () => {
    const issueDate = new Date();
    const expiryDate = calculateExpiryDate(issueDate, ESTIMATE_CONFIG.validityDays);

    const estimate: EstimateData = {
      estimateNumber: generateEstimateNumber(),
      issueDate: formatDateForDisplay(issueDate),
      expiryDate: formatDateForDisplay(expiryDate),
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

  // 最初に戻るボタンのハンドラー
  const handleBackToSimulator = () => {
    setShowEstimate(false);
    setEstimateData(null);
  };

  // リセットボタンのハンドラー
  const handleReset = () => {
    if (confirm('すべての選択をリセットしますか？')) {
      setSelectedItemIds(new Set());
      setPageCountMap(new Map());
      setIsUrgent(false);
      setSelectedPlan('coding');
      clearState();
    }
  };

  // 見積書表示モード
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

  // シミュレーターモード
  return (
    <div className="pricing-simulator">
      <div className="pricing-simulator__header">
        <h2 className="pricing-simulator__title">料金シュミレーター</h2>
      </div>

      {/* プラン選択 */}
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
              disabled={plan.id === 'design'}
              {...(selectedPlan === plan.id ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
            >
              {plan.name}
            </button>
          ))}
        </div>
      </div>

      {/* 項目選択 */}
      <div className="pricing-simulator__items">
        <h3 className="pricing-simulator__section-title">項目</h3>
        <div className="pricing-simulator__item-grid">
          {PRICING_ITEMS.map(item => (
            <PricingItemButton
              key={item.id}
              item={item}
              isSelected={selectedItemIds.has(item.id)}
              onToggle={handleItemToggle}
              quantity={pageCountMap.get(item.id)}
            />
          ))}
        </div>
      </div>

      {/* 金額サマリー */}
      {selectedItems.length > 0 && (
        <EstimateSummary calculation={calculation} isUrgent={isUrgent} />
      )}

      {/* アクションボタン */}
      <div className="pricing-simulator__actions">
        <button
          type="button"
          className="pricing-simulator__button pricing-simulator__button--reset"
          onClick={handleReset}
          disabled={selectedItems.length === 0}
        >
          やり直し
        </button>
        <button
          type="button"
          className="pricing-simulator__button pricing-simulator__button--generate"
          onClick={handleGenerateEstimate}
          disabled={selectedItems.length === 0}
        >
          この結果で概算見積書を作成
        </button>
      </div>

      {/* ページ数選択モーダル */}
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
    </div>
  );
}
