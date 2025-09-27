// riveWrapper.ts
import type {
  UseRiveParameters,
  UseRiveOptions,
  RiveState,
  Layout as RiveLayoutClass,
  Fit as RiveFit,
  Alignment as RiveAlignment,
} from "@rive-app/react-canvas";

// CommonJS モジュールのため require を使う
const RiveCjs = require("@rive-app/react-canvas");

type RuntimeLoaderShape = {
  setWasmUrl: (url: string) => void;
  load?: () => Promise<void>;
};

// 個別に安全に型アサインする
export const useRive: (params?: UseRiveParameters, options?: Partial<UseRiveOptions>) => RiveState = RiveCjs.useRive;

export const Layout: typeof RiveLayoutClass = RiveCjs.Layout;
export const Fit: typeof RiveFit = RiveCjs.Fit;
export const Alignment: typeof RiveAlignment = RiveCjs.Alignment;

export const RiveRuntimeLoader: RuntimeLoaderShape = {
  setWasmUrl: RiveCjs.RuntimeLoader.setWasmUrl,
  load: RiveCjs.RuntimeLoader.load,
};
