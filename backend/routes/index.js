const formidableMiddleware = require("express-formidable");
const viewerRoutes = require("./viewerRoutes");
const userRoutes = require("./userRoutes");
module.exports = function(app) {
  app.use(formidableMiddleware());
  viewerRoutes(app);
  userRoutes(app);
};
