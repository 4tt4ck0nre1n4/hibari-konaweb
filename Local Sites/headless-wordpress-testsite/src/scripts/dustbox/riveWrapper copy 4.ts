import RiveDefault from "@rive-app/react-canvas";

// CommonJS 形式なので default import から展開
const { useRive, Layout, Fit, Alignment, RuntimeLoader } = RiveDefault;

type RuntimeLoaderShape = {
  setWasmUrl: (url: string) => void;
  load?: () => Promise<void>;
};

export { useRive, Layout, Fit, Alignment };

export const RiveRuntimeLoader: RuntimeLoaderShape = RuntimeLoader as RuntimeLoaderShape;
