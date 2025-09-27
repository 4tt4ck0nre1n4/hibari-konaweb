import { useEffect } from "react";
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from "../scripts/riveWrapper";
import type { RiveLayout } from "../scripts/riveWrapper";

const riveWasmUrl = "/wasm/rive.wasm";

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

export default function RiveComponent({ src, artboard, stateMachines, autoplay = true }: RiveComponentProps) {
  useEffect(() => {
    RuntimeLoader.setWasmUrl(riveWasmUrl);

    const loader = RuntimeLoader as unknown as {
      load?: () => Promise<void>;
    };

    if (typeof loader.load === "function") {
      void loader.load().catch((e: unknown) => {
        console.error("Failed to preload Rive WASM:", e);
      });
    }
  }, []);

  const layout: RiveLayout = new Layout({
    fit: Fit?.Contain ?? "contain",
    alignment: Alignment?.Center ?? "center",
  });

  const { RiveComponent: InnerRive } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout,
  });

  return <InnerRive style={{ width: "100%", height: "100%" }} />;
}
