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
        ...filterObject(req.query, ["url", "name"])
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
          const emails = JSON.parse(req.fields.email);
          const invitedUsers = [];
          emails.forEach(email => {
            User.options.classMethods.createNewUser(
              { email: email },
              (error, user) => {
                if (error) {
                  return res.error(error);
                }
                updateProjectUser(
                  req,
                  res,
                  project,
                  user,
                  { role: req.fields.role },
                  () => {
                    invitedUsers.push(user);
                  }
                );
              }
            );
          });
          res.status(200).send(JSON.stringify(invitedUsers));
        }
      ).catch(error => {
        res.error(error);
      });
    });
  });

  app.post("/delete-project", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      user.getProjects({ id: req.fields.id }).then(projects => {
        if (!projects.length) {
          return res.status(200).send(JSON.stringify([]));
        }

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
      });
    });
  });
};
