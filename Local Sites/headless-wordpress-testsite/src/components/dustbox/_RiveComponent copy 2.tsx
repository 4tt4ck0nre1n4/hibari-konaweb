import React, { useEffect, useMemo } from "react";
import Rive, { useRive, Fit as RiveFit, Alignment, RuntimeLoader } from "@rive-app/react-canvas";

/** Props for the Rive component */
interface RiveProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

/**
 * RiveComponent renders a Rive animation with layout control and optional WASM preloading.
 */
export default function RiveComponent({ src, artboard, stateMachines, autoplay = true }: RiveProps) {
  // Preload the WASM binary once
  useEffect(() => {
    RuntimeLoader.setWasmUrl("/node_modules/@rive-app/canvas/rive.wasm");
    RuntimeLoader.load().catch(console.error);
  }, []);

  // Configure layout: center and contain within canvas
  const layout = useMemo(
    () =>
      new Rive.Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      }),
    []
  );

  // Set up the rive hook with provided options
  const { RiveComponent: InnerRive, rive } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout,
  });

  // Optional: expose the rive instance (e.g., rive.play(), rive.reset())
  useEffect(() => {
    if (rive) {
      // e.g., rive.play()
    }
  }, [rive]);

  return <InnerRive />;
}
