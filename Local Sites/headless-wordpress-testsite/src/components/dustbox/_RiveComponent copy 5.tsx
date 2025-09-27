import React, { useEffect } from "react";
import riveWasmUrl from "@rive-app/canvas/rive.wasm";
import riveReact from "@rive-app/react-canvas";

const { useRive, Layout: RiveLayout, Fit: RiveFit, Alignment: RiveAlignment, RuntimeLoader } = riveReact;

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

  const layout = new RiveLayout({
    fit: RiveFit.Contain,
    alignment: RiveAlignment.Center,
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
