import { useEffect } from "react";
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from "../scripts/riveWrapper";

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

  const layout = new Layout({
    fit: Fit.Contain,
    alignment: Alignment.Center,
    // fit: Fit?.Contain ?? "contain",
    // alignment: Alignment?.Center ?? "center",
  });

  const { RiveComponent: InnerRive, rive } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout,
  });

  useEffect(() => {
    console.log("Rive src:", src);
    console.log("Rive instance available:", rive);
  }, [src, rive]);

  return <InnerRive style={{ width: "100%", height: "100%" }} />;
}
