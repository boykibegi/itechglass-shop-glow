import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  // Avoid stale optimized deps causing React context consumer/provider mismatches in react-leaflet.
  // (This is a dev-server optimization only; production builds are unaffected.)
  optimizeDeps: {
    exclude: ["react-leaflet", "@react-leaflet/core", "leaflet"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent duplicate React instances causing react-leaflet errors
    dedupe: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
}));
