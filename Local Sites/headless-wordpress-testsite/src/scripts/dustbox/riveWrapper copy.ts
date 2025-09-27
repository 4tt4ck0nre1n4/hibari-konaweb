import * as RiveModule from "@rive-app/react-canvas";

type RuntimeLoaderShape = {
  setWasmUrl: (url: string) => void;
  load?: () => Promise<void>;
};

export const useRive: typeof import("@rive-app/react-canvas").useRive = (
  RiveModule as unknown as typeof import("@rive-app/react-canvas")
).useRive;
export const Layout: typeof import("@rive-app/react-canvas").Layout = (
  RiveModule as unknown as typeof import("@rive-app/react-canvas")
).Layout;
export const Fit: typeof import("@rive-app/react-canvas").Fit = (
  RiveModule as unknown as typeof import("@rive-app/react-canvas")
).Fit;
export const Alignment: typeof import("@rive-app/react-canvas").Alignment = (
  RiveModule as unknown as typeof import("@rive-app/react-canvas")
).Alignment;

const rawRuntimeLoader = (RiveModule as unknown as { RuntimeLoader: unknown }).RuntimeLoader;

export const RuntimeLoader: RuntimeLoaderShape = rawRuntimeLoader as RuntimeLoaderShape;

export type RiveLayout = InstanceType<typeof Layout>;
