module.exports = function(app) {
  /* const PSD = require("../libs/psd.node.js");
    const designUploadPath = path.join(__dirname, "../public/design/");
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
  */
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

  const getFoundNodes = require("../libs/getFoundNodes");
  app.post("/get-found-nodes", (req, res) => {
    if (!req.fields) {
      return;
    }
    const fields = req.fields;
    if (!fields.design || !fields.nodes) {
      return;
    }
    const design = JSON.parse(fields.design);
    const nodes = JSON.parse(fields.nodes);
    getFoundNodes(design, nodes)
      .then(found => {
        if (!found || typeof found !== "object") {
          return;
        }
        console.log("We got found nodes: " + Object.keys(found).length);
        res.status(200).send(found);
      })
      .catch(error => {
        res.status(400).send(error);
      });
  });
};
