// scripts/riveWrapper.ts

import RiveDefault from "@rive-app/react-canvas";

// 型の定義（CJS を扱うため、default import 全体を unknown として処理）
type RiveModuleType = {
  useRive: typeof import("@rive-app/react-canvas").useRive;
  Layout: typeof import("@rive-app/react-canvas").Layout;
  Fit: typeof import("@rive-app/react-canvas").Fit;
  Alignment: typeof import("@rive-app/react-canvas").Alignment;
  RuntimeLoader: {
    setWasmUrl: (url: string) => void;
    load?: () => Promise<void>;
  };
};

// CJS を安全に取り扱う（default export を unknown → 型断言）
const Rive: RiveModuleType = RiveDefault as unknown as RiveModuleType;

// 安全な再エクスポート
export const useRive = Rive.useRive;
export const Layout = Rive.Layout;
export const Fit = Rive.Fit;
export const Alignment = Rive.Alignment;
export const RuntimeLoader = Rive.RuntimeLoader;
