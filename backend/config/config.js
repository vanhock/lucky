const path = require("path");
module.exports = {
  authorization: {
    token_out_of_date: 604800 /** 7 days **/
  },
  upload: {
    path: path.join(__dirname, "../public/"),
    tempPath: path.join(__dirname, "../public/temp"),
    designImagesTempPath: path.join(__dirname, "../public/design/temp/"),
    designImagesFullPath: path.join(__dirname, "../public/design/"),
    designImagesPath: "/design/"
  }
};
