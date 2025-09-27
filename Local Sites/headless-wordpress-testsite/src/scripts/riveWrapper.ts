// 型定義のみ読み込み
import type * as RiveTypes from "@rive-app/react-canvas";

// 変数宣言
let Fit: typeof RiveTypes.Fit | undefined;
let Layout: typeof RiveTypes.Layout | undefined;
let Alignment: typeof RiveTypes.Alignment | undefined;
let RuntimeLoader: typeof RiveTypes.RuntimeLoader | undefined;
let useRive: typeof RiveTypes.useRive | undefined;

// クライアント環境のみ require() 実行
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RiveCjs = require("@rive-app/react-canvas") as typeof RiveTypes;

  Fit = RiveCjs.Fit;
  Layout = RiveCjs.Layout;
  Alignment = RiveCjs.Alignment;
  RuntimeLoader = RiveCjs.RuntimeLoader;
  useRive = RiveCjs.useRive;
}

export { Fit, Layout, Alignment, RuntimeLoader, useRive };
