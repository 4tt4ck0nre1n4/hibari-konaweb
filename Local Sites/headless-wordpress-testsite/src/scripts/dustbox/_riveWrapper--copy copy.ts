import riveReactPkg from "@rive-app/react-canvas";

import type {
  Layout as LayoutType,
  Fit as FitType,
  Alignment as AlignmentType,
  RuntimeLoader as RuntimeLoaderType,
  useRive as useRiveType,
} from "@rive-app/react-canvas";

export const useRive = riveReactPkg.useRive as typeof useRiveType;
export const Layout = riveReactPkg.Layout as typeof LayoutType;
export const Fit = riveReactPkg.Fit as typeof FitType;
export const Alignment = riveReactPkg.Alignment as typeof AlignmentType;
export const RuntimeLoader = riveReactPkg.RuntimeLoader as typeof RuntimeLoaderType;

export type RiveLayout = InstanceType<typeof Layout>;
