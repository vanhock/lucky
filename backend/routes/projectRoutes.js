const { Project, Page, User } = require("../sequelize");
const {
  getUserByToken,
  filterObject,
  updateProjectUser,
  checkProjectAccess,
  getUrlData,
  removeFolder,
  extractHostname
} = require("../libs/helpers");
const { deleteDesigns } = require("../controllers/designController");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const isReachable = require("is-reachable");
const config = require("../config/config");
const fs = require("fs");
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
                host: extractHostname(targetUrl).replace("www.", ""),
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

  app.post("/project-set-screenshot", (req, res) => {
    if (!req.fields.permalink || !req.fields.url) {
      return res.error("Required fields (folder, url) did not provide!");
    }
    getUserByToken(req, res, user => {
      checkProjectAccess(
        { permalink: req.fields.permalink },
        user,
        config.rights.edit,
        (error, project) => {
          if (error) {
            return res.error(error);
          }
          const imgFolder = `${config.upload.projectsFolderFullPath}${
            project.permalink
          }`;
          const imgUrl = `${imgFolder}/shot.png`;
          const resultImg = `${config.upload.projectsFolderPath}${
            project.permalink
          }/shot.png`;
          const puppeteer = require("puppeteer");
          (async () => {
            const puppeteerConfig = {
              headless: true,
              defaultViewport: { width: 1280, height: 2000 }
            };
            const browser = await puppeteer.launch(puppeteerConfig);
            const page = await browser.newPage();
            await page.goto(req.fields.url);
            if (!fs.existsSync(imgFolder)) {
              fs.mkdirSync(imgFolder);
            }
            const screenshot = await page.screenshot({
              path: imgUrl,
              fullPage: false
            });
            if (screenshot) {
              project
                .update({ image: resultImg })
                .then(resultProject => {
                  return res.status(200).send(JSON.stringify(resultProject));
                })
                .catch(error => {
                  res.error(`Error with creating screenshot: ${error}`);
                });
            }
            await browser.close();
          })();
        }
      );
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
      checkProjectAccess(
        { id: req.fields.id },
        user,
        config.rights.edit,
        (error, project) => {
          if (error) {
            return res.error(error);
          }
          return project
            .update(fieldsToEdit)
            .then(project => {
              return res.status(200).send(JSON.stringify(project.dataValues));
            })
            .catch(() => {
              res.error("Error with edit project");
            });
        }
      );
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
        if (!project) {
          return res.error("Project not found");
        }
        return res.status(200).send(JSON.stringify(project.dataValues));
      })
      .catch(() => {
        return res.error({ title: "Project not found", code: 404 });
      });
  });

  app.get("/get-all-projects", (req, res) => {
    const sort = req.query.sort || "updatedAt";
    const orderBy = req.query.sort === "name" ? "ASC" : "DESC";
    const setQuery = () => {
      const params = {
        trashId: null,
        ...filterObject(req.query, ["url", "name", "host"])
      };
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
              "(SELECT COUNT(*) FROM pages WHERE pages.projectId = project.id AND pages.trashId IS NULL)"
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
        .getProjects(setQuery())
        .then(projects => {
          if (!projects.length) {
            return res.status(200).send(JSON.stringify([]));
          }
          return res.status(200).send(JSON.stringify(projects));
        })
        .catch(message => {
          return res.error("Error with getting projects: " + message);
        });
    });
  });

  app.get("/check-access-to-project", (req, res) => {
    if (!req.fields.id && !req.query.permalink) {
      return res.error("Required fields didn't provide!");
    }
    const params = {
      trashId: null
    };
    req.query.id
      ? (params.id = req.query.id)
      : req.query.permalink
      ? (params.permalink = req.query.permalink)
      : "";
    getUserByToken(req, res, user => {
      checkProjectAccess(params, user, undefined, (error, project) => {
        if (error) {
          return res.error(error);
        }
        if (project.dataValues.status === "closed") {
          return res.error({ title: "Project are closed!", code: 403 });
        }
        return res.status(200).send(JSON.stringify(project.dataValues));
      });
    });
  });

  app.post("/invite-to-project", (req, res) => {
    if (!req.fields.id || !req.fields.role || !req.fields.email) {
      return res.error("Required fields didn't provide!");
    }
    getUserByToken(req, res, user => {
      checkProjectAccess(
        { id: req.fields.id },
        user,
        config.rights.edit,
        (error, project) => {
          if (error) {
            return res.error(error);
          }
          const email = req.fields.email;
          User.findOne({
            where: {
              email: email
            }
          })
            .then(foundUser => {
              addUser(project, foundUser);
            })
            .catch(() => {
              User.options.classMethods.createNewUser(
                { email: email },
                (error, foundUser) => {
                  if (error) {
                    return res.error(error);
                  }
                  addUser(project, foundUser);
                }
              );
            });
          function addUser(project, targetUser) {
            updateProjectUser(
              req,
              res,
              project,
              targetUser,
              { role: req.fields.role },
              () => {}
            );
          }
          res.status(200).send({ message: "User invited" });
        }
      );
    });
  });

  app.post("/revoke-access-to-project", (req, res) => {
    if (!req.fields.id || !req.fields.userId) {
      return res.error("Required fields didn't provide!");
    }
    getUserByToken(req, res, user => {
      checkProjectAccess(
        { id: req.fields.id },
        user,
        config.rights.edit,
        (error, project) => {
          if (error) {
            return res.error(error);
          }
          project
            .removeUser({
              where: {
                id: req.fields.userId
              }
            })
            .then(() => {
              return req.status(200);
            })
            .catch(error => {
              return res.error(error);
            });
        }
      );
    });
  });

  app.get("/get-project-users", (req, res) => {
    if (!req.query.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: { id: req.query.id }
      })
        .then(project => {
          project.getUsers().then(users => {
            if (!users.length) {
              return res.error("Users not found");
            }
            const result = users.map(user => ({
              id: user.dataValues.id,
              email: user.dataValues.email,
              name: user.dataValues.name,
              company: user.dataValues.company,
              role: user.user_project.dataValues.role,
              invitedAt: user.user_project.dataValues.createdAt,
              updatedAt: user.user_project.dataValues.updatedAt
            }));
            return res.status(200).send(JSON.stringify(result));
          });
        })
        .catch(() => {
          res.error("Project not found");
        });
    });
  });

  app.post("/delete-project", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      user
        .getProjects({
          where: {
            id: req.fields.id,
            trashId: { [Op.not]: null }
          }
        })
        .then(projects => {
          if (!projects.length) {
            return res.error("Projects not found");
          }
          let projectsCount = projects.length;
          projects.forEach(project => {
            if (
              config.rights.edit.includes(project.user_project.dataValues.role)
            ) {
              project.destroy();
              Page.destroy({
                where: {
                  projectId: project.id
                }
              });
              req.fields.projectId = project.id;
              deleteDesigns(req, res, () => {});
              removeFolder(
                config.upload.projectsFolderFullPath + project.permalink,
                () => {}
              );
              ++deletedProjectsCount;
            }
          });
          if (projectsCount >= 1) {
            return res.status(200).send(projects);
          }
          if (projectsCount === 0) {
            return res.error("Projects not found");
          }
        });
    });
  });
};
