// RiveComponent.tsx
import { useEffect, useState, useRef, useCallback, type RefObject } from "react";
import { useRive } from "@rive-app/react-canvas";
import type { Layout as RiveLayoutType } from "@rive-app/react-canvas";

const riveWasmUrl = "/wasm/rive.wasm";

const DEBUG = import.meta.env.DEV;

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

interface RivePlayerProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay: boolean;
  layout: RiveLayoutType;
  minWidth: number;
  minHeight: number;
  containerRef: RefObject<HTMLDivElement | null>;
  onRiveReady: () => void;
}

function RivePlayer({
  src,
  artboard,
  stateMachines,
  autoplay,
  layout,
  minWidth,
  minHeight,
  containerRef,
  onRiveReady,
}: RivePlayerProps) {
  const riveOptions = {
    src,
    artboard,
    stateMachines,
    autoplay,
    layout,
  };

  debugLog("RivePlayer: useRive with layout ready", { src });
  const { RiveComponent: InnerRive, rive } = useRive(riveOptions, {
    shouldUseIntersectionObserver: false,
  });

  useEffect(() => {
    if (rive) {
      debugLog("Rive file loaded:", src);
      onRiveReady();
    }
  }, [rive, src, onRiveReady]);

  // canvas.width/height の再設定や getContext("2d") は Rive の描画バッファを破壊するため行わない。
  useEffect(() => {
    if (!containerRef.current || !rive) {
      return undefined;
    }

    const container = containerRef.current;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const applyCanvasStyles = (): void => {
      const canvas = container.querySelector("canvas");
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        timeoutId = window.setTimeout(applyCanvasStyles, 100);
        return;
      }

      canvas.style.minWidth = `${minWidth}px`;
      canvas.style.minHeight = `${minHeight}px`;
    };

    applyCanvasStyles();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [rive, minWidth, minHeight, containerRef]);

  if (typeof InnerRive !== "function") {
    return null;
  }

  // className を InnerRive に渡すとライブラリがラッパー div に width/height を付けず、リサイズが 0 になる
  return (
    <div
      className="rive-component"
      style={{
        opacity: 1,
        width: "100%",
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        height: `${minHeight}px`,
        display: "block",
      }}
    >
      <InnerRive style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/** SSR ではマウントせずプレースホルダのみ。useRive はブラウザでのみ実行する。 */
function RiveClient({
  src,
  artboard,
  stateMachines,
  autoplay = true,
  minWidth = 300,
  minHeight = 200,
}: RiveComponentProps) {
  const [layout, setLayout] = useState<RiveLayoutType | null>(null);
  const [runtimeLoading, setRuntimeLoading] = useState(true);
  const [fileReady, setFileReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFileReady(false);
  }, [src]);

  const onRiveReady = useCallback(() => {
    setFileReady(true);
    setError(null);
  }, []);

  useEffect(() => {
    debugLog("RiveComponent: Initializing Rive runtime...");
    const loadRive = async () => {
      try {
        setRuntimeLoading(true);
        setError(null);
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
        setRuntimeLoading(false);
        debugLog("RiveComponent: Rive runtime initialized successfully");
      } catch (err) {
        console.error("RiveComponent: Failed to load Rive runtime:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setLayout(null);
        setRuntimeLoading(false);
      }
    };

    void loadRive();
  }, []);

  useEffect(() => {
    debugLog("RiveComponent src changed:", src);
  }, [src]);

  const showSpinner = (runtimeLoading || (!!layout && !fileReady)) && !error;

  return (
    <div ref={containerRef} className="rive-container">
      {showSpinner && (
        <div className="rive-loading">
          <div className="rive-loading-spinner"></div>
        </div>
      )}
      {layout !== null && !error && (
        <RivePlayer
          key={src}
          src={src}
          artboard={artboard}
          stateMachines={stateMachines}
          autoplay={autoplay}
          layout={layout}
          minWidth={minWidth}
          minHeight={minHeight}
          containerRef={containerRef}
          onRiveReady={onRiveReady}
        />
      )}
      {error !== null && error !== "" && (
        <div className="rive-error" style={{ padding: "1rem", textAlign: "center", color: "#ff4f48" }}>
          <p>Rive animation failed to load</p>
          <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>{error}</p>
        </div>
      )}
    </div>
  );
}

export default function RiveComponent(props: RiveComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rive-container">
        <div className="rive-loading">
          <div className="rive-loading-spinner"></div>
        </div>
      </div>
    );
  }

  return <RiveClient {...props} />;
}
