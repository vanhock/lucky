const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fallback = require("express-history-api-fallback");
const port = 3000;
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
require("./routes")(app);
const root = `${__dirname}/app`;
app.use(express.static("app"));
app.use(express.static("public"));
app.use(fallback("index.html", { root }));
app.listen(port, () => {
  console.log("We are live on " + port);
});
