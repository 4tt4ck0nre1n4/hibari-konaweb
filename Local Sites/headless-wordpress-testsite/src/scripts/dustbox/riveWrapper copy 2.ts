import pkg from "@rive-app/react-canvas";

const { useRive, Layout, Fit, Alignment, RuntimeLoader } = pkg;

type RuntimeLoaderShape = {
  setWasmUrl: (url: string) => void;
  load?: () => Promise<void>;
};

export { useRive, Layout, Fit, Alignment };

export const RuntimeLoader: RuntimeLoaderShape = RuntimeLoader as RuntimeLoaderShape;

export type RiveLayout = InstanceType<typeof Layout>;
