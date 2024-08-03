import { defineConfig } from "vite";

/// <reference types="vitest" />
export default defineConfig({
  test: {
    include: ["tests/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: [
        ["lcov", { projectRoot: "./src" }],
        ["json", { file: "coverage.json" }],
        "text",
      ],
      exclude: ["archive", "tests", "**/*.d.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
