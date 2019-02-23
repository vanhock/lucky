const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
//require("../libs/psd.min.js");

const PSD = require("../libs/psd.node.js");

const designUploadPath = path.join(__dirname, "../public/design/");
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
        const design = psd.tree().export();
        res.send(design);
        try {
          fs.unlinkSync(filePath);
          //file removed
        } catch (err) {
          console.error(err);
        }
      });
    });
  });
  const corsAnywhere = require("cors-anywhere");
  let proxy = corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeaders: [], // Do not require any headers.
    removeHeaders: [] // Do not remove any headers.
  });

  app.get("/proxy/:proxyUrl*", (req, res) => {
    req.url = req.url.replace("/proxy/", "/");
    proxy.emit("request", req, res);
  });

  const getDocumentErrors = require("../libs/getDocumentErrors");
  app.post("/get-errors", (req, res) => {
    const getData = () => {
      const form = new formidable.IncomingForm();
      form.parse(req);
      form.on("fileBegin", function(name, file) {
        file.path = designUploadPath + file.name;
      });
      return new Promise(function(resolve, reject) {
        form.parse(req, function(err, fields, files) {
          if (err) return reject(err);
          resolve({ fields: fields, files: files });
        });
      });
    };

    const getPsdTree = file => {
      return new Promise((resolve, reject) => {
        let filePath = (designUploadPath + file.name).replace(/\\/g, "/");
        PSD.open(filePath).then(psd => {
          const design = psd.tree().export();
          /**try {
            fs.unlinkSync(filePath);
            //file removed
          } catch (err) {
            console.error(err);
          }*/
          resolve(design);
        });
      });
    };

    getData().then(({ fields, files }) => {
      if (!fields.design || !fields.nodes) {
        return;
      }
      const design = JSON.parse(fields.design);
      getDocumentErrors(design, JSON.parse(fields.nodes), cb => {
        if (!cb) {
          res.status(500).send("Error with getting errors!");
        } else {
          console.log("errors sent: ");
          res.status(200).send(cb);
        }
      });

    });
  });
};

