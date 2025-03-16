import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  css: {
    modules: {
      scopeBehaviour: "local",
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/index.html"),
        background: resolve(__dirname, "src/scripts/background.js"),
        authorize: resolve(__dirname, "src/scripts/authorize.js")
      },
      output: {
        entryFileNames: "[name].js",
      }
    },
    cssCodeSplit: true
  },
});
