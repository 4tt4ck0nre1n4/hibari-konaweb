import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 重いライブラリを個別のチャンクに分割
          if (id.includes("@rive-app")) {
            return "rive";
          }
          if (id.includes("@tsparticles") || id.includes("tsparticles")) {
            return "particles";
          }
          if (id.includes("gsap")) {
            return "gsap";
          }
          if (id.includes("swiper")) {
            return "swiper";
          }
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-vendor";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["@rive-app/react-canvas"],
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // api: "modern-compiler",
        implementation: require("sass"),
      },
    },
  },
});
