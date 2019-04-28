const config = require("../config/config");
const { Design, Project } = require("../sequelize");
const {
  getUserByToken,
  normalizePSD,
  normalizeFigma,
  filterObject,
  removeFile,
  moveFile
} = require("../libs/helpers");
const download = require("image-downloader");
const PSD = require("psd");
const axios = require("axios");
const figma = axios.create({
  baseURL: "https://api.figma.com/v1",
  headers: {
    "X-FIGMA-TOKEN": config.authorization.figmaAccessToken
  }
});
const fileTypes = ["image/vnd.adobe.photoshop", "application/octet-stream"];

module.exports = function(app) {
  app.get("/get-project-designs", (req, res) => {
    if (!req.query.projectId) {
      return res.status(400).send("Project id did not provide!");
    }

    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.query.projectId
        }
      })
        .then(project => {
          if (!project) {
            return res.status(400).send("Project not found!");
          }
          if (project.userId === user.id) {
            Design.findAll({
              where: {
                projectId: req.query.projectId
              }
            })
              .then(designs => {
                if (!designs.length) {
                  return res
                    .status(400)
                    .send("Have no designs found for this project!");
                }
                return res
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
                return res
                  .status(400)
                  .send("Have no designs found for this project!");
              });
          } else {
            return res
              .status(403)
              .send("You don't have rights for edit this project!");
          }
        })
        .catch(() => {
          return res.status(400).send("Project not found by id!");
        });
    });
  });

  app.post("/delete-designs", (req, res) => {
    if (!req.fields.ids || !req.fields.projectId) {
      return res.status(400).send("Required params did not provide!");
    }

    const ids = req.fields.ids.split(",");

    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      }).then(project => {
        if (!project) {
          return res.status(400).send("Project not found!");
        }
        if (project.userId === user.id) {
          Design.findAll({
            where: {
              id: ids,
              projectId: req.fields.projectId
            }
          })
            .then(designs => {
              if (!designs.length) {
                return res
                  .status(400)
                  .send(`Designs with ids: ${req.fields.ids} not found!`);
              }
              designs.forEach(design => {
                removeFile(design.imageFullPath);
              });

              Design.destroy({
                where: {
                  id: ids,
                  projectId: req.fields.projectId
                }
              });
              return res
                .status(200)
                .send(
                  `Designs with ids: ${req.fields.ids} successfully deleted!`
                );
            })
            .catch(() => {
              return res
                .status(400)
                .send(`Designs with ids: ${req.fields.ids} not found!`);
            });
        } else {
          return res
            .status(403)
            .send("You don't have rights for edit designs of this project!");
        }
      });
    });
  });

  app.get("/get-figma-designs", (req, res) => {
    if (!req.fields.projectId || !req.fields.fileUrl) {
      return res.status(400).send("Required fields did not provide!");
    }
    const pageId = req.fields.fileUrl
      .match(/\/file\/(.*)\//)
      .pop()
      .replace("/file/", "");

    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      })
        .then(project => {
          if (project.userId === user.id) {
            figma.get(`/files/${pageId}`).then(response => {
              if (!response.data) {
                return;
              }
              const designIds = [];
              const processedDesigns = [];
              const artboards = response.data.document.children[0].children.filter(
                item => item.type === "FRAME"
              );
              artboards.forEach(artboard => {
                designIds.push(artboard.id);
                processedDesigns.push({
                  name: artboard.name,
                  projectId: project.id,
                  blocks: normalizeFigma(artboard),
                  image: "",
                  width: artboard.absoluteBoundingBox.width,
                  height: artboard.absoluteBoundingBox.height
                });
              });
              const imagesUrl = `/images/${pageId}?ids=${designIds.join(",")}`;
              figma
                .get(imagesUrl)
                .then(response => {
                  if (!response.data) {
                    return;
                  }
                  const images = response.data.images;
                  let imageIndex = 0;
                  for (let i in images) {
                    if (!images.hasOwnProperty(i)) {
                      continue;
                    }
                    download
                      .image({
                        url: images[i],
                        dest: config.upload.designImagesFullPath
                      })
                      .then(({ filename }) => {
                        const splittedName = filename.split("\\");
                        const imageName =
                          splittedName[splittedName.length - 1] + ".png";

                        // Move file with another name
                        moveFile(filename, filename + ".png");
                        processedDesigns[imageIndex].imagePath =
                          config.upload.designImagesPath + imageName;
                        processedDesigns[imageIndex].imagePath =
                          config.upload.designImagesFullPath + imageName;

                        if (imageIndex === Object.keys(images).length - 1) {
                          /** If all design images saved => **/
                          saveDesignsToDataBase(res, processedDesigns);
                        }
                        imageIndex++;
                      });
                  }
                })
                .catch(message => {
                  return res.status(400).send(message);
                });
            });
          }
        })
        .catch(() => {
          return res.status(400).send("User not found or wrong api key");
        });
    });

    function saveDesignsToDataBase(res, designs) {
      const responseDesigns = [];
      designs.forEach((design, index) => {
        Design.create(design)
          .then(d => {
            responseDesigns.push(d);
            if (index === designs.length - 1) {
              return res.status(200).send(JSON.stringify(responseDesigns));
            }
          })
          .catch(message => {
            return res
              .status(400)
              .send("Error with save design! Log: " + message);
          });
      });
    }
  });

  app.post("/upload-design", (req, res) => {
    const designFile = req.files.design;
    if (!designFile || !req.fields.projectId) {
      return res.status(400).send("Required params did not provide!");
    }
    if (!fileTypes.includes(designFile.type)) {
      return res.status(400).send("Unsupported format or empty!");
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
                return res.status(400).send(message);
              }
              const responseDesigns = [];
              designs.forEach((design, index) => {
                Design.create({
                  projectId: req.fields.projectId,
                  blocks: design.blocks,
                  image: design.imagePath,
                  name: designFile.name,
                  width: design.document.width,
                  height: design.document.height
                })
                  .then(d => {
                    responseDesigns.push(d);
                    if (index === designs.length - 1) {
                      removeFile(tempPath);
                      return res
                        .status(200)
                        .send(JSON.stringify(responseDesigns));
                    }
                  })
                  .catch(message => {
                    return res
                      .status(400)
                      .send("Error with save design! Log: " + message);
                  });
              });
            });
          } else {
            removeFile(tempPath);
            return res
              .status(403)
              .send("You don't have rights to upload files to this project!");
          }
        })
        .catch(() => {
          removeFile(tempPath);
          return res.status(400).send("Project not found!");
        });
    });
  });
};

function upload(design, done) {
  let currentPsd = null;
  const designName =
    design.name.substring(0, design.name.lastIndexOf(".") + 1) + "png";
  const designImgTempPath = config.upload.tempPath + designName;
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
