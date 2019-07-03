const { Project, Page, User } = require("../sequelize");
const {
  getUserByToken,
  filterObject,
  updateProjectUser,
  checkProjectAccess,
  getUrlData,
  removeFolder
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
      const permalink = crypto.randomBytes(4).toString("hex");
      const targetUrl = (req.fields.url = !req.fields.url.includes("http")
        ? `https://${req.fields.url}`
        : req.fields.url);
      isReachable(targetUrl)
        .then(() => {
          getUrlData(targetUrl)
            .then(r => {
              const title =
                r
                  .match(/<title[^>]*>([^<]+)<\/title>/)[1]
                  .replace(
                    /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
                    ""
                  ) || "Untitled";
              Project.create({
                name: title,
                url: targetUrl,
                permalink: permalink
              }).then(project => {
                updateProjectUser(
                  req,
                  res,
                  project,
                  user,
                  { role: "owner" },
                  () => {
                    Page.create({
                      name: title,
                      projectId: project.dataValues.id,
                      url: req.fields.url
                    }).then(() => {
                      return res
                        .status(200)
                        .send(JSON.stringify(project.dataValues));
                    });
                  }
                );
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

  app.post("/download-project-resources", (req, res) => {
    if (!req.fields.folder || !req.fields.url) {
      return res.error("Required fields (folder, url) did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          permalink: req.fields.folder
        }
      }).then(project => {
        const imgUrl = `${config.upload.projectsFolderFullPath}${
          project.permalink
        }/shot.png`;
        const resultImg = `${config.upload.projectsFolderPath}${
          project.permalink
        }/shot.png`;
        const puppeteer = require("puppeteer");
        (async () => {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.goto(req.fields.url);
          const screenshot = await page.screenshot({ path: imgUrl });
          if (screenshot) {
            project
              .update({ image: resultImg })
              .then(() => {
                return res
                  .status(200)
                  .send(JSON.stringify({ image: resultImg }));
              })
              .catch(error => {
                res.error(`Error with creating screenshot: ${error}`);
              });
          }
          await browser.close();
        })();
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
          checkProjectAccess(project, user, (error, role) => {
            if (error) {
              res.error(error);
            }
            if (role === "owner" || role === "admin") {
              project
                .update(fieldsToEdit)
                .then(project => {
                  return res
                    .status(200)
                    .send(JSON.stringify(project.dataValues));
                })
                .catch(() => {
                  res.error("Error with edit project");
                });
            }
          });
        })
        .catch(message => {
          return res.error("Error with getting project: " + message);
        });
    });
  });

  app.get("/get-project", (req, res) => {
    if (!req.query.id && !req.query.permalink) {
      return res.error("Required params did not provide!");
    }
    const params = {
      trashId: null
    };
    req.query.id
      ? (params.id = req.query.id)
      : req.query.permalink
      ? (params.permalink = req.query.permalink)
      : "";
    Project.findOne({
      where: params
    })
      .then(project => {
        if (project.status === "closed") {
          return res.error({ title: "Project closed!", code: 500 });
        }
        if (req.headers.authorization) {
          User.options.classMethods.authByToken(
            req.headers.authorization,
            (message, user) => {
              if (user) {
                checkProjectAccess(project, user, (error, role) => {
                  if (role) {
                    return res.status(200).send(JSON.stringify(project));
                  }
                });
              }
            }
          );
        }
        return res
          .status(200)
          .send(JSON.stringify(filterObject(project, ["permalink, status"])));
      })
      .catch(() => {
        res.error("Project not found!");
      });
  });

  app.get("/get-all-projects", (req, res) => {
    const sort = req.query.sort || "updatedAt";
    const orderBy = req.query.sort === "name" ? "ASC" : "DESC";
    const setQuery = (p = {}) => {
      const params = { trashId: null, ...p };
      const query = {
        where: params,
        attributes: [
          "name",
          "id",
          "image",
          "permalink",
          "url",
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
      user
        .getProjects()
        .then(userProjects => {
          if (!userProjects.length) {
            return res.status(200).send(JSON.stringify([]));
          }
          Project.findAll(
            setQuery({ permalink: userProjects.map(up => up.dataValues.permalink) })
          )
            .then(projects => {
              return res.status(200).send(JSON.stringify(projects));
            })
            .catch(message => {
              return res.error("Error with getting projects: " + message);
            });
        })
        .catch(() => {
          return res.status(200).send(JSON.stringify([]));
        });
    });
  });

  app.post("/invite-to-project", (req, res) => {
    if (!req.fields.id || !req.fields.role) {
      return res.error("Required fields didn't provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        id: req.fields.id
      })
        .then(project => {
          checkProjectAccess(project, user, (error, role) => {
            if (error) {
              return res.error(error);
            }
            if (role === "owner" || role === "admin") {
              updateProjectUser(
                req,
                res,
                project,
                user,
                {
                  role: req.fields.role
                },
                () => {
                  res.status(200);
                }
              );
            }
          });
        })
        .catch(error => {
          res.error(error);
        });
    });
  });

  app.post("/delete-project", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    /** ToDo: Add access check for project delete **/
    getUserByToken(req, res, user => {
      Project.findAll({
        where: {
          id: req.fields.id
        }
      })
        .then(projects => {
          if (!projects.length) {
            return res.error("Project not found!");
          }
          projects.forEach(project => {
            if (project.userId === user.id || user.isAdmin) {
              project.destroy();
              Page.destroy({
                where: {
                  projectId: project.id
                }
              });
              req.fields.projectId = project.id;
              deleteDesigns(req, res);
              removeFolder(
                config.upload.projectsFolderFullPath + project.permalink,
                () => {}
              );
              return res.status(200).send("Project deleted!");
            } else {
              return res.error({
                title: "You don't have rights for delete this project!",
                code: 403
              });
            }
          });
        })
        .catch(() => {
          return res.error("Projects not found for this user!");
        });
    });
  });
};
