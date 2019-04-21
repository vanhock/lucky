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
                if (!designs.length) {
                  return res
                    .status(500)
                    .send("Have no designs found for this project!");
                }
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

  app.post("/delete-designs", (req, res) => {
    if (!req.fields.ids || !req.fields.projectId) {
      return res.status(500).send("Required params did not provide!");
    }

    const ids = req.fields.ids.split(",");

    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      }).then(project => {
        if (project.userId === user.id) {
          Design.findAll({
            where: {
              id: ids,
              projectId: req.fields.projectId
            }
          })
            .then(() => {
              Design.destroy({
                where: {
                  id: ids,
                  projectId: req.fields.projectId
                }
              });
              res
                .status(200)
                .send(
                  `Designs with ids: ${req.fields.ids} successfully deleted!`
                );
            })
            .catch(() => {
              res
                .status(500)
                .send(`Designs with ids: ${req.fields.ids} not found!`);
            });
        } else {
          res
            .status(500)
            .send("You don't have rights for edit designs of this project!");
        }
      });
    });
  });

  app.post("/upload-design", (req, res) => {
    const designFile = req.files.design;
    if (!designFile || !req.fields.projectId) {
      return res.status(500).send("Required params did not provide!");
    }
    if (!fileTypes.includes(designFile.type)) {
      return res.status(500).send("Unsupported format or empty!");
    }
    const tempPath = designFile.path;
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      })
        .then(project => {
          if (project.userId === user.id) {
            upload(designFile, (message, designs) => {
              if (message) {
                return res.status(500).send(message);
              }
              const responseDesigns = [];
              designs.forEach((design, index) => {
                Design.create({
                  projectId: req.fields.projectId,
                  blocks: design.blocks,
                  image: design.imagePath,
                  fileName: designFile.name,
                  fileSize: designFile.size,
                  fileType: designFile.type,
                  width: design.document.width,
                  height: design.document.height
                })
                  .then(d => {
                    responseDesigns.push(d);
                    if (index === designs.length - 1) {
                      removeFile(tempPath);
                      res.status(200).send(JSON.stringify(responseDesigns));
                    }
                  })
                  .catch(message => {
                    return res
                      .status(500)
                      .send("Error with save design! Log: " + message);
                  });
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
              if (!parsed) {
                done("Error with parsing PSD");
              }
              const blocks = normalizePSD(parsed);
              done(null, [
                {
                  imagePath: config.upload.designImagesPath + designName,
                  blocks: blocks,
                  document: {
                    width: parsed.document.width,
                    height: parsed.document.height
                  }
                }
              ]);
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
