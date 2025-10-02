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

      // スマホサイズかどうかをチェックしてフォントサイズを調整
      const isMobile = window.innerWidth <= 480;
      const fontSize = isMobile ? "16px" : "22px";

      context.font = `${fontSize} system-ui`;
      context.fillStyle = "black";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Thank you for viewing my portfolio site!", canvasElement.width / 2, canvasElement.height / 2);
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
