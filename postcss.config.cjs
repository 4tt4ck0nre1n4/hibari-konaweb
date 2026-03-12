const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: [
    require("postcss-preset-env"),
    autoprefixer({
      overrideBrowserslist: ["last 2 versions", "Firefox >= 90", "not dead"],
    }),
    // require("postcss-sort-media-queries")({
    //   sort: "mobile-first",
    // }),
  ]
}
