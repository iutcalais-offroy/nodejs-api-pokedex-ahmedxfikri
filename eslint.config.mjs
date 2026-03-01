// ESLint config - Vérifie la qualité du code TypeScript
// On refuse les variables inutiles, les console.log oubliés, etc.

import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    // Fichiers à ignorer (node_modules, dist, etc.)
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
  {
    // Règles pour les fichiers TypeScript
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      // Node.js globals : console, process, require, __dirname, etc.
      globals: {
        global: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      // Pas de variables inutiles (sauf si préfixées par _)
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Évite les console.log en prod
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Accepte les types vides {}
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
