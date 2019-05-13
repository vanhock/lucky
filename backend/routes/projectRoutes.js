const { Project, Page, Design, Comment, Trash } = require("../sequelize");
const { getUserByToken, filterObject } = require("../libs/helpers");
const sequelize = require("sequelize");
module.exports = function(app) {
  app.post("/create-project", (req, res) => {
    getUserByToken(req, res, user => {
      Project.create({
        name: req.fields.name || "Untitled",
        userId: user.id
      }).then(response => {
        return res.status(200).send(JSON.stringify(response.dataValues));
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
            project.update(fieldsToEdit).then(project => {
              return res.status(200).send(JSON.stringify(project.dataValues));
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
          id: req.query.id
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
          if (req.fields.name !== project.name) {
            return res.error("Name check didn't pass!");
          }
          if (project.userId === user.id || user.isAdmin) {
            project.destroy();
            Page.destroy({
              where: {
                projectId: project.id
              }
            });
            Design.destroy({
              where: {
                projectId: project.id
              }
            });
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
