import { useEffect } from "react";
import {
  useRive as useRiveImported,
  Layout as LayoutImported,
  Fit as FitImported,
  Alignment as AlignmentImported,
  RuntimeLoader as RuntimeLoaderImported,
} from "../scripts/riveWrapper";

const riveWasmUrl = "/wasm/rive.wasm";

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

export default function RiveComponent({ src, artboard, stateMachines, autoplay = true }: RiveComponentProps) {
  // fallback layout を初期化
  let layout;
  if (LayoutImported && FitImported && AlignmentImported) {
    layout = new LayoutImported({
      fit: FitImported.Contain,
      alignment: AlignmentImported.Center,
    });
  }

  // RuntimeLoaderがあるときだけ wasm 読み込み
  useEffect(() => {
    if (RuntimeLoaderImported) {
      RuntimeLoaderImported.setWasmUrl(riveWasmUrl);
      const loader = RuntimeLoaderImported as unknown as {
        load?: () => Promise<void>;
      };
      if (typeof loader.load === "function") {
        void loader.load().catch((e: unknown) => {
          console.error("Failed to preload Rive WASM:", e);
        });
      }
    }
  }, []);

  // useRive は常に呼び出す（条件付きではなく空オブジェクトで呼び出し可）
  const { RiveComponent: RiveCanvas } = useRiveImported?.({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout,
  }) ?? { RiveComponent: () => null };

  return <RiveCanvas />;
}
