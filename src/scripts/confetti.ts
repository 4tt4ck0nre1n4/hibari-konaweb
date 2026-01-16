// 開発環境判定（ブラウザ内での実行時）
// window.__DEV__ が設定されている場合はそれを使用、なければホスト名で判定
const isDev =
  typeof window !== "undefined" &&
  ((window as unknown as { __DEV__?: boolean }).__DEV__ === true ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local"));

function devLog(...args: unknown[]): void {
  if (isDev) {
    console.log(...args);
  }
}

function devError(...args: unknown[]): void {
  // エラーは常に出力（本番環境でも必要）
  console.error(...args);
}

// JSConfettiの型定義
type JSConfettiInstance = InstanceType<typeof import("js-confetti").default>;
type JSConfettiConstructor = typeof import("js-confetti").default;

// グローバル変数でインスタンスとリスナーを管理
let jsConfettiInstance: JSConfettiInstance | null = null;
let JSConfettiClass: JSConfettiConstructor | null = null;
let resizeHandler: (() => void) | null = null;
let clickHandler: (() => void) | null = null;

function initConfetti() {
  devLog("initConfetti called");
  const confetti: HTMLElement | null = document.getElementById("confettiButton");
  const canvasElement = document.getElementById("canvas");
  const textCanvasElement = document.getElementById("confetti-text-canvas");

  devLog("confettiButton:", confetti);
  devLog("canvas:", canvasElement);
  devLog("textCanvas:", textCanvasElement);

  if (canvasElement instanceof HTMLCanvasElement && textCanvasElement instanceof HTMLCanvasElement) {
    devLog("Canvas elements found, initializing...");
    // 高DPI対応のためのスケールファクター
    const devicePixelRatio = window.devicePixelRatio ?? 1;

    // 既存のインスタンスを破棄
    if (jsConfettiInstance) {
      jsConfettiInstance = null;
    }

    // 既存のイベントリスナーを削除
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }

    if (clickHandler && confetti) {
      confetti.removeEventListener("click", clickHandler);
      clickHandler = null;
    }

    // 強制リフローを避けるため、requestAnimationFrame内でgetBoundingClientRectを実行
    // canvasのサイズ設定とJSConfettiインスタンスの作成を同じフレーム内で実行
    requestAnimationFrame(() => {
      // 全画面canvas（confettiアニメーション用）の設定
      const rect = canvasElement.getBoundingClientRect();
      canvasElement.width = rect.width * devicePixelRatio;
      canvasElement.height = rect.height * devicePixelRatio;

      // テキスト表示用canvas（sidebar内）の設定
      const textRect = textCanvasElement.getBoundingClientRect();
      textCanvasElement.width = textRect.width * devicePixelRatio;
      textCanvasElement.height = textRect.height * devicePixelRatio;

      // 新しいJSConfettiインスタンスを作成（canvasサイズ設定後に実行）
      if (!JSConfettiClass) {
        devError("JSConfetti class not loaded!");
        return;
      }
      jsConfettiInstance = new JSConfettiClass({ canvas: canvasElement });
      const context = textCanvasElement.getContext("2d");

      if (context) {
        // アニメーション中かどうかを追跡するフラグ
        let isAnimating = false;
        let currentOpacity = 0;

        const drawText = (opacity: number = 1) => {
          context.clearRect(0, 0, textCanvasElement.width, textCanvasElement.height);
          context.globalAlpha = opacity;
          currentOpacity = opacity;

          // デバイス検出とフォントサイズの計算
          const screenWidth = window.innerWidth;
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);

          let fontSize: number;

          if (screenWidth <= 480) {
            // スマホサイズ: デバイスに応じたフォントサイズ
            if (isIOS) {
              fontSize = 44; // iOS用
            } else if (isAndroid) {
              fontSize = 44; // Android用
            } else {
              fontSize = 40;
            }
          } else if (screenWidth <= 768) {
            // タブレットサイズ
            fontSize = 48;
          } else {
            // デスクトップサイズ
            fontSize = 20;
          }

          // より安全なフォント設定
          context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          context.fillStyle = "#00FFFF"; // aquaカラー
          context.textAlign = "center";
          context.textBaseline = "middle";

          const text = "Thank you for viewing my portfolio site!";

          // テキストの幅を測定して、必要に応じて調整
          const maxWidth = textCanvasElement.width * 0.9;
          const textMetrics = context.measureText(text);

          if (textMetrics.width > maxWidth) {
            // テキストが長すぎる場合はフォントサイズを調整
            const ratio = maxWidth / textMetrics.width;
            const minFontSize = screenWidth > 768 ? 28 : 28;
            fontSize = Math.max(minFontSize, fontSize * ratio);
            context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          }

          // テキストを描画（fillStyleを再設定して確実にaquaカラーを適用）
          context.fillStyle = "#00FFFF"; // aquaカラー
          const centerX = textCanvasElement.width / 2;
          const centerY = textCanvasElement.height / 2;
          context.fillText(text, centerX, centerY);
          // globalAlphaはリセットしない（アニメーション中に干渉を防ぐため）
        };

        // ウィンドウリサイズ時にキャンバスサイズとテキストサイズを再調整（デバウンス）
        let resizeTimer: ReturnType<typeof setTimeout> | null = null;
        resizeHandler = () => {
          if (resizeTimer) {
            clearTimeout(resizeTimer);
          }
          resizeTimer = setTimeout(() => {
            const newDevicePixelRatio = window.devicePixelRatio ?? 1;

            // 強制リフローを避けるため、requestAnimationFrame内でgetBoundingClientRectを実行
            requestAnimationFrame(() => {
              // 全画面canvas（confetti用）のリサイズ
              const rect = canvasElement.getBoundingClientRect();
              canvasElement.width = rect.width * newDevicePixelRatio;
              canvasElement.height = rect.height * newDevicePixelRatio;

              // テキスト表示用canvas（sidebar内）のリサイズ
              const textRect = textCanvasElement.getBoundingClientRect();
              textCanvasElement.width = textRect.width * newDevicePixelRatio;
              textCanvasElement.height = textRect.height * newDevicePixelRatio;

              // アニメーション中の場合は現在の透明度で再描画
              if (isAnimating && currentOpacity > 0) {
                drawText(currentOpacity);
              } else if (!isAnimating && currentOpacity > 0) {
                // アニメーション中でない場合のみ、通常の透明度で再描画
                drawText();
              }
            });
          }, 250);
        };
        window.addEventListener("resize", resizeHandler);

        if (confetti) {
          devLog("Adding click listener to confetti button");
          clickHandler = () => {
            devLog("Confetti button clicked!");

            if (!jsConfettiInstance) {
              devError("JSConfetti instance not found!");
              return;
            }

            // まずテキストをクリア（既存のテキストを消す）
            context.clearRect(0, 0, textCanvasElement.width, textCanvasElement.height);
            currentOpacity = 0;
            isAnimating = true;

            jsConfettiInstance
              .addConfetti({
                emojis: ["💜", "💖", "🌈", "✨", "💫", "🌸", "thanks", "💛", "💗", "💘", "🌟", "happy"],
              })
              .then(() => jsConfettiInstance?.addConfetti({ confettiRadius: 3 }))
              .then(() => {
                // フェードイン（requestAnimationFrameで最適化）
                let opacity = 0;
                const fadeIn = (): void => {
                  if (opacity < 1) {
                    opacity += 0.05;
                    drawText(opacity);
                    requestAnimationFrame(fadeIn);
                  } else {
                    // 3秒間表示した後、フェードアウト
                    setTimeout(() => {
                      let fadeOpacity = 1;
                      const fadeOut = (): void => {
                        if (fadeOpacity > 0) {
                          fadeOpacity -= 0.05;
                          drawText(fadeOpacity);
                          requestAnimationFrame(fadeOut);
                        } else {
                          // 完全に消す
                          context.clearRect(0, 0, textCanvasElement.width, textCanvasElement.height);
                          currentOpacity = 0;
                          isAnimating = false;
                        }
                      };
                      requestAnimationFrame(fadeOut);
                    }, 3000);
                  }
                };
                requestAnimationFrame(fadeIn);
              })
              .catch((error) => {
                devError("Confetti animation failed:", error);
                isAnimating = false;
              });
          };
          confetti.addEventListener("click", clickHandler);
        } else {
          devError("confettiButton element not found!");
        }
      }
    });
  } else {
    // 要素が存在しない場合は静かに終了（エラーを出力しない）
    // これらの要素は特定のページにのみ存在するため、エラーとして扱わない
    return;
  }
}

