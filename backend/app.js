const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const db = require("./config/db");
const path = require("path");
const port = 3000;
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));


MongoClient.connect(db.url, { useNewUrlParser: true }, (err, database) => {
  if (err) return console.log(err);
  require("./routes")(app, database);
  app.use('/', express.static('public'));
  app.listen(port, () => {
    console.log("We are live on " + port);
  });
});


