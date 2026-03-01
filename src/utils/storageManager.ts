import type { SavedState, SelectedItem } from '../types/pricing';

const STORAGE_KEY = 'pricing-simulator-state';

/**
 * 状態を保存
 */
export function saveState(state: SavedState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/**
 * 状態を読み込み（旧スキーマからのマイグレーション対応）
 */
export function loadState(): SavedState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null || serialized.trim() === '') {
      return null;
    }
    const parsed = JSON.parse(serialized) as Record<string, unknown>;

    // 旧スキーマ（selectedItems）から新スキーマへのマイグレーション
    if ('selectedItems' in parsed && !('codingItems' in parsed)) {
      return {
        codingItems: (parsed.selectedItems as SelectedItem[]) ?? [],
        designItems: [],
        selectedPlan: (parsed.selectedPlan as SavedState['selectedPlan']) ?? 'coding',
        isUrgent: (parsed.isUrgent as boolean) ?? false,
      };
    }

    return parsed as unknown as SavedState;
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}

/**
 * 状態をクリア
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state:', error);
  }
}
