const formidableMiddleware = require("express-formidable");
const viewerRoutes = require("./viewerRoutes");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
module.exports = function(app) {
  app.use(formidableMiddleware());
  viewerRoutes(app);
  userRoutes(app);
  projectRoutes(app);
};
