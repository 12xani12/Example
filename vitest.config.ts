import { defineConfig } from "vitest/config";
import path from "path";

// Integration tests use the database configured in .env (development DB).
try {
  process.loadEnvFile(".env");
} catch {
  /* CI may provide env vars directly */
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/empty-module.ts"),
    },
  },
  test: { include: ["tests/**/*.test.ts"], environment: "node", testTimeout: 30000, fileParallelism: false },
});
