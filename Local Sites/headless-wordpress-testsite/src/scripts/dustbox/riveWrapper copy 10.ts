// scripts/riveWrapper.ts
import RiveCjsDefault from "@rive-app/react-canvas";

// 型定義を明示することで unsafe-assignment と unsafe-member-access を回避
import type {
  UseRiveParameters,
  UseRiveOptions,
  RiveState,
  Layout as RiveLayoutClass,
  Fit as RiveFit,
  Alignment as RiveAlignment,
  RuntimeLoader as RiveRuntimeLoader,
} from "@rive-app/react-canvas";

// RiveCjs は CommonJS デフォルトエクスポートのラッパー
const RiveCjs = RiveCjsDefault as unknown as {
  useRive: (params?: UseRiveParameters, options?: Partial<UseRiveOptions>) => RiveState;
  Layout: typeof RiveLayoutClass;
  Fit: typeof RiveFit;
  Alignment: typeof RiveAlignment;
  RuntimeLoader: typeof RiveRuntimeLoader;
};

export const useRive = RiveCjs.useRive;
export const Layout = RiveCjs.Layout;
export const Fit = RiveCjs.Fit;
export const Alignment = RiveCjs.Alignment;
export const RuntimeLoader = RiveCjs.RuntimeLoader;
