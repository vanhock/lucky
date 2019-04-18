const config = require("../config/config");
const formidableMiddleware = require("express-formidable");
const { Design, Project } = require("../sequelize");
const { getUserByToken, normalizePSD } = require("../libs/helpers");

var PSD = require("psd");
const fileTypes = ["image/vnd.adobe.photoshop", "application/octet-stream"];
module.exports = function(app) {
  app.use(
    formidableMiddleware(
      {
        uploadDir: config.upload.designFullPath
      },
      [
        {
          event: "fileBegin",
          action: function(req, res, next, name, file) {
            file.path = config.upload.designFullPath + file.name;
          }
        }
      ]
    )
  );
  app.post("/upload-design", (req, res) => {
    const design = req.files.design;
    if (!design || !req.fields.projectId) {
      return res.status(500).send("Required params did not provide!");
    }
    if (!fileTypes.includes(design.type)) {
      return res.status(500).send("Unsupported format or empty!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      })
        .then(project => {
          if (project.userId === user.id) {
            upload((designImgPath, parsed) => {
              const blocks = normalizePSD(parsed);
              Design.create({
                projectId: req.fields.projectId,
                blocks: blocks,
                image: designImgPath,
                fileName: design.name,
                fileSize: design.size,
                fileType: design.type,
                width: parsed.document.width,
                height: parsed.document.height
              })
                .then(design => {
                  res.status(200).send(JSON.stringify(design));
                })
                .catch(message => {
                  res.status(500).send("Error with create design: " + message);
                });
            });
          } else {
            res
              .status(500)
              .send("You don't have rights to upload files to this project!");
          }
        })
        .catch(() => {
          res.status(500).send("Project not found!");
        });
    });

    function upload(done) {
      if (design.type === "image/vnd.adobe.photoshop") {
        let currentPsd = null;
        const designImgPath =
          config.upload.designFullPath +
          "/" +
          design.name.substring(0, design.name.lastIndexOf(".") + 1) +
          "png";
        PSD.open(design.path)
          .then(psd => {
            currentPsd = psd;
            return psd.image.saveAsPng(designImgPath);
          })
          .then(() => {
            const parsed = currentPsd.tree().export();
            done(config.upload.designPath + design.name, parsed);
          })
          .catch(error => {
            res.status(500).send(error);
          });
      }
    }
  });
};
