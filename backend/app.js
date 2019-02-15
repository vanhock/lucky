const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const db = require("./config/db");
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
MongoClient.connect(db.url, { useNewUrlParser: true }, (err, database) => {
  if (err) return console.log(err);
  require("./routes")(app, database);
  app.listen(port, () => {
    console.log("We are live on " + port);
  });
});
