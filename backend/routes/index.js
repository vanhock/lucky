const viewerRoutes = require("./viewerRoutes");
module.exports = function(app, db) {
  viewerRoutes(app, db);
};
