import eslintJs from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import tsEslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import wordpress from "@wordpress/eslint-plugin";
import astroParser from "astro-eslint-parser";

export default [
  {
    ignores: [
      "**/.astro/**",
      "**/*.astro/**",
      "**/.astro/*.ts",
      "**/*.astro/*.ts",
      "node_modules/",
      "public/",
      ".astro",
      "dist/",
      "src/.astro",
      ".vscode",
      ".github",
      ".env",
      ".cache",
      ".vite-cache/**",
      "src/env.d.ts",
      "package-lock.json",
      "eslint.config.js",
      "tsconfig.json",
      "**/*.cjs",
      "**/*.mjs",
      "app/public/wp-includes/js/**/*",
      "app/public/wp-admin/js/**/*",
      "app/public/wp-content/plugins/**/*",
      "app/public/wp-content/themes/**/*",
      "app/public/wp-includes/blocks/**/*",
      "vite.config.js",
      "@types/**",
      "*.d.ts",
    ],
  },
  {
    files: ["**/.astro/*.ts"],
    ignores: ["**/.astro/*.ts"],
  },
  eslintJs.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  {
    files: ["**/.astro/*.ts"],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: null,
      },
    },
    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/prefer-ts-expect-error": "off",
      "@typescript-eslint/no-array-delete": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-array-delete": "off",
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".astro"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        dataLayer: false,
        astroHTML: true,
        wp: "readonly",
        jquery: "readonly",
        _: "readonly",
        Backbone: "readonly",
        acf: "readonly",
        wpcf7: "readonly",
        ajaxurl: "readonly",
        grecaptcha: "readonly",
        define: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-array-delete": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/prefer-ts-expect-error": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx,astro}"],
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // booleanへの型強制の禁止
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowString: false,
          allowNumber: false,
          // nullチェック 初期値はfalse
          allowNullableObject: true,
        },
      ],
      // 型強制の禁止
      "no-implicit-coercion": "error",
      //異なる型同士の加算の禁止
      "@typescript-eslint/restrict-plus-operands": [
        "error",
        {
          skipCompoundAssignments: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
          allowAny: false,
        },
      ],
      // 文字列同士の + による連結の禁止
      "prefer-template": "error",
      // 複数回同じ変数の宣言の禁止
      "no-redeclare": "error",
      "no-constant-condition": "error",
      "no-constant-binary-expression": "error",
      "no-empty": "off",
      "no-useless-escape": "off",
      "no-prototype-builtins": "off",
      "no-cond-assign": "off",
    },
  },
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-strict"],
  eslintConfigPrettier,
  {
    plugins: {
      "react-hooks": reactHooks,
      "@wordpress": wordpress,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@wordpress/valid-sprintf": "error",
    },
  },
];
