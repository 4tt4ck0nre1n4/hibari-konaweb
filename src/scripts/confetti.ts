import JSConfetti from "js-confetti";

function initConfetti() {
  console.log("initConfetti called");
  const confetti: HTMLElement | null = document.getElementById("confettiButton");
  const canvasElement = document.getElementById("canvas");
  const textCanvasElement = document.getElementById("confetti-text-canvas");

  console.log("confettiButton:", confetti);
  console.log("canvas:", canvasElement);
  console.log("textCanvas:", textCanvasElement);

  if (canvasElement instanceof HTMLCanvasElement && textCanvasElement instanceof HTMLCanvasElement) {
    console.log("Canvas elements found, initializing...");
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
        // ダークモード対応
        const isDarkMode = document.documentElement.classList.contains("dark");
        context.fillStyle = isDarkMode ? "#f1f5f9" : "#020202";
        context.textAlign = "center";
        context.textBaseline = "middle";

        // テキストの影を追加して視認性を向上（ダークモード対応）
        context.shadowColor = isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)";
        context.shadowBlur = 2;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;

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

        context.fillText(text, textCanvasElement.width / 2, textCanvasElement.height / 2);

        // 影をリセット
        context.shadowColor = "transparent";
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
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
        console.log("Adding click listener to confetti button");
        confetti.addEventListener("click", () => {
          console.log("Confetti button clicked!");

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
              console.error("Confetti animation failed:", error);
              isAnimating = false;
            });
        });
      } else {
        console.error("confettiButton element not found!");
      }
    }
  } else {
    if (!canvasElement) {
      console.error("Full-screen canvas element (#canvas) not found!");
    }
    if (!textCanvasElement) {
      console.error("Text canvas element (#confetti-text-canvas) not found!");
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
