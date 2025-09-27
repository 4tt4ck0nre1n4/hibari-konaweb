import type { Container } from "@tsparticles/engine";

declare global {
  interface Window {
    tsparticlesContainer?: Container;
  }
}

const getContainer = () => window.tsparticlesContainer;

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("js-play");
  const stopButton = document.getElementById("js-stop");
  const resetButton = document.getElementById("js-reset");

  if (playButton) {
    playButton.addEventListener("click", () => {
      void (async () => {
        const container = getContainer();

        if (container) {
          if (container.particles.count === 0) {
            await container.refresh();
          } else {
            container.play();
          }
        }
      })();
    });
  }

  if (stopButton) {
    stopButton.addEventListener("click", () => {
      const container = getContainer();
      if (container) {
        container.stop();
      }
    });
  }
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      void (async () => {
        const container = getContainer();
        if (container) {
          await container.refresh();
        }
      })();
    });
  }
});
