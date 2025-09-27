import * as Rive from "@rive-app/react-canvas";

// Rive default export から必要な型・クラスを取得
const {
  useRive,
  Layout: RawLayout,
  Fit: RawFit,
  Alignment: RawAlignment,
  RuntimeLoader: RawRuntimeLoader,
} = Rive as unknown as {
  useRive: typeof import("@rive-app/react-canvas").useRive;
  Layout: typeof import("@rive-app/react-canvas").Layout;
  Fit: typeof import("@rive-app/react-canvas").Fit;
  Alignment: typeof import("@rive-app/react-canvas").Alignment;
  RuntimeLoader: {
    setWasmUrl: (url: string) => void;
    load?: () => Promise<void>;
  };
};

// 型定義（オプション）
export type RiveLayout = InstanceType<typeof RawLayout>;

// エクスポート
export { useRive };
export const Layout = RawLayout;
export const Fit = RawFit;
export const Alignment = RawAlignment;
export const RuntimeLoader = RawRuntimeLoader;
