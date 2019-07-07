const {
  getProjectDesigns,
  deleteDesigns,
  getFigmaDesigns,
  uploadDesign
} = require("../controllers/designController");

module.exports = function(app) {
  app.get("/get-project-designs", (req, res) => {
    return getProjectDesigns(req, res);
  });

  app.post("/delete-designs", (req, res) => {
    return deleteDesigns(req, res, (error, success) => {
      if (error) {
        return res.error(error);
      }
      res.status(200).send(success);
    });
  });

  app.get("/get-figma-designs", (req, res) => {
    return getFigmaDesigns(req, res);
  });

  app.post("/upload-design", (req, res) => {
    return uploadDesign(req, res);
  });
};
