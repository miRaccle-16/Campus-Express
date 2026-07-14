import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, the client runs on :5173 and the API on :4000.
// This proxy lets the browser call "/api/..." from either place.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  build: {
    outDir: "dist",
  },
});
