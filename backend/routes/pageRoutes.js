const { Page, Project } = require("../sequelize");
const { getUserByToken } = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-page", (req, res) => {
    if (!req.fields.url) {
      return res.status(500).send("Website url did not provide!");
    }
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
          projectId: projectId
        })
          .then(page => {
            res.status(200).send(JSON.stringify(page.dataValues));
          })
          .catch(() => {
            return res.status(500).send("Error with creating page!");
          });
      }
    });
  });

  app.get("/get-all-pages", (req, res) => {
    if (!req.query.projectId) {
      res.status(500).send("Project id does not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.query.projectId
        }
      })
        .then(project => {
          if (project.userId === user.id || user.isAdmin) {
            Page.findAll({
              where: {
                projectId: req.query.projectId
              }
            })
              .then(pages => {
                res.status(200).send(JSON.stringify(pages));
              })
              .catch(() => {
                res.status(500).send("Have no pages found for this project!");
              });
          } else {
            res
              .status(500)
              .send("You don't have rights to view pages of this project!");
          }
        })
        .catch(() => {
          res.status(500).send("Project not found by id!");
        });
    });
  });
};
