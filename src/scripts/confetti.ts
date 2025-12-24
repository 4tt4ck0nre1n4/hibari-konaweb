import JSConfetti from "js-confetti";

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

    // 全画面canvas（confettiアニメーション用）の設定
    const rect = canvasElement.getBoundingClientRect();
    canvasElement.width = rect.width * devicePixelRatio;
    canvasElement.height = rect.height * devicePixelRatio;

    // テキスト表示用canvas（sidebar内）の設定
    const textRect = textCanvasElement.getBoundingClientRect();
    textCanvasElement.width = textRect.width * devicePixelRatio;
    textCanvasElement.height = textRect.height * devicePixelRatio;

    const jsConfetti = new JSConfetti({ canvas: canvasElement });
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

      // ウィンドウリサイズ時にキャンバスサイズとテキストサイズを再調整
      window.addEventListener("resize", () => {
        const newDevicePixelRatio = window.devicePixelRatio ?? 1;

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

      if (confetti) {
        devLog("Adding click listener to confetti button");
        confetti.addEventListener("click", () => {
          devLog("Confetti button clicked!");

          // まずテキストをクリア（既存のテキストを消す）
          context.clearRect(0, 0, textCanvasElement.width, textCanvasElement.height);
          currentOpacity = 0;
          isAnimating = true;

          jsConfetti
            .addConfetti({
              emojis: ["💜", "💖", "🌈", "✨", "💫", "🌸", "thanks", "💛", "💗", "💘", "🌟", "happy"],
            })
            .then(() => jsConfetti.addConfetti({ confettiRadius: 3 }))
            .then(() => {
              // フェードイン
              let opacity = 0;
              const fadeIn = setInterval(() => {
                if (opacity < 1) {
                  opacity += 0.05;
                  drawText(opacity);
                } else {
                  clearInterval(fadeIn);

                  // 3秒間表示した後、フェードアウト
                  setTimeout(() => {
                    let fadeOpacity = 1;
                    const fadeOut = setInterval(() => {
                      if (fadeOpacity > 0) {
                        fadeOpacity -= 0.05;
                        drawText(fadeOpacity);
                      } else {
                        clearInterval(fadeOut);
                        // 完全に消す
                        context.clearRect(0, 0, textCanvasElement.width, textCanvasElement.height);
                        currentOpacity = 0;
                        isAnimating = false;
                      }
                    }, 50);
                  }, 3000);
                }
              }, 50);
            })
            .catch((error) => {
              devError("Confetti animation failed:", error);
              isAnimating = false;
            });
        });
      } else {
        devError("confettiButton element not found!");
      }
    }
  } else {
    if (!canvasElement) {
      devError("Full-screen canvas element (#canvas) not found!");
    }
    if (!textCanvasElement) {
      devError("Text canvas element (#confetti-text-canvas) not found!");
    }
  }
}

// DOMが完全にロードされてから初期化
// window.loadを使用してすべてのリソースが読み込まれた後に実行
if (document.readyState === "complete") {
  // 既にロード済みの場合は即座に実行
  initConfetti();
} else {
  // まだロード中の場合はloadイベントを待つ
  window.addEventListener("load", initConfetti);
}
