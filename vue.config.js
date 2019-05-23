const path = require("path");
const SVGSpritemapPlugin = require("svg-spritemap-webpack-plugin");
module.exports = {
  outputDir: "backend/public/",
  lintOnSave: false,
  css: {
    modules: true
  },
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
    },
    browserExtension: {
      registry: undefined,
      components: {
        background: true,
        contentScripts: true
      },
      api: "browser",
      usePolyfill: true,
      autoImportPolyfill: true,
      componentOptions: {
        background: {
          entry: "src/extension/background.js"
        },
        contentScripts: {
          entries: {
            "content_scripts/inspectors-script": [
              "src/extension/content_scripts/inspectors-script.js"
            ],
            "content_scripts/auth-script": [
              "src/extension/content_scripts/auth-script.js"
            ]
          }
        }
      }
    }
  },
  pages: {
    index: {
      template: "public/index.html",
      entry: "src/main.js"
    }
  }
};
