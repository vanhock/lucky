const { Page, Project } = require("../sequelize");
const {
  getUserByToken,
  checkProjectAccess,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-page", (req, res) => {
    if (!req.fields.url || !req.fields.projectId) {
      return res.error("Required fields did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.projectId,
          userId: user.id
        }
      })
        .then(project => {
          checkProjectAccess(project, user, (error, role) => {
            if (error) {
              return res.error(error);
            }
            if (role === "owner" || role === "admin") {
              return Page.create({
                name: req.fields.name || "Untitled",
                projectId: req.fields.projectId,
                url: req.fields.url
              })
                .then(page => {
                  return res.status(200).send(JSON.stringify(page.dataValues));
                })
                .catch(message => {
                  return res.error("Error with creating page!" + message);
                });
            }
          });
        })
        .catch(() => {
          return res.error("Project not found!");
        });
    });
  });

  app.get("/get-page", (req, res) => {
    if (!req.query.url && !req.query.id) {
      return res.error("Required field did not provide!");
    }
    getUserByToken(req, res, user => {
      const params = { trashId: null };
      if (req.query.url) params.url = req.query.url;
      if (req.query.id) params.id = req.query.id;

      Page.findOne({
        where: params
      })
        .then(page => {
          checkProjectAccess(page.projectId, user, error => {
            if (error) {
              return res.error({
                title: "You don't have rights to view this page!",
                code: 403
              });
            }
            return res.status(200).send(JSON.stringify(page));
          });
        })
        .catch(() => {
          return res.error({ title: "Page not found!", code: 404 });
        });
    });
  });

  app.get("/get-pages", (req, res) => {
    if (!req.query.projectId) {
      return res.error("Required did not provide!");
    }
    getUserByToken(req, res, user => {
      const params = { trashId: null, projectId: req.query.projectId };
      if (req.query.url) params.url = req.query.url;
      checkProjectAccess(req.query.projectId, user, error => {
        if (error) {
          return res.error({
            title: "You don't have rights to get this pages!",
            code: 403
          });
        }
        return Page.findAll({
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
  });

  app.post("/delete-page", (req, res) => {
    if (!req.fields.id) {
      return res.error("Page id did not provide!");
    }
    getUserByToken(req, res, user => {
      Page.findAll({
        where: req.fields.id
      }).then(pages => {
        pages.forEach(page => {
          checkProjectAccess(page.projectId, user, (error, role) => {
            if (role === "owner" || role === "admin") {
              page.destroy();
            }
          });
        });
        return res.status(200).send("Page(s) deleted!");
      });
    });
  });

  app.post("/move-page", (req, res) => {
    if (!req.fields.id || !req.fields.projectId) {
      return res.error("Required fields did not provide!");
    }
    getUserByToken(req, res, user => {
      Page.findOne({
        where: {
          id: req.fields.id
        }
      }).then(page => {
        checkProjectAccess(page.projectId, user, (error, role) => {
          if (error) {
            return res.error(error);
          }
          if (role === "owner" || role === "admin") {
            page
              .update({
                projectId: req.fields.projectId
              })
              .then(result => {
                return res.status(200).send(JSON.stringify(result));
              });
          }
        });
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
