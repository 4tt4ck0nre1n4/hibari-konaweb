/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_API_PREFIX: string;
  readonly PUBLIC_WPCF7_API_URL: string;
  readonly PUBLIC_WPCF7_API_PREFIX: string;
  readonly PUBLIC_WPCF7_API_ID: string;
  readonly PUBLIC_WPCF7_ID: string;
  readonly PUBLIC_WPCF7_UNIT_TAG;
  readonly PUBLIC_WPCF7_POST_ID;
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@pagefind/default-ui" {
  export class PagefindUI {
    constructor(opts: {
      element?: string | HTMLElement;
      bundlePath?: string;
      pageSize?: number;
      resetStyles?: boolean;
      showImages?: boolean;
      showSubResults?: boolean;
      excerptLength?: number;
      processResult?: any;
      processTerm?: any;
      showEmptyFilters?: boolean;
      debounceTimeoutMs?: number;
      mergeIndex?: any;
      translations?: any;
      autofocus?: boolean;
      sort?: any;
    });
  }
}

import type { Container } from "@tsparticles/engine";

declare global {
  interface Window {
    tsparticlesContainer?: Container;
  }
}
