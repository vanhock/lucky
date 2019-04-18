const config = require("../config/config");
const formidableMiddleware = require("express-formidable");
const viewerRoutes = require("./viewerRoutes");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
const pageRoutes = require("./pageRoutes");
const uploaderRoutes = require("./uploaderRoutes");
module.exports = function(app) {
  app.use(
    formidableMiddleware({
      encoding: "utf-8",
      uploadDir: config.upload.path
    })
  );
  viewerRoutes(app);
  userRoutes(app);
  projectRoutes(app);
  pageRoutes(app);
  uploaderRoutes(app);
};
