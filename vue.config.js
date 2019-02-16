const path = require("path");
module.exports = {
  lintOnSave: false,

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
