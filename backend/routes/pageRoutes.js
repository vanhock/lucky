const { Page, Project } = require("../sequelize");
const {
  getUserByToken,
  checkAllowChangesToPage,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-page", (req, res) => {
    if (!req.fields.websiteUrl) {
      return res.error("Website url did not provide!");
    }
    const websiteUrl = req.fields.websiteUrl;
    getUserByToken(req, res, user => {
      let projectId = req.fields.projectId;

      if (projectId) {
        Project.findOne({
          where: {
            id: projectId,
            userId: user.id
          }
        })
          .then(() => {
            return createPage();
          })
          .catch(() => {
            return res.error("You don't have rights for change this project!");
          });
      } else {
        /** Get the last project if a project id didn't provide **/

        /** If projects not found create new Untitled project **/
        Project.create({
          name: req.fields.projectName || "Untitled",
          userId: user.id
        }).then(project => {
          projectId = project.id;
          createPage();
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
          .catch(message => {
            return res.error("Error with creating page!" + message);
          });
      }
    });
  });

  app.get("/get-page", (req, res) => {
    if (!req.query.websiteUrl && !req.query.id) {
      return res.error("Required field did not provide!");
    }
    getUserByToken(req, res, user => {
      const params = { trashId: null };
      if (req.query.websiteUrl) params.websiteUrl = req.query.websiteUrl;
      if (req.query.id) params.id = req.query.id;
      if (!user.isAdmin) params.userId = user.id;

      Page.findOne({
        where: params
      })
        .then(page => {
          if (page.userId === user.id || user.isAdmin) {
            return res.status(200).send(JSON.stringify(page));
          } else {
            res.error({
              title: "You don't have rights to view this page!",
              code: 403
            });
          }
        })
        .catch(() => {
          return res.error({ title: "Page not found!", code: 404 });
        });
    });
  });

  app.get("/get-pages", (req, res) => {
    if (!req.query.websiteUrl && !req.query.projectId) {
      return res.error("Required did not provide!");
    }
    getUserByToken(req, res, user => {
      const params = { trashId: null };
      if (req.query.websiteUrl) params.websiteUrl = req.query.websiteUrl;
      if (req.query.projectId) params.projectId = req.query.projectId;
      if (!user.isAdmin) params.userId = user.id;

      Page.findAll({
        where: params
      })
        .then(pages => {
          return res.status(200).send(JSON.stringify(pages));
        })
        .catch(() => {
          return res.error("Have no pages found!");
        });
    });
  });

  app.post("/delete-page", (req, res) => {
    if (!req.fields.id) {
      return res.error("Page id did not provide!");
    }
    checkAllowChangesToPage(req, res, page => {
      page.destroy();
      return res.status(200).send("Page deleted!");
    });
  });

  app.post("/move-page", (req, res) => {
    if (!req.fields.id || !req.fields.projectId) {
      return res.error("Required fields did not provide!");
    }
    checkAllowChangesToPage(req, res, (page, project, user) => {
      Project.findOne({
        where: {
          id: req.fields.projectId
        }
      })
        .then(targetProject => {
          if (!targetProject) {
            return res.error("Project of this page not found!");
          }
          if (user.id !== targetProject.userId) {
            res.error({
              title: "You don't allow to move the page to this project",
              code: 403
            });
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
          return res.error("Target project did not found!");
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
          return res.error("Error with update page params!");
        });
    });
  });
};
