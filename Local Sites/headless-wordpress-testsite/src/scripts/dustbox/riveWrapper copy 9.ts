// scripts/riveWrapper.ts
import RiveCjs from "@rive-app/react-canvas";

// 型定義を取得
type RiveModule = typeof import("@rive-app/react-canvas");

// 型アサーションで型を明示
const rive: RiveModule = RiveCjs as unknown as RiveModule;

export const useRive = rive.useRive;
export const Layout = rive.Layout;
export const Fit = rive.Fit;
export const Alignment = rive.Alignment;
export const RuntimeLoader = rive.RuntimeLoader;
