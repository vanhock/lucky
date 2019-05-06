const path = require("path");
const SVGSpritemapPlugin = require("svg-spritemap-webpack-plugin");
module.exports = {
  outputDir: "backend/public",
  lintOnSave: false,
  devServer: {
    proxy: "http://localhost:3000"
  },
  configureWebpack: {
    plugins: [
      new SVGSpritemapPlugin("src/assets/img/icons/*.svg", {
        styles: path.join(__dirname, "src/assets/styles/_sprites.scss")
      })
    ]
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "scss",
      patterns: [
        path.resolve(__dirname, "src/assets/styles/_mixins.scss"),
        path.resolve(__dirname, "src/assets/styles/_sprites.scss"),
        path.resolve(__dirname, "src/assets/styles/_vars.scss")
      ]
    },
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true
    }
  }
};
