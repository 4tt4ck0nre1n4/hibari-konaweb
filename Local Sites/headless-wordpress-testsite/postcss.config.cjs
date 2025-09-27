const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: [
    require("postcss-preset-env"),
    autoprefixer(),
    // require("postcss-sort-media-queries")({
    //   sort: "mobile-first",
    // }),
  ]
}
