import { defineConfig } from "vitest/config";
import path from "path";

// Vitest config for the pure-logic unit tests (e.g. poker metric math).
// Mirrors the `@` alias from vite.config.ts so test files resolve imports the
// same way the app does.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
