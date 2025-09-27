import riveReactPkg from "@rive-app/react-canvas";

export const useRive = riveReactPkg.useRive;
export const Layout = riveReactPkg.Layout;
export const Fit = riveReactPkg.Fit;
export const Alignment = riveReactPkg.Alignment;

export const RuntimeLoader: {
  setWasmUrl: (url: string) => void;
  load: () => Promise<void>;
} = riveReactPkg.RuntimeLoader;

export type RiveLayout = InstanceType<typeof riveReactPkg.Layout>;
