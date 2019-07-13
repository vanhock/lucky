"use strict";
const express = require("express");
const serverLess = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));

require("./routes")(app);

module.exports = app;
module.exports.handler = serverLess(app);
