// RiveComponent.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useRive } from "@rive-app/react-canvas";
import type { Layout as RiveLayoutType } from "@rive-app/react-canvas";

const riveWasmUrl = "/wasm/rive.wasm";

// 開発環境でのデバッグログを有効化
const DEBUG = import.meta.env.DEV;

// デバッグ用ユーティリティ関数（開発環境でのみログを出力）
const debugLog = (...args: unknown[]): void => {
  if (DEBUG) {
    console.log(...args);
  }
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 高品質レンダリング設定の関数
  // 強制リフローを避けるため、getBoundingClientRectはrequestAnimationFrame内で実行
  const setupHighQualityRendering = useCallback(
    (canvas: HTMLCanvasElement) => {
      // 強制リフローを避けるため、requestAnimationFrame内でgetBoundingClientRectを実行
      requestAnimationFrame(() => {
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
      });
    },
    [minWidth, minHeight]
  );

  // Riveランタイムとレイアウトの初期化
  useEffect(() => {
    debugLog("RiveComponent: Initializing Rive runtime...");
    const loadRive = async () => {
      try {
        setIsLoading(true);
        debugLog("RiveComponent: Loading riveClient...");
        const { Fit, Layout, Alignment, RuntimeLoader } = await import("../scripts/riveClient");

        debugLog("RiveComponent: Setting WASM URL...");
        RuntimeLoader.setWasmUrl(riveWasmUrl);

        const loader = RuntimeLoader as unknown as {
          load?: () => Promise<void>;
        };
        if (typeof loader.load === "function") {
          debugLog("RiveComponent: Loading Rive runtime...");
          await loader.load();
        }

        debugLog("RiveComponent: Creating layout instance...");
        const layoutInstance = new Layout({
          fit: Fit.Contain,
          alignment: Alignment.Center,
        });

        setLayout(layoutInstance);
        setIsLoading(false);
        debugLog("RiveComponent: Rive runtime initialized successfully");
      } catch (err) {
        console.error("RiveComponent: Failed to load Rive runtime:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        // フォールバック: レイアウトなしで続行
        setLayout(null);
        setIsLoading(false);
      }
    };

    void loadRive();
  }, []);

  // useRiveフックの設定 - layoutが初期化されるまで待つ
  const riveOptions = {
    src,
    artboard,
    stateMachines,
    autoplay,
    ...(layout ? { layout } : {}),
  };

  debugLog("RiveComponent: Calling useRive with options:", { src, hasLayout: Boolean(layout) });
  const { RiveComponent: InnerRive, rive } = useRive(riveOptions);
  debugLog("RiveComponent: useRive returned:", { hasInnerRive: Boolean(InnerRive), hasRive: Boolean(rive) });

  // Riveが読み込まれたかどうかを確認
  useEffect(() => {
    if (rive) {
      debugLog("Rive loaded:", rive);
      setIsLoading(false);
      setError(null);
    }
  }, [rive]);

  // srcが変更されたときにログを出力
  useEffect(() => {
    debugLog("RiveComponent src changed:", src);
  }, [src]);

  // 高DPI対応のためのスタイル設定
  useEffect(() => {
    if (!containerRef.current || !rive) {
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
  }, [rive, setupHighQualityRendering, minWidth, minHeight]);

  return (
    <div ref={containerRef} className="rive-container">
      {isLoading && (
        <div className="rive-loading">
          <div className="rive-loading-spinner"></div>
        </div>
      )}
      <InnerRive
        className="rive-component"
        style={{
          opacity: 1,
          width: "100%",
          height: "100%",
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          display: "block",
        }}
      />
      {error !== null && error !== "" && (
        <div className="rive-error" style={{ padding: "1rem", textAlign: "center", color: "#ff4f48" }}>
          <p>Rive animation failed to load</p>
          <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>{error}</p>
        </div>
      )}
    </div>
  );
}
