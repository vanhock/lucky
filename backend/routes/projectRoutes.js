const { Project } = require("../sequelize");
const { getUserByToken, filterObject } = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-project", (req, res) => {
    getUserByToken(req, res, user => {
      if (!req.fields.name) {
        res.status(500).send("Name does not provide!");
      }
      Project.create({
        name: req.fields.name,
        userId: user.id
      }).then(response => {
        res
          .status(200)
          .send("Project created: " + JSON.stringify(response.dataValues));
      });
    });
  });

  app.post("/edit-project", (req, res) => {
    getUserByToken(req, res, user => {
      if (!req.fields.id) {
        res.status(500).send("Id did not provide!");
      }
      if (req.fields.name === "") {
        res.status(500).send("Name can't have an empty value!");
      }
      const fieldsToEdit = filterObject(req.fields, ["name"]);
      Project.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(project => {
          if (project.userId === user.id || user.isAdmin) {
            project.update(fieldsToEdit).then(project => {
              res
                .status(200)
                .send(
                  JSON.stringify(filterObject(project.dataValues, ["name"]))
                );
            });
          } else {
            res
              .status(500)
              .send("You don't have rights for edit this project!");
          }
        })
        .catch(() => {
          res.status(500).send("Project not found!");
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
          res.status(200).send(JSON.stringify(projects));
        })
        .catch(() => {
          res.status(500).send("Projects not found for this user!");
        });
    });
  });
};
