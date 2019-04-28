const { Page, Project } = require("../sequelize");
const {
  getUserByToken,
  checkAllowChangesToPage,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-page", (req, res) => {
    if (!req.fields.websiteUrl) {
      return res.status(400).send("Website url did not provide!");
    }
    const websiteUrl = req.fields.websiteUrl;
    getUserByToken(req, res, user => {
      let projectId = req.fields.projectId;

      if (projectId) {
        return createPage();
      } else {
        /** Get the last project if a project id didn't provide **/
        Project.findAll({
          limit: 1,
          where: {
            userId: user.id
          },
          order: [["createdAt", "DESC"]]
        })
          .then(project => {
            projectId = project[0].dataValues.id;
            return createPage();
          })
          .catch(() => {
            /** If projects not found create new Untitled project **/
            Project.create({
              name: req.fields.url || "Untitled",
              userId: user.id
            }).then(project => {
              projectId = project.id;
              createPage();
            });
          });
      }
      function createPage() {
        Page.create({
          name: req.fields.name || "Untitled",
          userId: user.id,
          projectId: projectId,
          websiteUrl: websiteUrl
        })
          .then(page => {
            return res.status(200).send(JSON.stringify(page.dataValues));
          })
          .catch(() => {
            return res.status(400).send("Error with creating page!");
          });
      }
    });
  });

  app.get("/get-all-pages", (req, res) => {
    if (!req.query.projectId) {
      return res.status(400).send("Project id did not provide!");
    }
    const projectId = req.query.projectId;
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: projectId
        }
      })
        .then(project => {
          if (project.userId === user.id || user.isAdmin) {
            Page.findAll({
              where: {
                projectId: projectId
              }
            })
              .then(pages => {
                if (!pages.length) {
                  return res
                    .status(400)
                    .send("Have no pages found for this project!");
                }
                return res.status(200).send(JSON.stringify(pages));
              })
              .catch(() => {
                return res
                  .status(400)
                  .send("Have no pages found for this project!");
              });
          } else {
            res
              .status(403)
              .send("You don't have rights to view pages of this project!");
          }
        })
        .catch(() => {
          return res.status(400).send("Project not found by id!");
        });
    });
  });

  app.post("/delete-page", (req, res) => {
    if (!req.fields.pageId) {
      return res.status(400).send("Page id did not provide!");
    }
    checkAllowChangesToPage(req, res, page => {
      page.destroy();
      return res.status(200).send("Page deleted!");
    });
  });

  app.post("/move-page", (req, res) => {
    if (!req.fields.pageId || !req.fields.projectId) {
      return res.status(400).send("Required fields did not provide!");
    }
    checkAllowChangesToPage(req, res, (page, project, user) => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      })
        .then(targetProject => {
          if (!targetProject) {
            return res.status(400).send("Project of this page not found!");
          }
          if (user.id !== targetProject.userId) {
            res
              .status(400)
              .send("You don't allow to move the page to this project");
          }
          page
            .update({
              projectId: targetProject.id
            })
            .then(result => {
              return res.status(200).send(JSON.stringify(result));
            });
        })
        .catch(() => {
          return res.status(400).send("Target project did not found!");
        });
    });
  });

  app.post("/set-page-params", (req, res) => {
    const params = filterObject(req.fields, null, [
      "createdAt",
      "updatedAt",
      "projectId",
      "id"
    ]);
    checkAllowChangesToPage(req, res, page => {
      page
        .update(params)
        .then(result => {
          return res.status(200).send(JSON.stringify(result));
        })
        .catch(() => {
          return res.status(400).send("Error with update page params!");
        });
    });
  });
};
