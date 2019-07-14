require('dotenv').config();

const config = require("./config/config");
const app = require("./server");

app.listen(config.server.port, () => {
  console.log("We are live on " + config.server.port);
});
