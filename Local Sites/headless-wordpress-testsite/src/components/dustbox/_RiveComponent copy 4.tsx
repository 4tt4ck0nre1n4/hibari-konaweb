import React, { useEffect } from "react";
// import { useRive, Layout, Fit, Alignment, RuntimeLoader } from "@rive-app/react-canvas";

// WASM ファイルを直接 import（vite が対応）
import riveWasmUrl from "@rive-app/canvas/rive.wasm";
// import riveWasmUrl from "@rive-app/canvas/rive.wasm?url";
import riveReact from "@rive-app/react-canvas";

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

const RiveComponent: React.FC<RiveComponentProps> = ({ src, artboard, stateMachines, autoplay = true }) => {
  useEffect(() => {
    RuntimeLoader.setWasmUrl(riveWasmUrl);
    console.log("Rive WASM URL set:", riveWasmUrl);
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

  return <InnerRive />;
};

export default RiveComponent;
