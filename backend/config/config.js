const path = require("path");
module.exports = {
  authorization: {
    token_out_of_date: 604800 /** 7 days **/
  },
  upload: {
    path: path.join(__dirname, "../public/"),
    designFullPath: path.join(__dirname, "../public/design/"),
    designPath: "/design/"
  }
};
