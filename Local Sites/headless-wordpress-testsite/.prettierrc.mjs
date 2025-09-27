/** @type {import("prettier").Options} */

export default {
  plugins: [
    "prettier-plugin-astro"
  ],
  printWidth: 120,
  tabWidth: 2,
  semi: true,
  bracketSpacing: true,
  trailingComma: "es5",
  arrowParens: "always",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
