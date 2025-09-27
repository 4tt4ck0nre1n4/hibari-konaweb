import { useEffect } from "react";
import type { Layout as RiveLayoutType, Fit as RiveFitType, Alignment as RiveAlignmentType } from "@rive-app/canvas";
import pkg from "@rive-app/react-canvas";
const { useRive, Layout, Fit, Alignment, RuntimeLoader } = pkg as any;

interface RiveProps {
  src: string;
}

export default function Rive({ src }: RiveProps) {
  useEffect(() => {
    RuntimeLoader.setWasmUrl("/node_modules/@rive-app/canvas/rive.wasm");
    RuntimeLoader.load().then(() => {
      console.log("Rive WASM runtime preloaded");
    });
  }, []);

  const layout = new Layout({
    fit: Fit.Contain as RiveFitType,
    alignment: Alignment.Center as RiveAlignmentType,
  });

  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    layout,
  });

  return <RiveComponent />;
}
