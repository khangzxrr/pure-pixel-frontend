import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // some browser dependencies expect a Node-style `global`; under Vitest the real one must stay
  define: process.env.VITEST ? {} : { global: {} },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "html"],
      // unconverted .js/.jsx count too, so coverage reflects the whole app
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        // bootstrap only
        "src/main.{jsx,tsx}",
        // route table configuration
        "src/routers/**",
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/*.{test,spec}.{ts,tsx}",
        // generated from the backend OpenAPI document
        "src/apis/generated/**",
        "src/assets/**",
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
