import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/empty-module.ts"),
    },
  },
  test: { include: ["tests/**/*.test.ts"], environment: "node", testTimeout: 30000 },
});
