const path = require("path");
module.exports = {
  authorization: {
    token_out_of_date: 604800 /** 7 days **/,
    figmaAccessToken: "11971-5d340a8f-7932-4e2e-9d36-3d193a64abe7"
  },
  upload: {
    path: path.join(__dirname, "../public/"),
    tempPath: path.join(__dirname, "../public/temp"),
    designImagesTempPath: path.join(__dirname, "../public/design/temp/"),
    designImagesFullPath: path.join(__dirname, "../public/design/"),
    designImagesPath: "/design/"
  }
};
