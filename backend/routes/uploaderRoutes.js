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
        uploadDir: config.upload.designImagesTempPath
      },
      [
        {
          event: "fileBegin",
          action: function(req, res, next, name, file) {
            file.path = config.upload.designImagesTempPath + file.name;
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
    const tempPath = design.path;
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
                  removeFile(tempPath);
                  res.status(200).send(JSON.stringify(design));
                })
                .catch(message => {
                  removeFile(tempPath);
                  res.status(500).send("Error with create design: " + message);
                });
            });
          } else {
            removeFile(tempPath);
            res
              .status(500)
              .send("You don't have rights to upload files to this project!");
          }
        })
        .catch(() => {
          removeFile(tempPath);
          res.status(500).send("Project not found!");
        });
    });

    function upload(done) {
      if (design.type === "image/vnd.adobe.photoshop") {
        let currentPsd = null;
        const designName =
          design.name.substring(0, design.name.lastIndexOf(".") + 1) + "png";
        const designImgTempPath =
          config.upload.designImagesTempPath + designName;

        PSD.open(design.path)
          .then(psd => {
            currentPsd = psd;
            return psd.image.saveAsPng(designImgTempPath);
          })
          .then(() => {
            compressImage(
              designImgTempPath,
              config.upload.designImagesFullPath + designName,
              () => {
                removeFile(designImgTempPath);
                const parsed = currentPsd.tree().export();
                done(config.upload.designImagesPath + design.name, parsed);
              }
            );
          })
          .catch(error => {
            res.status(500).send(error);
          });
      }
    }
    function compressImage(filePath, outputPath, cb) {
      const tinify = require("tinify");
      tinify.key = "SsRBejmd1xCuajdafYzgkKry4Fr6pnUJ";
      tinify
        .fromFile(filePath)
        .toFile(outputPath)
        .then(callback => {
          cb(callback);
        });
    }
    function removeFile(filePath) {
      const fs = require("fs");
      /** Remove temp design file **/
      try {
        fs.unlinkSync(filePath);
        //file removed
      } catch (err) {
        console.error(err);
      }
    }
  });
};
