import type { SavedState } from '../types/pricing';

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
 * 状態を読み込み
 */
export function loadState(): SavedState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized) as SavedState;
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

