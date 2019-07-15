const errorHandlerMiddleware = require("express-json-errors");
const formidableMiddleware = require("express-formidable");
const express = require("express");
const path = require("path");
const config = require("../config/config");
const history = require("connect-history-api-fallback");

const fallback = require("express-history-api-fallback");

module.exports = function(app) {
  app.use(errorHandlerMiddleware());
  app.use(
    formidableMiddleware(
      {
        encoding: "utf-8",
        uploadDir: config.upload.tempPath
      },
      [
        {
          event: "fileBegin",
          action: function(req, res, next, name, file) {
            file.path = file.path + file.name;
          }
        },
        {
          event: "end",
          action: function(req, res, next, name, file) {
            console.log("Request end");
          }
        }
      ]
    )
  );

  app.use(express.static("app"));
  app.use(express.static("public"));
  const staticFileMiddleware = express.static(path.join(__dirname));

  app.use(staticFileMiddleware);
  //app.use(history());
  app.use(
    history({
      index: path.resolve(__dirname, "../app/index.html"),
      verbose: true
    })
  );
  app.use(staticFileMiddleware);
  app.get("/projects/*", (req, res) => {
    res.sendFile(req.url);
  });
};
