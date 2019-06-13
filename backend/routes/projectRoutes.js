const { Project, Page } = require("../sequelize");
const {
  getUserByToken,
  filterObject,
  extractHostname,
  getUrlData,
  removeFile
} = require("../libs/helpers");
const { deleteDesigns } = require("../controllers/designController");
const sequelize = require("sequelize");
const isReachable = require("is-reachable");
const webshot = require("webshot");
const config = require("../config/config");
let crypto;
try {
  crypto = require("crypto");
} catch (err) {
  console.log("crypto support is disabled!");
}

module.exports = function(app) {
  app.post("/create-project", (req, res) => {
    getUserByToken(req, res, user => {
      const hostName = extractHostname(req.fields.url);
      const folderName = crypto.randomBytes(4).toString("hex");
      isReachable(req.fields.url)
        .then(() => {
          getUrlData(req.fields.url)
            .then(r => {
              Project.create({
                name: r.match(/<title[^>]*>([^<]+)<\/title>/)[1] || "Untitled",
                url: req.fields.url,
                userId: user.id,
                folderName: folderName
              }).then(response => {
                Page.create({
                  name: req.fields.name || "Untitled",
                  userId: user.id,
                  projectId: response.dataValues.id,
                  websiteUrl: req.fields.url
                }).then(() => {
                  return res
                    .status(200)
                    .send(JSON.stringify(response.dataValues));
                });
              });
            })
            .catch(error => {
              return res.error("Website not respond " + error);
            });
        })
        .catch(error => {
          return res.error("Website not respond " + error);
        });
    });
  });

  app.post("/get-project-screenshot", (req, res) => {
    if (!req.fields.id) {
      return res.error("Project id did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          userId: user.id,
          id: req.fields.id
        }
      })
        .then(project => {
          const imgUrl = `${config.upload.projectsFolderFullPath}${
            project.folderName
          }/shot.png`;
          const resultImg = `${config.upload.projectsFolderPath}${
            project.folderName
          }/shot.png`;
          webshot(project.url, imgUrl, err => {
            if (!err) {
              project
                .update({ image: resultImg })
                .then(resultProject => {
                  return res
                    .status(200)
                    .send(JSON.stringify(resultProject.dataValues));
                })
                .catch(() => {
                  res.error("Error with edit project");
                });
            }
          });
        })
        .catch(() => {
          res.error("Project not found");
        });
    });
  });
  app.post("/edit-project", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      if (req.fields.name === "") {
        return res.error("Name can't have an empty value!");
      }
      const fieldsToEdit = filterObject(req.fields, ["name"]);
      Project.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(project => {
          if (!project) {
            return res.error("Project not found!");
          }
          if (project.userId === user.id || user.isAdmin) {
            project
              .update(fieldsToEdit)
              .then(project => {
                return res.status(200).send(JSON.stringify(project.dataValues));
              })
              .catch(() => {
                res.error("Error with edit project");
              });
          } else {
            return res.error({
              title: "You don't have rights for edit this project!",
              code: 403
            });
          }
        })
        .catch(message => {
          return res.error("Error with getting project: " + message);
        });
    });
  });

  app.get("/get-project", (req, res) => {
    if (!req.query.id) {
      return res.error("Project id did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          userId: user.id,
          id: req.query.id,
          trashId: null
        }
      })
        .then(project => {
          return res.status(200).send(JSON.stringify(project));
        })
        .catch(message => {
          return res.error("Error with getting project: " + message);
        });
    });
  });

  app.get("/get-all-projects", (req, res) => {
    const sort = req.query.sort || "updatedAt";
    const orderBy = req.query.sort === "name" ? "ASC" : "DESC";
    const setQuery = user => {
      const query = {
        where: {
          userId: user.id,
          trashId: null
        },
        attributes: [
          "name",
          "id",
          "updatedAt",
          "createdAt",
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM Pages WHERE Pages.projectId = Project.id AND Pages.trashId IS NULL)"
            ),
            "pagesCount"
          ]
        ],
        order: [[sequelize.literal(sort), orderBy]]
      };
      if (req.query.limit) {
        query.limit = parseInt(req.query.limit);
      }
      return query;
    };

    getUserByToken(req, res, user => {
      Project.findAll(setQuery(user))
        .then(projects => {
          return res.status(200).send(JSON.stringify(projects));
        })
        .catch(message => {
          return res.error("Error with getting projects: " + message);
        });
    });
  });

  app.post("/delete-project", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(project => {
          if (!project) {
            return res.error("Project not found!");
          }
          if (project.userId === user.id || user.isAdmin) {
            project.destroy();
            Page.destroy({
              where: {
                projectId: project.id
              }
            });
            req.fields.projectId = project.id;
            deleteDesigns(req, res);
            removeFile(
              config.upload.projectsFolderFullPath + project.folderName
            );
            return res.status(200).send("Project deleted!");
          } else {
            res.error({
              title: "You don't have rights for delete this project!",
              code: 403
            });
          }
        })
        .catch(() => {
          return res.error("Projects not found for this user!");
        });
    });
  });
};
