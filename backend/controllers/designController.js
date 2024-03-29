const config = require("../config/config");
const {
  getUserByToken,
  checkProjectAccess,
  filterObject,
  normalizeFigma,
  moveFile,
  normalizePSD,
  removeFile
} = require("../libs/helpers");
const { Design, Project } = require("../sequelize");

const getProjectDesigns = (req, res) => {
  if (!req.fields.projectId) {
    return res.error("Project id did not provide!");
  }
  getUserByToken(req, res, user => {
    checkProjectAccess(
      { id: req.fields.projectId },
      user,
      config.rights.view,
      error => {
        if (error) {
          return res.error(error);
        }
        Design.findAll({
          where: {
            projectId: req.fields.projectId
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
      }
    );
  });
};

const deleteDesigns = (req, res, cb) => {
  if (!req.fields.projectId) {
    return cb("Required params did not provide!");
  }

  const ids = (req.fields.ids && req.fields.ids.split(",")) || null;

  getUserByToken(req, res, user => {
    checkProjectAccess({ id: req.fields.projectId }, user, undefined, error => {
      if (error) {
        return cb(error);
      }
      const designSearchParams = (ids && {
        id: ids,
        projectId: req.fields.projectId
      }) || { projectId: req.fields.projectId };

      Design.findAll({
        where: designSearchParams
      })
        .then(designs => {
          if (!designs.length) {
            return cb(`Designs with ids: ${req.fields.ids} not found!`);
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
          return cb(
            null,
            `Designs with ids: ${req.fields.ids} successfully deleted!`
          );
        })
        .catch(() => {
          return cb(`Designs with ids: ${req.fields.ids} not found!`);
        });
    });
  });
};

const fileTypes = ["image/vnd.adobe.photoshop", "application/octet-stream"];
const download = require("image-downloader");
const axios = require("axios");
const figma = axios.create({
  baseURL: "https://api.figma.com/v1",
  headers: {
    "X-FIGMA-TOKEN": config.authorization.figmaAccessToken
  }
});

const getFigmaDesigns = (req, res) => {
  if (!req.fields.projectId || !req.fields.fileUrl) {
    return res.error("Required fields did not provide!");
  }
  const id = req.fields.fileUrl
    .match(/\/file\/(.*)\//)
    .pop()
    .replace("/file/", "");

  getUserByToken(req, res, user => {
    checkProjectAccess({ id: req.fields.projectId }, user, undefined, error => {
      if (error) {
        return res.error(error);
      }

      figma.get(`/files/${id}`).then(response => {
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
            projectId: req.fields.projectId,
            blocks: normalizeFigma(artboard),
            image: "",
            width: artboard.absoluteBoundingBox.width,
            height: artboard.absoluteBoundingBox.height
          });
        });
        const imagesUrl = `/images/${id}?ids=${designIds.join(",")}`;
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
            return res.error(message);
          });
      });
    });
  });
};

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
        return res.status(400).send("Error with save design! Log: " + message);
      });
  });
}

const PSD = require("psd");

const uploadDesign = (req, res) => {
  const designFile = req.files.design;
  if (!designFile || !req.fields.projectId) {
    return res.error("Required params did not provide!");
  }
  if (!fileTypes.includes(designFile.type)) {
    return res.error("Unsupported format or empty!");
  }
  const tempPath = designFile.path;
  getUserByToken(req, res, user => {
    checkProjectAccess({ id: req.fields.projectId }, user, undefined, error => {
      if (error) {
        removeFile(tempPath);
        return res.error(error);
      }

      upload(designFile, (message, designs) => {
        if (message) {
          return res.error(message);
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
                return res.status(200).send(JSON.stringify(responseDesigns));
              }
            })
            .catch(message => {
              return res
                .status(400)
                .send("Error with save design! Log: " + message);
            });
        });
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
    case "another":
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

module.exports = {
  getProjectDesigns,
  deleteDesigns,
  getFigmaDesigns,
  uploadDesign
};
