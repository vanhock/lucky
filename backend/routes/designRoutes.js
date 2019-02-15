const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
require("../libs/psd.js");
const PSD = require("psd");
const designUploadPath = path.join(__dirname, "../public/");
module.exports = function(app, db) {
  app.post("/upload-design", (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req);
    form.on("fileBegin", function(name, file) {
      file.path = designUploadPath + file.name;
    });
    form.on("file", function(name, file) {
      let filePath = (designUploadPath + file.name).replace(/\\/g, "/");
      PSD.open(filePath).then(psd => {
        res.send(psd.tree().export());
        try {
          fs.unlinkSync(filePath);
          //file removed
        } catch (err) {
          console.error(err);
        }
      });
    });
  });
};
