import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
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
