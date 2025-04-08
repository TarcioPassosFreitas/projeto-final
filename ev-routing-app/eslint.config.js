import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("eslint:recommended", "plugin:react/recommended"),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {},
    settings: { react: { version: "detect" } },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];
