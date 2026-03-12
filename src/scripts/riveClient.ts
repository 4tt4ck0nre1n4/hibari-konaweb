// src/scripts/riveClient.ts
import { Fit, Layout, Alignment, RuntimeLoader, useRive } from "@rive-app/react-canvas";

// 高品質レンダリング設定
if (typeof window !== "undefined") {
  // Canvasの高品質レンダリング設定
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function (this: void, tagName: string) {
    const element = originalCreateElement(tagName);

    if (tagName.toLowerCase() === "canvas") {
      // Canvas要素の高品質設定
      const canvasElement = element as HTMLCanvasElement;
      canvasElement.style.imageRendering = "smooth";
      canvasElement.style.setProperty("image-rendering", "-webkit-optimize-contrast");
      canvasElement.style.setProperty("-webkit-font-smoothing", "antialiased");
      if (CSS.supports("-moz-osx-font-smoothing", "grayscale")) {
        canvasElement.style.setProperty("-moz-osx-font-smoothing", "grayscale");
      }
    }

    return element;
  };
}

export { Fit, Layout, Alignment, RuntimeLoader, useRive };
