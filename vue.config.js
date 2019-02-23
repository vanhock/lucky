const path = require("path");
module.exports = {
  outputDir: "backend/public",
  lintOnSave: false,
  devServer: {
    proxy: "http://localhost:3000"
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "scss",
      patterns: [
        path.resolve(__dirname, "src/assets/_mixins.scss"),
        path.resolve(__dirname, "src/assets/_vars.scss")
      ]
    }
  }
};
