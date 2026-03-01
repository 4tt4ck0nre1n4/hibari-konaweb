import { useState, useEffect, useMemo } from 'react';
import { PricingItemButton } from './PricingItem';
import { EstimateSummary } from './EstimateSummary';
import { EstimateDocument } from './EstimateDocument';
import { ModalDialog } from './ModalDialog';
import IconifyInline from './IconifyInline';
import {
  PRICING_ITEMS,
  HOMEPAGE_PRICING_ITEMS,
  PLANS,
  PAGE_COUNT_OPTIONS,
  ANIMATION_COUNT_OPTIONS,
  OTHER_FUNCTIONS_OPTIONS,
} from '../config/pricing';
import { ESTIMATE_CONFIG } from '../config/companyInfo';
import { calculatePrice, calculatePagePrice } from '../utils/calculatePrice';
import { saveState, loadState, clearState } from '../utils/storageManager';
import { generateEstimateNumber, formatDateForDisplay, calculateExpiryDate } from '../utils/generateEstimateNumber';
import type { SelectedItem, PlanType, EstimateData } from '../types/pricing';
import '../styles/pricing/PricingSimulator.css';

// 「コーディング」または「ホームページ制作」のどちらの項目か判定
function getItemPlan(itemId: string): 'coding' | 'design' | null {
  if (PRICING_ITEMS.some(p => p.id === itemId)) return 'coding';
  if (HOMEPAGE_PRICING_ITEMS.some(p => p.id === itemId)) return 'design';
  return null;
}

