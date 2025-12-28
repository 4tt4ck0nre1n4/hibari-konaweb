/**
 * GridMenuアニメーション初期化スクリプト
 * TBT改善のため、requestIdleCallbackで遅延初期化
 */

// 開発環境判定
const isDev = typeof window !== "undefined" && (window as Window & { __DEV__?: boolean }).__DEV__ === true;

function devLog(...args: unknown[]): void {
  if (isDev) {
    console.log(...args);
  }
}

/**
 * GridMenuのアニメーション初期化
 */
function initGridMenuAnimations(): void {
  if (typeof gsap === "undefined") {
    devLog("⏳ GSAP not loaded yet, retrying...");
    // requestIdleCallbackで再試行
    if ("requestIdleCallback" in window) {
      requestIdleCallback(
        () => {
          setTimeout(initGridMenuAnimations, 100);
        },
        { timeout: 2000 }
      );
    } else {
      setTimeout(initGridMenuAnimations, 100);
    }
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    devLog("✅ ScrollTrigger registered for GridMenu");
  }

  // Tooltipのアニメーション
  // view transitionsではDOMが完全に置き換えられるため、新しい要素に対してイベントリスナーを追加
  const menuItems = document.querySelectorAll(".grid__menu_item");

  // 大量のDOM操作を避けるため、一度に処理する要素数を制限
  const processItems = (items: NodeListOf<Element>, startIndex: number, batchSize: number = 5) => {
    const endIndex = Math.min(startIndex + batchSize, items.length);

    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      if (!item) continue;

      const tooltipRight = item.querySelector(".item__tooltip_right");
      const tooltipLeft = item.querySelector(".item__tooltip_left");

      item.addEventListener("mouseenter", () => {
        [tooltipRight, tooltipLeft].forEach((tooltip) => {
          if (tooltip) {
            gsap.to(tooltip, {
              opacity: 1,
              y: -10,
              duration: 0.3,
              ease: "power1.out",
            });
          }
        });
      });

      item.addEventListener("mouseleave", () => {
        [tooltipRight, tooltipLeft].forEach((tooltip) => {
          if (tooltip) {
            gsap.to(tooltip, {
              opacity: 0,
              y: 0,
              duration: 0.3,
              ease: "power1.in",
            });
          }
        });
      });
    }

    // 次のバッチを処理
    if (endIndex < items.length) {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            processItems(items, endIndex, batchSize);
          },
          { timeout: 100 }
        );
      } else {
        setTimeout(() => {
          processItems(items, endIndex, batchSize);
        }, 0);
      }
    }
  };

  if (menuItems.length > 0) {
    processItems(menuItems, 0);
    devLog("✅ GridMenu animations initialized");
  }
}

/**
 * 初期化関数（requestIdleCallbackで遅延実行）
 */
export function initGridMenuAnimationsDeferred(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(initGridMenuAnimations, { timeout: 2000 });
      } else {
        setTimeout(initGridMenuAnimations, 100);
      }
    });
  } else {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initGridMenuAnimations, { timeout: 2000 });
    } else {
      setTimeout(initGridMenuAnimations, 100);
    }
  }

  // View Transitions対応: ページ遷移時に再初期化
  // イベントリスナーの重複登録を防ぐため、一度だけ登録
  if (typeof window !== "undefined") {
    const win = window as Window & { __gridMenuAnimationsSwapListenerAdded?: boolean };
    if (win.__gridMenuAnimationsSwapListenerAdded !== true) {
      win.__gridMenuAnimationsSwapListenerAdded = true;
      document.addEventListener("astro:after-swap", () => {
        // 既存のイベントリスナーをクリーンアップするため、要素を再取得
        initGridMenuAnimations();
      });
    }
  }
}

// 自動初期化は GridMenu.astro で明示的に呼び出されるため、ここでは実行しない
// モジュールとして直接読み込まれた場合のフォールバック
if (typeof window !== "undefined") {
  const win = window as Window & { __gridMenuAnimationsInitialized?: boolean };
  if (win.__gridMenuAnimationsInitialized !== true) {
    win.__gridMenuAnimationsInitialized = true;
    initGridMenuAnimationsDeferred();
  }
}
