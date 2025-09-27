import { useEffect, useState } from "react";
import { useRive } from "@rive-app/react-canvas";

const riveWasmUrl = "/wasm/rive.wasm";

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

export default function RiveComponent({ src, artboard, stateMachines, autoplay = true }: RiveComponentProps) {
  const [layout, setLayout] = useState<any>(null);

  useEffect(() => {
    const loadRive = async () => {
      const { Fit, Layout, Alignment, useRive, RuntimeLoader } = await import("../scripts/riveClient");

      RuntimeLoader.setWasmUrl(riveWasmUrl);

      const loader = RuntimeLoader as unknown as {
        load?: () => Promise<void>;
      };
      if (typeof loader.load === "function") {
        await loader.load();
      }

      const layout = new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      });

      setLayout(layoutInstance);
    };

    void loadRive();
  }, []);

  const { RiveComponent: InnerRive } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout,
  });

  return <InnerRive style={{ width: "100%", height: "100%" }} />;
}
