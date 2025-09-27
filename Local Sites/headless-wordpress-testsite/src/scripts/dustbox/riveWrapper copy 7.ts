import type {
  UseRiveParameters,
  UseRiveOptions,
  RiveState,
  Layout as RiveLayoutClass,
  Fit as RiveFit,
  Alignment as RiveAlignment,
} from "@rive-app/react-canvas";

// CommonJS モジュールを default import 経由で読み込む
import RiveDefault from "@rive-app/react-canvas";

// 型定義
type RuntimeLoaderShape = {
  setWasmUrl: (url: string) => void;
  load?: () => Promise<void>;
};

// 明示的に型アサイン
export const useRive = RiveDefault["useRive"] as (
  params?: UseRiveParameters,
  options?: Partial<UseRiveOptions>
) => RiveState;

export const Layout = RiveDefault["Layout"] as typeof RiveLayoutClass;
export const Fit = RiveDefault["Fit"] as typeof RiveFit;
export const Alignment = RiveDefault["Alignment"] as typeof RiveAlignment;

export const RiveRuntimeLoader: RuntimeLoaderShape = {
  setWasmUrl: RiveDefault["RuntimeLoader"].setWasmUrl,
  load: RiveDefault["RuntimeLoader"].load,
};