export function PricingSimulator() {
  // 表示中のタブ（'coding' | 'design'）、特急案件はisUrgentで管理
  const [activeTab, setActiveTab] = useState<'coding' | 'design'>('coding');
  const [codingItemIds, setCodingItemIds] = useState<Set<string>>(new Set());
  const [designItemIds, setDesignItemIds] = useState<Set<string>>(new Set());
  const [codingPageCountMap, setCodingPageCountMap] = useState<Map<string, number>>(new Map());
  const [designPageCountMap, setDesignPageCountMap] = useState<Map<string, number>>(new Map());
  const [isUrgent, setIsUrgent] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [currentPageItem, setCurrentPageItem] = useState<string | null>(null);
  const [isOtherFunctionsModalOpen, setIsOtherFunctionsModalOpen] = useState(false);
  const [tempOtherFunctionsIds, setTempOtherFunctionsIds] = useState<Set<string>>(new Set());
  const [confirmedOtherFunctionsIds, setConfirmedOtherFunctionsIds] = useState<Set<string>>(new Set());
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);

  // 初期状態の復元（URLパラメータで明示的に許可する場合のみ）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRestore = urlParams.get('restore') === 'true';

    if (shouldRestore) {
      const savedState = loadState();
      if (savedState !== null) {
        const plan = savedState.selectedPlan;
        setActiveTab(plan === 'design' ? 'design' : 'coding');
        setIsUrgent(savedState.isUrgent);

        const codingIds = new Set<string>(savedState.codingItems.map(i => i.itemId));
        setCodingItemIds(codingIds);

        const designIds = new Set<string>(savedState.designItems.map(i => i.itemId));
        setDesignItemIds(designIds);

        // other-functions のサブ選択を復元
        const otherFnItem = savedState.codingItems.find(i => i.itemId === 'other-functions');
        if (otherFnItem?.selectedFunctions !== undefined) {
          setConfirmedOtherFunctionsIds(new Set(otherFnItem.selectedFunctions));
        }

        const codingMap = new Map<string, number>();
        savedState.codingItems.forEach(item => {
          if (item.quantity > 1) codingMap.set(item.itemId, item.quantity);
        });
        setCodingPageCountMap(codingMap);

        const designMap = new Map<string, number>();
        savedState.designItems.forEach(item => {
          if (item.quantity > 1) designMap.set(item.itemId, item.quantity);
        });
        setDesignPageCountMap(designMap);
      }
    } else {
      clearState();
    }
  }, []);

  // コーディング選択項目の詳細（PRICING_ITEMSの順番を保持）
  const codingSelectedItems: SelectedItem[] = useMemo(() => {
    const items: SelectedItem[] = [];
    PRICING_ITEMS.forEach(item => {
      if (!codingItemIds.has(item.id)) return;

      // other-functions は確定済みサブ選択の合計額を使用
      if (item.id === 'other-functions') {
        if (confirmedOtherFunctionsIds.size === 0) return;
        const price = [...confirmedOtherFunctionsIds].reduce((sum, fnId) => {
          const fn = OTHER_FUNCTIONS_OPTIONS.find(o => o.id === fnId);
          return sum + (fn?.basePrice ?? 0);
        }, 0);
        items.push({
          itemId: item.id,
          quantity: 1,
          price,
          selectedFunctions: [...confirmedOtherFunctionsIds],
        });
        return;
      }

      let quantity = 1;
      let price = item.basePrice;
      if (item.isQuantifiable === true && codingPageCountMap.has(item.id)) {
        const pageCount = codingPageCountMap.get(item.id);
        quantity = pageCount !== undefined ? pageCount : 1;
        const selectedOption = PAGE_COUNT_OPTIONS.find(opt => opt.value === quantity);
        price = calculatePagePrice(item.basePrice, quantity, selectedOption?.multiplier);
      }
      items.push({ itemId: item.id, quantity, price });
    });
    return items;
  }, [codingItemIds, codingPageCountMap, confirmedOtherFunctionsIds]);

  // ホームページ制作選択項目の詳細（HOMEPAGE_PRICING_ITEMSの順番を保持）
  const designSelectedItems: SelectedItem[] = useMemo(() => {
    const items: SelectedItem[] = [];
    HOMEPAGE_PRICING_ITEMS.forEach(item => {
      if (!designItemIds.has(item.id)) return;
      let quantity = 1;
      let price = item.basePrice;
      if (item.isQuantifiable === true && designPageCountMap.has(item.id)) {
        const pageCount = designPageCountMap.get(item.id);
        quantity = pageCount !== undefined ? pageCount : 1;
        const selectedOption = PAGE_COUNT_OPTIONS.find(opt => opt.value === quantity);
        price = calculatePagePrice(item.basePrice, quantity, selectedOption?.multiplier);
      }
      items.push({ itemId: item.id, quantity, price });
    });
    return items;
  }, [designItemIds, designPageCountMap]);

  // 両プラン合算の料金計算
  const calculation = useMemo(() => {
    return calculatePrice(codingSelectedItems, designSelectedItems, isUrgent);
  }, [codingSelectedItems, designSelectedItems, isUrgent]);

  const totalSelectedCount = codingSelectedItems.length + designSelectedItems.length;

  // 状態を保存
  useEffect(() => {
    if (totalSelectedCount > 0) {
      saveState({
        codingItems: codingSelectedItems,
        designItems: designSelectedItems,
        selectedPlan: activeTab,
        isUrgent,
      });
    }
  }, [codingSelectedItems, designSelectedItems, activeTab, isUrgent, totalSelectedCount]);

  // プランタブ切り替え（coding / design）
  const handleTabChange = (planId: PlanType) => {
    if (planId === 'urgent') {
      // 特急案件は items タブを変えず isUrgent をトグル
      setIsUrgent(prev => !prev);
      return;
    }
    setActiveTab(planId);
  };

  // その他の機能モーダル: チェックボックストグル（一時選択）
  const handleOtherFunctionToggle = (fnId: string) => {
    setTempOtherFunctionsIds(prev => {
      const next = new Set(prev);
      if (next.has(fnId)) next.delete(fnId);
      else next.add(fnId);
      return next;
    });
  };

  // その他の機能モーダル: 確定
  const handleOtherFunctionsConfirm = () => {
    setConfirmedOtherFunctionsIds(new Set(tempOtherFunctionsIds));
    const newCodingIds = new Set(codingItemIds);
    if (tempOtherFunctionsIds.size > 0) {
      newCodingIds.add('other-functions');
    } else {
      newCodingIds.delete('other-functions');
    }
    setCodingItemIds(newCodingIds);
    setIsOtherFunctionsModalOpen(false);
  };

  // その他の機能モーダル: キャンセル（変更を破棄）
  const handleOtherFunctionsCancel = () => {
    setIsOtherFunctionsModalOpen(false);
  };

  // その他の機能モーダル: 一時選択をすべてリセット
  const handleOtherFunctionsReset = () => {
    setTempOtherFunctionsIds(new Set());
  };

  // 項目トグル（どちらのプランの項目かを自動判定）
  const handleItemToggle = (itemId: string) => {
    // other-functions は複数選択モーダルを開く
    if (itemId === 'other-functions') {
      setTempOtherFunctionsIds(new Set(confirmedOtherFunctionsIds));
      setIsOtherFunctionsModalOpen(true);
      return;
    }

    const itemPlan = getItemPlan(itemId);
    if (itemPlan === null) return;

    if (itemPlan === 'coding') {
      const item = PRICING_ITEMS.find(p => p.id === itemId);
      if (item === undefined) return;

      if (codingItemIds.has(itemId)) {
        const newIds = new Set(codingItemIds);
        newIds.delete(itemId);
        setCodingItemIds(newIds);
        if (codingPageCountMap.has(itemId)) {
          const newMap = new Map(codingPageCountMap);
          newMap.delete(itemId);
          setCodingPageCountMap(newMap);
        }
      } else {
        const newIds = new Set(codingItemIds);
        newIds.add(itemId);
        setCodingItemIds(newIds);
        if (item.isQuantifiable === true) {
          setCurrentPageItem(itemId);
          setIsPageModalOpen(true);
        }
      }
    } else {
      const item = HOMEPAGE_PRICING_ITEMS.find(p => p.id === itemId);
      if (item === undefined) return;

      if (designItemIds.has(itemId)) {
        const newIds = new Set(designItemIds);
        newIds.delete(itemId);
        setDesignItemIds(newIds);
        if (designPageCountMap.has(itemId)) {
          const newMap = new Map(designPageCountMap);
          newMap.delete(itemId);
          setDesignPageCountMap(newMap);
        }
      } else {
        const newIds = new Set(designItemIds);
        newIds.add(itemId);
        setDesignItemIds(newIds);
        if (item.isQuantifiable === true) {
          setCurrentPageItem(itemId);
          setIsPageModalOpen(true);
        }
      }
    }
  };

  // ページ数選択
  const handlePageCountSelect = (value: number) => {
    if (currentPageItem !== null) {
      const itemPlan = getItemPlan(currentPageItem);
      if (itemPlan === 'coding') {
        const newMap = new Map(codingPageCountMap);
        newMap.set(currentPageItem, value);
        setCodingPageCountMap(newMap);
      } else if (itemPlan === 'design') {
        const newMap = new Map(designPageCountMap);
        newMap.set(currentPageItem, value);
        setDesignPageCountMap(newMap);
      }
    }
    setIsPageModalOpen(false);
    setCurrentPageItem(null);
  };

  // 見積書作成
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
      selectedPlan: activeTab,
      hasCodingItems: codingSelectedItems.length > 0,
      hasDesignItems: designSelectedItems.length > 0,
    };

    setEstimateData(estimate);
    setShowEstimate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 最初に戻る
  const handleBackToSimulator = () => {
    setShowEstimate(false);
    setEstimateData(null);
  };

  // リセット
  const handleReset = () => {
    if (confirm('すべての選択をリセットしますか？')) {
      setCodingItemIds(new Set());
      setDesignItemIds(new Set());
      setCodingPageCountMap(new Map());
      setDesignPageCountMap(new Map());
      setConfirmedOtherFunctionsIds(new Set());
      setTempOtherFunctionsIds(new Set());
      setIsUrgent(false);
      setActiveTab('coding');
      clearState();
    }
  };

  // モーダルのタイトルとオプションを解決
  const resolveModalOptions = () => {
    if (currentPageItem === null) return { title: 'ページ数を選択してください', options: PAGE_COUNT_OPTIONS };
    const codingItem = PRICING_ITEMS.find(p => p.id === currentPageItem);
    const designItem = HOMEPAGE_PRICING_ITEMS.find(p => p.id === currentPageItem);
    const item = codingItem ?? designItem;
    if (item === undefined) return { title: 'ページ数を選択してください', options: PAGE_COUNT_OPTIONS };
    const isAnimation = item.id.includes('-animation');
    return {
      title: isAnimation ? 'アニメーションの数量を選択してください' : 'ページ数を選択してください',
      options: isAnimation ? ANIMATION_COUNT_OPTIONS : PAGE_COUNT_OPTIONS,
    };
  };

  const { title: modalTitle, options: modalOptions } = resolveModalOptions();

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

      {/* アクセシビリティ: 価格変更の通知（スクリーンリーダー用） */}
      <div aria-live="polite" aria-atomic="true" className="screenReader-only">
        {totalSelectedCount > 0 && (
          `選択された項目: ${totalSelectedCount}件、合計金額: ${calculation.total.toLocaleString()}円`
        )}
      </div>

      {/* プラン選択 */}
      <div className="pricing-simulator__plans">
        <h3 className="pricing-simulator__section-title">プラン</h3>
        <div className="pricing-simulator__plan-grid">
          {PLANS.map(plan => {
            const isActive = plan.id === 'urgent' ? isUrgent : activeTab === plan.id;

            return (
              <button
                key={plan.id}
                type="button"
                {...(isActive ? { 'aria-pressed': 'true' as const } : { 'aria-pressed': 'false' as const })}
                className={`pricing-plan-button${isActive ? ' pricing-plan-button--active' : ''}`}
                onClick={() => handleTabChange(plan.id)}
              >
                {plan.icon !== undefined && plan.icon !== '' && (
                  <IconifyInline icon={plan.icon} width="24" height="24" />
                )}
                <span>{plan.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 項目選択（アクティブタブに応じて表示切替） */}
      <div
        className="pricing-simulator__items"
        role="tabpanel"
        aria-label={activeTab === 'design' ? 'ホームページ制作の項目' : 'コーディングの項目'}
      >
        <h3 className="pricing-simulator__section-title">項目</h3>
        <div className="pricing-simulator__item-grid">
          {activeTab === 'coding'
            ? PRICING_ITEMS.map(item => (
                <PricingItemButton
                  key={item.id}
                  item={item}
                  isSelected={codingItemIds.has(item.id)}
                  onToggle={handleItemToggle}
                  quantity={codingPageCountMap.get(item.id)}
                  selectedFunctions={item.id === 'other-functions' ? [...confirmedOtherFunctionsIds] : undefined}
                />
              ))
            : HOMEPAGE_PRICING_ITEMS.map(item => (
                <PricingItemButton
                  key={item.id}
                  item={item}
                  isSelected={designItemIds.has(item.id)}
                  onToggle={handleItemToggle}
                  quantity={designPageCountMap.get(item.id)}
                />
              ))}
        </div>
      </div>

      {/* 金額サマリー */}
      {totalSelectedCount > 0 && (
        <EstimateSummary calculation={calculation} isUrgent={isUrgent} />
      )}

      {/* アクションボタン */}
      <div className="pricing-simulator__actions">
        <button
          type="button"
          className="pricing-simulator__button pricing-simulator__button--reset"
          onClick={handleReset}
          disabled={totalSelectedCount === 0}
        >
          やり直し
        </button>
        <button
          type="button"
          className="pricing-simulator__button pricing-simulator__button--generate"
          onClick={handleGenerateEstimate}
          disabled={totalSelectedCount === 0}
        >
          この結果で概算見積書を作成
        </button>
      </div>

      {/* ページ数 / アニメーション数量選択モーダル */}
      <ModalDialog
        isOpen={isPageModalOpen}
        onClose={() => {
          setIsPageModalOpen(false);
          setCurrentPageItem(null);
        }}
        title={modalTitle}
      >
        <div className="page-count-options">
          {modalOptions.map(option => (
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

      {/* その他の機能 複数選択モーダル */}
      <ModalDialog
        isOpen={isOtherFunctionsModalOpen}
        onClose={handleOtherFunctionsCancel}
        title="その他の機能を選択してください"
      >
        <div className="other-functions-options">
          {OTHER_FUNCTIONS_OPTIONS.map(fn => (
            <label key={fn.id} className="other-function-option">
              <input
                type="checkbox"
                className="other-function-option__checkbox"
                checked={tempOtherFunctionsIds.has(fn.id)}
                onChange={() => handleOtherFunctionToggle(fn.id)}
              />
              <span className="other-function-option__name">{fn.name}</span>
            </label>
          ))}
        </div>
        <div className="other-functions-modal-actions">
          <button
            type="button"
            className="other-functions-reset-button"
            onClick={handleOtherFunctionsReset}
          >
            リセット
          </button>
          <button
            type="button"
            className="other-functions-confirm-button"
            onClick={handleOtherFunctionsConfirm}
          >
            確定
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}
