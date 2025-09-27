import React, { useEffect } from "react";
import Rive, { useRive, RuntimeLoader } from "@rive-app/react-canvas";
import riveWasmUrl from "@rive-app/canvas/rive.wasm";

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

const RiveComponent: React.FC<RiveComponentProps> = ({ src, artboard, stateMachines, autoplay = true }) => {
  // ① WASM をプリロード
  useEffect(() => {
    RuntimeLoader.setWasmUrl(riveWasmUrl);
    RuntimeLoader.load().catch(console.error);
  }, []);

  // ② useRive のフックで rive インスタンスを準備
  const { rive, RiveComponent: Canvas } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout: { fit: "contain", alignment: "center" },
  });

  // ③ rive を使いこなすならここで rive.play(), rive.pause() などが可能

  return <Canvas />;
};

export default RiveComponent;
