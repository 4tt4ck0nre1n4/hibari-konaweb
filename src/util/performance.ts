/**
 * パフォーマンス最適化ユーティリティ
 * メインスレッド処理の最適化のためのヘルパー関数
 */

/**
 * デバウンス関数: 連続して呼び出される関数の実行を遅延させる
 * @param func 実行する関数
 * @param wait 待機時間（ミリ秒）
 * @returns デバウンスされた関数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * スロットル関数: 関数の実行頻度を制限する
 * @param func 実行する関数
 * @param limit 実行間隔（ミリ秒）
 * @returns スロットルされた関数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * prefers-reduced-motionの設定を確認
 * @returns アニメーションを減らすべきかどうか
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * アニメーションを条件付きで実行する
 * @param callback アニメーション実行関数
 * @param fallback アニメーションをスキップする場合のフォールバック関数（オプション）
 */
export function conditionalAnimation(
  callback: () => void,
  fallback?: () => void
): void {
  if (prefersReducedMotion()) {
    if (fallback) {
      fallback();
    }
    return;
  }
  callback();
}
