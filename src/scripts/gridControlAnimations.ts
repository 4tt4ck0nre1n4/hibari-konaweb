/**
 * GridControlアニメーション初期化スクリプト
 * TBT改善のため、requestIdleCallbackで遅延初期化
 */

// 開発環境判定
const isDev = typeof window !== "undefined" && (window as Window & { __DEV__?: boolean }).__DEV__ === true;

function devLog(...args: unknown[]): void {
  if (isDev) {
    console.log(...args);
  }
}

function devWarn(...args: unknown[]): void {
  if (isDev) {
    console.warn(...args);
  }
}

function devError(...args: unknown[]): void {
  console.error(...args);
}

/**
 * prefers-reduced-motionの設定を確認
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * GSAPとScrollTriggerの読み込みを待つ
 */
function initializeApp(): void {
  devLog("🔍 Initializing grid control animations...");

  // prefers-reduced-motionが有効な場合はアニメーションをスキップ
  if (prefersReducedMotion()) {
    devLog("⏭️ prefers-reduced-motion is enabled, skipping animations");
    return;
  }

  if (typeof gsap === "undefined") {
    devWarn("⚠️ GSAP not loaded yet, retrying in 100ms...");
    if ("requestIdleCallback" in window) {
      requestIdleCallback(
        () => {
          setTimeout(initializeApp, 100);
        },
        { timeout: 2000 }
      );
    } else {
      setTimeout(initializeApp, 100);
    }
    return;
  }

  devLog("✅ GSAP loaded successfully");

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    devLog("✅ ScrollTrigger registered");
  }

  // サウンド初期化（遅延読み込み）
  let buttonSound: HTMLAudioElement | null = null;
  const initSound = () => {
    if (!buttonSound) {
      buttonSound = new Audio("/sounds/buttonSound.mp3");
    }
  };

  function playSound(): void {
    const isSoundOn = localStorage.getItem("sound-enabled") === "true";
    if (isSoundOn) {
      if (!buttonSound) {
        initSound();
      }
      try {
        if (buttonSound) {
          buttonSound.currentTime = 0;
          void buttonSound.play();
        }
      } catch (error) {
        devError("Sound playback failed:", error);
      }
    }
  }

  // GSAPのTween型を使用（型安全性のためanyを使用）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tweens: any[] = [];

  function createTween(gsapInstance: typeof gsap, selector: string, props: Record<string, unknown>): void {
    // 要素が存在するかチェック（GSAPの警告を防ぐため）
    const element = document.querySelector(selector);
    if (!element) {
      // 要素が存在しない場合は静かに終了（警告を出力しない）
      return;
    }
    const tween = gsapInstance.to(selector, {
      ...props,
      paused: true,
    });
    tweens.push(tween);
  }

  // 画面サイズとデバイスに応じたアニメーション設定
  const getAnimationSettings = (): Array<[string, Record<string, unknown>]> => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 768;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let item4X: number;
    let item6X: number;

    if (isMobile) {
      if (isIOS) {
        item4X = 250;
        item6X = -250;
      } else if (isAndroid) {
        item4X = 264;
        item6X = -264;
      } else {
        item4X = 254;
        item6X = -254;
      }
    } else {
      item4X = 440;
      item6X = -440;
    }

    return [
      [".item-1", { y: 230, rotation: 720, duration: 1.2 }],
      [".item-2", { y: 230, rotation: 360, duration: 1.6 }],
      [".item-3", { y: 230, rotation: 720, duration: 2 }],
      [".item-4", { x: item4X, rotation: 360, duration: 2.3 }],
      [".item-5", { x: 0, rotation: 1080, duration: 2.6 }],
      [".item-6", { x: item6X, rotation: 360, duration: 2.3 }],
      [".item-7", { y: -230, rotation: 720, duration: 1.4 }],
      [".item-8", { y: -230, rotation: 360, duration: 1.8 }],
      [".item-9", { y: -230, rotation: 720, duration: 2.2 }],
      [".item-10", { y: -230, rotation: 720, duration: 1.4 }],
      [".item-11", { y: -230, rotation: 360, duration: 1.8 }],
      [".item-12", { y: -230, rotation: 720, duration: 2.2 }],
    ];
  };

  // アニメーション設定を適用（バッチ処理でTBTを削減）
  const applyAnimationSettings = (): void => {
    const animationSettings = getAnimationSettings();

    // 一度に全て作成せず、バッチ処理で分割
    const processBatch = (startIndex: number, batchSize: number = 4): void => {
      const endIndex = Math.min(startIndex + batchSize, animationSettings.length);

      for (let i = startIndex; i < endIndex; i++) {
        const setting = animationSettings[i];
        if (!setting) continue;
        const [selector, props] = setting;
        createTween(gsap, selector, props);
      }

      if (endIndex < animationSettings.length) {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(
            () => {
              processBatch(endIndex, batchSize);
            },
            { timeout: 100 }
          );
        } else {
          setTimeout(() => {
            processBatch(endIndex, batchSize);
          }, 0);
        }
      }
    };

    processBatch(0);
  };

  applyAnimationSettings();

  // リサイズイベントのデバウンス
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(() => {
      // 既存のtweenをクリア
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      tweens.forEach((tween) => tween.kill());
      tweens.length = 0;

      // 新しい設定でtweenを作成
      const newAnimationSettings = getAnimationSettings();
      newAnimationSettings.forEach((setting) => {
        const [selector, props] = setting;
        createTween(gsap, selector, props);
      });
    }, 250);
  });

  // restartボタンの回転アニメーション
  const rotateRestartButton = (): void => {
    const restartButton = document.getElementById("restart");
    if (!restartButton) return;
    if (typeof gsap === "undefined") return;

    gsap.fromTo(
      restartButton,
      {
        rotation: 0,
        scale: 1,
      },
      {
        rotation: 720,
        scale: 1.3,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(restartButton, {
            clearProps: "rotation, scale",
          });
        },
      }
    );
  };

  // 時刻アニメーション（1秒ごとのチェックで十分なためsetIntervalを使用）
  const rotateRestartButtonTimeInterval = (): void => {
    let lastSecond = -1;

    const checkTime = (): void => {
      const seconds = new Date().getSeconds();

      if ((seconds === 0 || seconds === 30) && seconds !== lastSecond) {
        rotateRestartButton();
        lastSecond = seconds;
      } else if (seconds !== 0 && seconds !== 30) {
        lastSecond = -1;
      }
    };

    setInterval(checkTime, 1000);
  };

  rotateRestartButtonTimeInterval();

  function initButtonEvents(): void {
    function updateTooltipClassByPosition(): void {
      // フェーズ1: すべてのDOM読み取りを一度に実行
      const item4 = document.querySelector(".item-4");
      const item6 = document.querySelector(".item-6");
      if (!item4 || !item6) return;

      const tooltip4 = item4.querySelector(".item__tooltip_left, .item__tooltip_right");
      const tooltip6 = item6.querySelector(".item__tooltip_left, .item__tooltip_right");

      // 強制リフローを避けるため、requestAnimationFrame内でgetBoundingClientRectを実行
      requestAnimationFrame(() => {
        // フェーズ2: すべてのレイアウト情報を一度に読み取る
        const rect4 = item4.getBoundingClientRect();
        const rect6 = item6.getBoundingClientRect();

        // フェーズ3: 必要な更新を計算
        const tooltip4Class = rect4.left < rect6.left ? "item__tooltip_left" : "item__tooltip_right";
        const tooltip6Class = rect6.left < rect4.left ? "item__tooltip_left" : "item__tooltip_right";

        // フェーズ4: すべての書き込みを一度に実行（リフローを最小化）
        if (tooltip4) {
          tooltip4.classList.remove("item__tooltip_left", "item__tooltip_right");
          tooltip4.classList.add(tooltip4Class);
        }

        if (tooltip6) {
          tooltip6.classList.remove("item__tooltip_left", "item__tooltip_right");
          tooltip6.classList.add(tooltip6Class);
        }
      });
    }

    function playAll(): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      tweens.forEach((tween) => tween.play());
      updateTooltipClassByPosition();
      playSound();
    }
    function pauseAll(): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      tweens.forEach((tween) => tween.pause());
      updateTooltipClassByPosition();
      playSound();
    }
    function reverseAll(): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      tweens.forEach((tween) => tween.reverse());
      updateTooltipClassByPosition();
      playSound();
    }
    function restartAll(): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      tweens.forEach((tween) => tween.restart());
      updateTooltipClassByPosition();
      playSound();
    }

    // グローバルスコープに公開（プレースホルダーを実際の関数に置き換え）
    const win = window as Window & {
      __playAll?: () => void;
      __pauseAll?: () => void;
      __reverseAll?: () => void;
      __restartAll?: () => void;
      playAll?: () => void;
      pauseAll?: () => void;
      reverseAll?: () => void;
      restartAll?: () => void;
    };
    win.__playAll = playAll;
    win.__pauseAll = pauseAll;
    win.__reverseAll = reverseAll;
    win.__restartAll = restartAll;

    // プレースホルダー関数を実際の関数に置き換え
    win.playAll = playAll;
    win.pauseAll = pauseAll;
    win.reverseAll = reverseAll;
    win.restartAll = restartAll;

    document.getElementById("play")?.addEventListener("click", playAll);
    document.getElementById("pause")?.addEventListener("click", pauseAll);
    document.getElementById("reverse")?.addEventListener("click", reverseAll);
    document.getElementById("restart")?.addEventListener("click", restartAll);

    const controlMenu = document.querySelector(".control__menu");
    const buttons = document.querySelectorAll(".button");

    // 各ボタンの回転タイムアウトを管理
    const buttonRotationTimeouts = new Map<Element, ReturnType<typeof setTimeout>>();

    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        const existingTimeout = buttonRotationTimeouts.get(button);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          buttonRotationTimeouts.delete(button);
        }

        button.classList.remove("reset-rotation");
        button.classList.add("is-rotating");

        const timeoutId = setTimeout(() => {
          button.classList.remove("is-rotating");
          button.classList.add("reset-rotation");
          button.addEventListener(
            "transitionend",
            () => {
              button.classList.remove("reset-rotation");
            },
            {
              once: true,
            }
          );
          buttonRotationTimeouts.delete(button);
        }, 3000);

        buttonRotationTimeouts.set(button, timeoutId);
      });

      button.addEventListener("mouseleave", () => {
        const timeoutId = buttonRotationTimeouts.get(button);
        if (timeoutId) {
          clearTimeout(timeoutId);
          buttonRotationTimeouts.delete(button);
        }

        button.classList.remove("is-rotating");
      });
    });

    controlMenu?.addEventListener("mouseleave", () => {
      buttons.forEach((button) => {
        const timeoutId = buttonRotationTimeouts.get(button);
        if (timeoutId) {
          clearTimeout(timeoutId);
          buttonRotationTimeouts.delete(button);
        }

        button.classList.remove("is-rotating");
        button.classList.add("reset-rotation");
        button.addEventListener(
          "transitionend",
          () => {
            button.classList.remove("reset-rotation");
          },
          {
            once: true,
          }
        );
      });
    });
  }

  // ボタンイベントの初期化
  initButtonEvents();
  devLog("✅ Grid control animations initialized");
}

