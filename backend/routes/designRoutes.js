const config = require("../config/config");
const { Design, Project } = require("../sequelize");
const {
  getUserByToken,
  normalizePSD,
  filterObject
} = require("../libs/helpers");
const ns = require("node-sketch");
const PSD = require("psd");
const fileTypes = ["image/vnd.adobe.photoshop", "application/octet-stream"];
module.exports = function(app) {
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
            upload(design, (message, designImgPath, parsed) => {
              if (message) {
                return res.status(500).send(message);
              }
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
  });

  app.post("/delete-design", (req, res) => {
    if (!req.fields.id || !req.fields.projectId) {
      return res.status(500).send("Required params did not provide!");
    }

    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      }).then(project => {
        if (project.userId === user.id) {
          Design.findOne({
            where: {
              id: req.fields.id
            }
          }).then(design => {
            if (design.projectId === parseInt(req.fields.projectId)) {
              design.destroy();
              res
                .status(200)
                .send(`Design with id: ${req.fields.id} successfully deleted!`);
            } else {
              res
                .status(500)
                .send("You don't have rights for delete this design!");
            }
          });
        } else {
          res
            .status(500)
            .send("You don't have rights for edit designs of this project!");
        }
      });
    });
  });

  app.get("/get-project-designs", (req, res) => {
    if (!req.fields.projectId) {
      return res.status(500).send("Project id did not provide!");
    }

    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      })
        .then(project => {
          if (project.userId === user.id) {
            Design.findAll({
              where: {
                projectId: req.fields.projectId
              }
            })
              .then(designs => {
                res
                  .status(200)
                  .send(
                    JSON.stringify(
                      designs.map(design =>
                        filterObject(design.dataValues, null, ["blocks"])
                      )
                    )
                  );
              })
              .catch(() => {
                res.status(500).send("Have no designs found for this project!");
              });
          } else {
            res
              .status(500)
              .send("You don't have rights for edit this project!");
          }
        })
        .catch(() => {
          res.status(500).send("Project not found by id!");
        });
    });
  });
};

function upload(design, done) {
  let currentPsd = null;
  const designName =
    design.name.substring(0, design.name.lastIndexOf(".") + 1) + "png";
  const designImgTempPath = config.upload.designImagesTempPath + designName;
  switch (design.type) {
    case "image/vnd.adobe.photoshop":
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
              done(null, config.upload.designImagesPath + designName, parsed);
            }
          );
        })
        .catch(error => {
          done(error);
        });
      break;
    case "application/octet-stream":
      ns.read(design.path).then(sketch => {
        console.log(sketch);
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
