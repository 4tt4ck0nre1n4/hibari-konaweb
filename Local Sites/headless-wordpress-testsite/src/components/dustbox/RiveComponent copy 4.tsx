import { useEffect, useState } from "react";

const riveWasmUrl = "/wasm/rive.wasm";

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

export default function RiveComponent({ src, artboard, stateMachines, autoplay = true }: RiveComponentProps) {
  const [RiveCanvas, setRiveCanvas] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const loadRive = async () => {
      const { Fit, Layout, Alignment, useRive, RuntimeLoader } = await import("../scripts/riveClient");

      RuntimeLoader.setWasmUrl(riveWasmUrl);
      await RuntimeLoader.load?.();

      const layout = new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      });

      const { RiveComponent } = useRive({
        src,
        artboard,
        stateMachines,
        autoplay,
        layout,
      });

      setRiveCanvas(<RiveComponent style={{ width: "100%", height: "100%" }} />);
    };

    void loadRive();
  }, [src, artboard, stateMachines, autoplay]);

  return RiveCanvas;
}
