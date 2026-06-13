// Flat ESLint config for the Expo app. Backs the `pnpm lint` script and the
// PR Checks CI job. Uses the standard Expo preset — keep rule customization
// minimal and intentional.
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Generated and build output are not ours to lint.
    ignores: ["dist/**", "node_modules/**", ".expo/**", "src/api/generated/**"],
  },
]);
