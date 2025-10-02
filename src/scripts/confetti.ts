import JSConfetti from "js-confetti";

const confetti: HTMLElement | null = document.getElementById("confettiButton");
const canvasElement = document.getElementById("canvas");

if (canvasElement instanceof HTMLCanvasElement) {
  canvasElement.width = 210;
  canvasElement.height = 130;

  const jsConfetti = new JSConfetti({ canvas: canvasElement });
  const context = canvasElement.getContext("2d");

  if (context) {
    const drawText = (opacity: number = 1) => {
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      context.globalAlpha = opacity;

      // レスポンシブなフォントサイズの計算
      const screenWidth = window.innerWidth;
      let fontSize: number;

      if (screenWidth <= 480) {
        // スマホサイズ: より大きなフォントサイズ
        fontSize = 24;
      } else if (screenWidth <= 768) {
        // タブレットサイズ
        fontSize = 26;
      } else {
        // デスクトップサイズ
        fontSize = 28;
      }

      context.font = `${fontSize}px system-ui`;
      context.fillStyle = "black";
      context.textAlign = "center";
      context.textBaseline = "middle";

      // テキストが長い場合は改行を考慮
      const text = "Thank you for viewing my portfolio site!";
      const maxWidth = canvasElement.width * 0.9;

      // テキストの幅を測定して、必要に応じて調整
      const textMetrics = context.measureText(text);
      if (textMetrics.width > maxWidth && screenWidth <= 480) {
        // スマホでテキストが長すぎる場合はフォントサイズをさらに調整
        fontSize = Math.max(18, fontSize * (maxWidth / textMetrics.width));
        context.font = `${fontSize}px system-ui`;
      }

      context.fillText(text, canvasElement.width / 2, canvasElement.height / 2);
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

    // ウィンドウリサイズ時にテキストサイズを再調整
    window.addEventListener("resize", () => {
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
