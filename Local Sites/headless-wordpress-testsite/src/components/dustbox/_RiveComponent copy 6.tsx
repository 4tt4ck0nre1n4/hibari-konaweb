import React, { useEffect } from "react";
import riveReactPkg from "@rive-app/react-canvas";
import riveWasmUrl from "@rive-app/canvas/rive.wasm";

const { useRive, Layout, Fit, Alignment, RuntimeLoader } = riveReactPkg as unknown as {
  useRive: typeof import("@rive-app/react-canvas").useRive;
  Layout: new (params: {
    fit: (typeof import("@rive-app/react-canvas").Fit)[keyof typeof import("@rive-app/react-canvas").Fit];
    alignment: (typeof import("@rive-app/react-canvas").Alignment)[keyof typeof import("@rive-app/react-canvas").Alignment];
  }) => unknown;
  Fit: typeof import("@rive-app/react-canvas").Fit;
  Alignment: typeof import("@rive-app/react-canvas").Alignment;
  RuntimeLoader: { setWasmUrl: (url: string) => void; load: () => Promise<void> };
};

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

export default function RiveComponent({ src, artboard, stateMachines, autoplay = true }: RiveComponentProps) {
  useEffect(() => {
    RuntimeLoader.setWasmUrl(riveWasmUrl);
    try {
      RuntimeLoader.load();
    } catch (e) {
      console.error("Failed to preload Rive WASM:", e);
    }
  }, []);

  const layout = new Layout({
    fit: Fit.Contain,
    alignment: Alignment.Center,
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
