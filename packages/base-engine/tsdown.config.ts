import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: ["@aliou/obsdx-base-ast"],
  },
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  entry: ["src/index.ts"],
  format: "esm",
  sourcemap: true,
  target: "node25",
});
