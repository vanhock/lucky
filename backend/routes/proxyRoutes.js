const corsAnywhere = require("cors-anywhere");
module.exports = function(app) {
  let proxy = corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeaders: [], // Do not require any headers.
    removeHeaders: [] // Do not remove any headers.
  });

  app.get("/proxy/:proxyUrl*", (req, res) => {
    req.url = req.url.replace("/proxy/", "/");
    proxy.emit("request", req, res);
  });

  app.use(function(req, res, next) {
    res.status(404).send("Sorry cant find that!");
  });
};