/**
 * グローバル関数のプレースホルダー（早期定義）
 * onclick属性が機能するように、初期化前にプレースホルダーを定義
 */
function setupGlobalFunctionPlaceholders(): void {
  const win = window as Window & {
    __playAll?: () => void;
    __pauseAll?: () => void;
    __reverseAll?: () => void;
    __restartAll?: () => void;
    playAll?: () => void;
    pauseAll?: () => void;
    reverseAll?: () => void;
    restartAll?: () => void;
  };

  // 既に定義されている場合はスキップ
  if (win.playAll && win.__playAll) {
    return;
  }

  // プレースホルダー関数を早期に定義（初期化前でもエラーにならないように）
  win.playAll = () => {
    if (typeof win.__playAll === "function") {
      win.__playAll();
    } else {
      // 初期化が完了するまで待機（最大1秒）
      let attempts = 0;
      const checkInit = setInterval(() => {
        attempts++;
        if (typeof win.__playAll === "function") {
          clearInterval(checkInit);
          win.__playAll?.();
        } else if (attempts >= 20) {
          clearInterval(checkInit);
          console.warn("playAll initialization timeout");
        }
      }, 50);
    }
  };
  win.pauseAll = () => {
    if (typeof win.__pauseAll === "function") {
      win.__pauseAll();
    } else {
      let attempts = 0;
      const checkInit = setInterval(() => {
        attempts++;
        if (typeof win.__pauseAll === "function") {
          clearInterval(checkInit);
          win.__pauseAll?.();
        } else if (attempts >= 20) {
          clearInterval(checkInit);
          console.warn("pauseAll initialization timeout");
        }
      }, 50);
    }
  };
  win.reverseAll = () => {
    if (typeof win.__reverseAll === "function") {
      win.__reverseAll();
    } else {
      let attempts = 0;
      const checkInit = setInterval(() => {
        attempts++;
        if (typeof win.__reverseAll === "function") {
          clearInterval(checkInit);
          win.__reverseAll?.();
        } else if (attempts >= 20) {
          clearInterval(checkInit);
          console.warn("reverseAll initialization timeout");
        }
      }, 50);
    }
  };
  win.restartAll = () => {
    if (typeof win.__restartAll === "function") {
      win.__restartAll();
    } else {
      let attempts = 0;
      const checkInit = setInterval(() => {
        attempts++;
        if (typeof win.__restartAll === "function") {
          clearInterval(checkInit);
          win.__restartAll?.();
        } else if (attempts >= 20) {
          clearInterval(checkInit);
          console.warn("restartAll initialization timeout");
        }
      }, 50);
    }
  };
}

