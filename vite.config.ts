import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  css: {
    modules: {
      scopeBehaviour: "local",
    },
  },
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/index.html"),  
      },
      output: {
        entryFileNames: "[name].js",  
      }
    },
    cssCodeSplit: true
  },
});