/**
 * 初期化関数（requestIdleCallbackで遅延実行）
 * TBT改善のため、アイドル時間に初期化を実行
 */
export async function initConfettiDeferred(): Promise<void> {
  // JSConfettiを動的インポートで読み込む
  if (!JSConfettiClass) {
    try {
      const JSConfettiModule = await import("js-confetti");
      JSConfettiClass = JSConfettiModule.default;
      devLog("✅ JSConfetti loaded successfully");
    } catch (error) {
      devError("Failed to load JSConfetti:", error);
      return;
    }
  }

  // 初期化を実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(initConfetti, { timeout: 2000 });
      } else {
        setTimeout(initConfetti, 100);
      }
    });
  } else {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initConfetti, { timeout: 2000 });
    } else {
      setTimeout(initConfetti, 100);
    }
  }
}

// View Transitions対応: ページ遷移時に再初期化
// イベントリスナーの重複登録を防ぐため、一度だけ登録
if (typeof window !== "undefined") {
  const win = window as Window & { __confettiSwapListenerAdded?: boolean };
  if (win.__confettiSwapListenerAdded !== true) {
    win.__confettiSwapListenerAdded = true;
    document.addEventListener("astro:after-swap", () => {
      // 既存のインスタンスとリスナーをクリーンアップ
      if (jsConfettiInstance) {
        jsConfettiInstance = null;
      }
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
        resizeHandler = null;
      }
      if (clickHandler) {
        const confetti = document.getElementById("confettiButton");
        if (confetti) {
          confetti.removeEventListener("click", clickHandler);
        }
        clickHandler = null;
      }
      // 再初期化
      void initConfettiDeferred();
    });
  }
}

// 自動初期化（モジュールとして読み込まれた場合）
if (typeof window !== "undefined") {
  void initConfettiDeferred();
}
