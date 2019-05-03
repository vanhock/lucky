const config = require("../config/config");
const formidableMiddleware = require("express-formidable");
const errorHandlerMiddleware = require("express-json-errors");
const viewerRoutes = require("./viewerRoutes");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
const pageRoutes = require("./pageRoutes");
const designRoutes = require("./designRoutes");
const taskRoutes = require("./taskRoutes");
const commentRoutes = require("./commentRoutes");
const trashRoutes = require("./trashRoutes");
module.exports = function(app) {
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
  app.use(errorHandlerMiddleware());
  viewerRoutes(app);
  userRoutes(app);
  projectRoutes(app);
  pageRoutes(app);
  designRoutes(app);
  taskRoutes(app);
  commentRoutes(app);
  trashRoutes(app);
};
