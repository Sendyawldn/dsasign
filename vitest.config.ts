import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".next", "dist"],
  },
});
