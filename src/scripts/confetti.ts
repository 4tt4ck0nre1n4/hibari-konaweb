import JSConfetti from "js-confetti";

const confetti: HTMLElement | null = document.getElementById("confettiButton");
const canvasElement = document.getElementById("canvas");

  if (canvasElement instanceof HTMLCanvasElement) {
    // デバイス検出とキャンバスサイズの設定
    const screenWidth = window.innerWidth;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    // 高DPI対応のためのスケールファクター
    const devicePixelRatio = window.devicePixelRatio ?? 1;

  if (screenWidth <= 480) {
    // スマホサイズ: デバイスに応じたキャンバスサイズ
    if (isIOS) {
      canvasElement.width = 320;
      canvasElement.height = 200;
    } else if (isAndroid) {
      canvasElement.width = 300;
      canvasElement.height = 190;
    } else {
      canvasElement.width = 280;
      canvasElement.height = 180;
    }
  } else if (screenWidth <= 768) {
    // タブレットサイズ
    canvasElement.width = 350;
    canvasElement.height = 220;
  } else {
    // デスクトップサイズ
    canvasElement.width = 400;
    canvasElement.height = 250;
  }

  // 高DPI対応: キャンバスの実際のサイズを設定
  const rect = canvasElement.getBoundingClientRect();
  canvasElement.style.width = `${rect.width}px`;
  canvasElement.style.height = `${rect.height}px`;
  canvasElement.width = canvasElement.width * devicePixelRatio;
  canvasElement.height = canvasElement.height * devicePixelRatio;

  const jsConfetti = new JSConfetti({ canvas: canvasElement });
  const context = canvasElement.getContext("2d");

  if (context) {
    const drawText = (opacity: number = 1) => {
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      context.globalAlpha = opacity;

      // デバイス検出とフォントサイズの計算
      const screenWidth = window.innerWidth;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      let fontSize: number;

      if (screenWidth <= 480) {
        // スマホサイズ: デバイスに応じたフォントサイズ
        if (isIOS) {
          fontSize = 44; // iOS用により大きく
        } else if (isAndroid) {
          fontSize = 44; // Android用（適切なサイズ）
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
      context.fillStyle = "#000000"; // 明確な黒色
      context.textAlign = "center";
      context.textBaseline = "middle";

      // テキストの影を追加して視認性を向上
      context.shadowColor = "rgba(255, 255, 255, 0.8)";
      context.shadowBlur = 2;
      context.shadowOffsetX = 1;
      context.shadowOffsetY = 1;

      const text = "Thank you for viewing my portfolio site!";

      // テキストの幅を測定して、必要に応じて調整
      const maxWidth = canvasElement.width * 0.85;
      const textMetrics = context.measureText(text);

      if (textMetrics.width > maxWidth) {
        // テキストが長すぎる場合はフォントサイズを調整
        const ratio = maxWidth / textMetrics.width;
        // パソコンサイズでは最小フォントサイズを大きく設定
        const minFontSize = screenWidth > 768 ? 28 : 28;
        fontSize = Math.max(minFontSize, fontSize * ratio);
        context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      }

      context.fillText(text, canvasElement.width / 2, canvasElement.height / 2);

      // 影をリセット
      context.shadowColor = "transparent";
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.globalAlpha = 1;
    };

    window.addEventListener("DOMContentLoaded", () => {
      const checkContext = setInterval(() => {
        if (canvasElement.getContext("2d")) {
          clearInterval(checkContext);
          drawText();
        }
      }, 50);
    });

    // ウィンドウリサイズ時にキャンバスサイズとテキストサイズを再調整
    window.addEventListener("resize", () => {
      const newScreenWidth = window.innerWidth;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (newScreenWidth <= 480) {
        // スマホサイズ: デバイスに応じたキャンバスサイズ
        if (isIOS) {
          canvasElement.width = 320;
          canvasElement.height = 200;
        } else if (isAndroid) {
          canvasElement.width = 300;
          canvasElement.height = 190;
        } else {
          canvasElement.width = 280;
          canvasElement.height = 180;
        }
      } else if (newScreenWidth <= 768) {
        // タブレットサイズ
        canvasElement.width = 350;
        canvasElement.height = 220;
      } else {
        // デスクトップサイズ
        canvasElement.width = 400;
        canvasElement.height = 250;
      }

      // 高DPI対応: リサイズ時も適用
      const newDevicePixelRatio = window.devicePixelRatio ?? 1;
      const rect = canvasElement.getBoundingClientRect();
      canvasElement.style.width = `${rect.width}px`;
      canvasElement.style.height = `${rect.height}px`;
      canvasElement.width = canvasElement.width * newDevicePixelRatio;
      canvasElement.height = canvasElement.height * newDevicePixelRatio;

      // コンテキストを再スケール
      context.scale(newDevicePixelRatio, newDevicePixelRatio);

      drawText();
    });

    if (confetti) {
      confetti.addEventListener("click", () => {
        jsConfetti
          .addConfetti({
            emojis: ["💜", "💖", "🌈", "✨", "💫", "🌸", "thanks", "💛", "💗", "💘", "🌟", "happy"],
          })
          .then(() => jsConfetti.addConfetti({ confettiRadius: 3 }))
          .then(() => {
            let opacity = 0;
            const fadeIn = setInterval(() => {
              if (opacity < 1) {
                opacity += 0.05;
                drawText(opacity);
              } else {
                clearInterval(fadeIn);
              }
            }, 50);
          })
          .catch((error) => {
            console.error("Confetti animation failed:", error);
          });
      });
    }
  }
} else {
  console.error("Canvas element not found");
}
