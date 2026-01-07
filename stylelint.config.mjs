/** @type {import('stylelint').Config} */

export default {
  extends: ["stylelint-config-standard", "stylelint-config-recommended"],
  rules: {
    // Allow empty sources (useful for CSS modules)
    "no-empty-source": null,

    // Custom property pattern (CSS variables)
    "custom-property-pattern": null,

    // Selector class pattern (allows BEM and CSS modules)
    "selector-class-pattern": null,

    // Allow unknown at-rules (for CSS modules)
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["tailwind", "apply", "variants", "responsive", "screen", "layer"],
      },
    ],

    // Color function notation
    "color-function-notation": "modern",

    // Alpha value notation
    "alpha-value-notation": "number",

    // Selector pseudo-class no unknown
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "local"],
      },
    ],

    // Property no unknown
    "property-no-unknown": [
      true,
      {
        ignoreProperties: ["composes"],
      },
    ],

    // Allow vendor prefixes for mask properties (needed for browser compatibility)
    // Note: This rule checks for vendor-prefixed properties, so we disable it
    // to allow -webkit-mask-* properties alongside standard mask-* properties
    "property-no-vendor-prefix": null,

    // Declaration block no redundant longhand properties
    "declaration-block-no-redundant-longhand-properties": null,

    // Font family name quotes
    "font-family-name-quotes": "always-where-recommended",

    // Keyframes name pattern (allow camelCase)
    "keyframes-name-pattern": null,
  },
  ignoreFiles: ["node_modules/**", "dist/**", ".astro/**", "public/**", "app/**"],
};
