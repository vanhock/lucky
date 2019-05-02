const { Project, Page, Design } = require("../sequelize");
const { getUserByToken, filterObject } = require("../libs/helpers");

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
            return res
              .status(403)
              .send("You don't have rights for edit this project!");
          }
        })
        .catch(message => {
          return res.error("Error with getting project: " + message);
        });
    });
  });

  app.get("/get-all-projects", (req, res) => {
    getUserByToken(req, res, user => {
      Project.findAll({
        where: {
          userId: user.id
        }
      })
        .then(projects => {
          return res.status(200).send(JSON.stringify(projects));
        })
        .catch(message => {
          return res
            .status(400)
            .send("Error with getting projects: " + message);
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
            res
              .status(403)
              .send("You don't have rights for delete this project!");
          }
        })
        .catch(() => {
          return res.error("Projects not found for this user!");
        });
    });
  });
};
