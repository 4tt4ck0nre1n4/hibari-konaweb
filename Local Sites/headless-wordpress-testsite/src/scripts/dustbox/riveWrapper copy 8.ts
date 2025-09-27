// riveWrapper.ts
import type {
  UseRiveParameters,
  UseRiveOptions,
  RiveState,
  Layout as RiveLayoutClass,
  Fit as RiveFit,
  Alignment as RiveAlignment,
} from "@rive-app/react-canvas";

// CommonJS モジュールを default import で読み込む
import RiveDefault from "@rive-app/react-canvas";

// RiveDefault は関数として解釈されるが、CommonJS モジュールのため、プロパティを明示的に再型定義する
interface RiveCjsModule {
  useRive: (params?: UseRiveParameters, options?: Partial<UseRiveOptions>) => RiveState;
  Layout: typeof RiveLayoutClass;
  Fit: typeof RiveFit;
  Alignment: typeof RiveAlignment;
  RuntimeLoader: {
    setWasmUrl: (url: string) => void;
    load?: () => Promise<void>;
  };
}

// 型アサーションを使って安全にプロパティへアクセス
const Rive: RiveCjsModule = RiveDefault as unknown as RiveCjsModule;

// 明示的に型を指定してエクスポート
export const useRive = Rive.useRive;
export const Layout = Rive.Layout;
export const Fit = Rive.Fit;
export const Alignment = Rive.Alignment;

export const RuntimeLoader = Rive.RuntimeLoader;
