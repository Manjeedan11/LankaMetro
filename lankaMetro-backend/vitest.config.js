import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use Node.js environment
    environment: "node",
    // Enable global APIs like describe, it, expect (optional)
    globals: true,
    // Clear mocks automatically between tests
    clearMocks: true,
    // Coverage configuration (optional)
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["src/app.js", "src/infrastructure/db.js"],
    },
  },
});
