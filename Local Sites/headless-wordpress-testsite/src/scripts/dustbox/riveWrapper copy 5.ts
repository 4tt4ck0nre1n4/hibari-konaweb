// @ts-expect-error: CommonJS module workaround
const RiveCjs = require("@rive-app/react-canvas");

type RuntimeLoaderShape = {
  setWasmUrl: (url: string) => void;
  load?: () => Promise<void>;
};

export const useRive = RiveCjs.useRive;
export const Layout = RiveCjs.Layout;
export const Fit = RiveCjs.Fit;
export const Alignment = RiveCjs.Alignment;
export const RiveRuntimeLoader: RuntimeLoaderShape = RiveCjs.RuntimeLoader;
