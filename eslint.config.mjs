// Shared ESLint flat config for the npm workspaces (frontend, backend).
// Each workspace runs `eslint src`; ESLint finds this file by walking up.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/build/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Existing code uses `any` at API boundaries (axios errors, raw rows).
      // Keep it visible without failing CI; tighten as those boundaries get types.
      "@typescript-eslint/no-explicit-any": "warn",
      // `declare global { namespace Express {...} }` is the supported way to augment Express.
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
  {
    files: ["frontend/src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["backend/src/**/*.{ts,js}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // CommonJS feed modules in the backend.
    files: ["backend/src/**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: { ...globals.node } },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
);
