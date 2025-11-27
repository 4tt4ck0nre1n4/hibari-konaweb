// RiveComponent.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useRive, RuntimeLoader } from "@rive-app/react-canvas";
import type { Layout as RiveLayoutType } from "@rive-app/react-canvas";

const riveWasmUrl = "/wasm/rive.wasm";

// WASMのURLを最初に設定（useRiveフックの前に実行される必要がある）
RuntimeLoader.setWasmUrl(riveWasmUrl);

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
  minWidth?: number;
  minHeight?: number;
}

export default function RiveComponent({
  src,
  artboard,
  stateMachines,
  autoplay = true,
  minWidth = 300,
  minHeight = 200,
}: RiveComponentProps) {
  const [layout, setLayout] = useState<RiveLayoutType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // 高品質レンダリング設定の関数
  const setupHighQualityRendering = useCallback(
    (canvas: HTMLCanvasElement) => {
      const devicePixelRatio = window.devicePixelRatio ?? 1;
      const rect = canvas.getBoundingClientRect();

      // 最小サイズを保証（propsから取得）
      const actualWidth = Math.max(rect.width, minWidth);
      const actualHeight = Math.max(rect.height, minHeight);

      // Canvasの解像度を高DPI対応に設定（より高解像度に）
      const scaleFactor = Math.max(devicePixelRatio, 2); // 最低2倍の解像度を保証
      canvas.width = Math.floor(actualWidth * scaleFactor);
      canvas.height = Math.floor(actualHeight * scaleFactor);

      // CSSサイズは元のサイズを維持
      canvas.style.width = `${actualWidth}px`;
      canvas.style.height = `${actualHeight}px`;

      // 高品質レンダリング設定
      const ctx = canvas.getContext("2d", {
        alpha: true,
        desynchronized: false,
      });

      if (ctx) {
        ctx.scale(scaleFactor, scaleFactor);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.textBaseline = "alphabetic";
      }
    },
    [minWidth, minHeight]
  );

  // rivファイルのプリロード
  useEffect(() => {
    const preloadRive = async () => {
      try {
        setIsLoading(true);
        // rivファイルをプリロード
        const response = await fetch(src, {
          method: "GET",
          headers: {
            Accept: "application/octet-stream",
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to load Rive file: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          throw new Error("Rive file is empty");
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Rive preload failed:", error);
        console.error("Rive file path:", src);
        setIsLoaded(true); // エラーでも続行
      } finally {
        setIsLoading(false);
      }
    };

    if (src !== undefined && src !== null && src.length > 0) {
      void preloadRive();
    }
  }, [src]);

  useEffect(() => {
    const loadRive = async () => {
      try {
        const { Fit, Layout, Alignment, RuntimeLoader } = await import("../scripts/riveClient");

        RuntimeLoader.setWasmUrl(riveWasmUrl);

        const loader = RuntimeLoader as unknown as {
          load?: () => Promise<void>;
        };
        if (typeof loader.load === "function") {
          await loader.load();
        }

        const layoutInstance = new Layout({
          fit: Fit.Contain,
          alignment: Alignment.Center,
        });

        setLayout(layoutInstance);
      } catch (error) {
        console.error("Failed to load Rive runtime:", error);
        // フォールバック: レイアウトなしで続行
        setLayout(null);
      }
    };

    void loadRive();
  }, []);

  // 高DPI対応のためのスタイル設定
  useEffect(() => {
    if (!containerRef.current || !isLoaded) {
      return undefined;
    }

    const container = containerRef.current;

    // canvas要素を待つためのタイマー
    const waitForCanvas = () => {
      const canvas = container.querySelector("canvas");
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        // canvas要素が見つからない場合は少し待って再試行
        setTimeout(waitForCanvas, 100);
        return;
      }

      // canvas要素の初期サイズを設定
      canvas.style.width = `${minWidth}px`;
      canvas.style.height = `${minHeight}px`;
      canvas.style.minHeight = `${minHeight}px`;

      setupHighQualityRendering(canvas);

      // リサイズイベントに対応
      const handleResize = () => {
        setupHighQualityRendering(canvas);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    };

    const cleanup = waitForCanvas();
    return cleanup;
  }, [layout, isLoaded, setupHighQualityRendering, minWidth, minHeight]);

  const { RiveComponent: InnerRive } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout: layout ?? undefined,
  });

  return (
    <div ref={containerRef} className="rive-container">
      {isLoading && (
        <div className="rive-loading">
          <div className="rive-loading-spinner"></div>
        </div>
      )}
      {isLoaded && (
        <InnerRive
          className="rive-component"
          style={{
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
            width: "100%",
            height: "100%",
            minHeight: `${minHeight}px`,
          }}
        />
      )}
    </div>
  );
}
