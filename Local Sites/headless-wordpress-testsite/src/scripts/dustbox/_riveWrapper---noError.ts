import * as RiveReact from "@rive-app/react-canvas";

export const useRive = RiveReact.useRive;
export const Layout = RiveReact.Layout;
export const Fit = RiveReact.Fit;
export const Alignment = RiveReact.Alignment;
export const RuntimeLoader = RiveReact.RuntimeLoader as unknown as {
  setWasmUrl: (url: string) => void;
  load?: () => Promise<void>;
};

export type RiveLayout = InstanceType<typeof Layout>;