/**
 * 初期化関数（requestIdleCallbackで遅延実行）
 */
export function initGridControlAnimationsDeferred(): void {
  // 早期にプレースホルダーを設定
  if (typeof window !== "undefined") {
    setupGlobalFunctionPlaceholders();
  }

  // GSAPが読み込まれたことを確認してから初期化を開始
  function waitForGSAPAndInit(): void {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      devLog("✅ GSAP and ScrollTrigger are ready, initializing app...");
      if (document.readyState === "loading") {
        devLog("🔍 Document still loading, waiting for DOMContentLoaded...");
        document.addEventListener("DOMContentLoaded", () => {
          if ("requestIdleCallback" in window) {
            requestIdleCallback(initializeApp, { timeout: 2000 });
          } else {
            setTimeout(initializeApp, 100);
          }
        });
      } else {
        devLog("🔍 Document already loaded, initializing immediately...");
        if ("requestIdleCallback" in window) {
          requestIdleCallback(initializeApp, { timeout: 2000 });
        } else {
          setTimeout(initializeApp, 100);
        }
      }
    } else {
      devLog("⏳ Waiting for GSAP to load...");
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            setTimeout(waitForGSAPAndInit, 100);
          },
          { timeout: 2000 }
        );
      } else {
        setTimeout(waitForGSAPAndInit, 100);
      }
    }
  }

  // window.onloadイベントでも初期化を試みる（フォールバック）
  window.addEventListener("load", () => {
    devLog("🔍 Window load event fired");
    waitForGSAPAndInit();
  });

  // 即座にも試行（既に読み込まれている場合）
  waitForGSAPAndInit();
}

// 自動初期化は index.astro で明示的に呼び出されるため、ここでは実行しない
// モジュールとして直接読み込まれた場合のフォールバック
if (typeof window !== "undefined") {
  const win = window as Window & { __gridControlAnimationsInitialized?: boolean };
  if (win.__gridControlAnimationsInitialized !== true) {
    win.__gridControlAnimationsInitialized = true;
    initGridControlAnimationsDeferred();
  }

  // View Transitions対応: ページ遷移時に再初期化
  document.addEventListener("astro:after-swap", () => {
    // フラグをリセットして再初期化を許可
    const resetWin = window as Window & { __gridControlAnimationsInitialized?: boolean };
    resetWin.__gridControlAnimationsInitialized = false;
    // 再初期化
    initGridControlAnimationsDeferred();
  });
}
