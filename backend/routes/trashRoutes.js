const sequelize = require("sequelize");

const { Project, Page, Trash } = require("../sequelize");
const { getUserByToken } = require("../libs/helpers");

module.exports = function(app) {
  app.get("/get-projects-trash", (req, res) => {
    getUserByToken(req, res, user => {
      Project.findAll({
        where: {
          userId: user.id,
          trashId: {
            [sequelize.Op.not]: null
          }
        }
      })
        .then(projects => {
          return res.status(200).send(JSON.stringify(projects));
        })
        .catch(message => {
          return res.error("Error with getting trashed projects: " + message);
        });
    });
  });

  app.post("/move-project-to-trash", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: req.fields.id,
          trashId: null
        }
      })
        .then(project => {
          if (!project) {
            return res.error("Project not found");
          }
          if (project.userId === user.id || user.isAdmin) {
            Trash.create().then(trash => {
              project.update({ trashId: trash.id });
              res.status(200).send(JSON.stringify(project));
            });
          } else {
            return res.error({
              title: "You don't have rights for delete this project!",
              code: 403
            });
          }
        })
        .catch(error => res.error(error));
    });
  });

  app.post("/restore-project", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      const fieldsToEdit = { trashId: null };
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
            removeItemFromTrash(project.trashId, status => {
              if (status === "fail") {
                return res.error(null, 500);
              }
              project.update(fieldsToEdit).then(project => {
                return res.status(200).send(JSON.stringify(project.dataValues));
              });
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

  app.get("/get-pages-trash", (req, res) => {
    if (!req.query.projectId) {
      return res.error("Project id did not provide!");
    }
    const projectId = req.query.projectId;
    getUserByToken(req, res, user => {
      Project.findOne({
        where: {
          id: projectId,
          trashId: null
        }
      })
        .then(project => {
          if (project.userId === user.id || user.isAdmin) {
            Page.findAll({
              where: {
                projectId: projectId,
                trashId: {
                  [Op.ne]: null
                }
              }
            })
              .then(pages => {
                return res.status(200).send(JSON.stringify(pages));
              })
              .catch(() => {
                return res.error("Have no pages found for this project!");
              });
          } else {
            res.error({
              title: "You don't have rights to view pages of this project!",
              code: 403
            });
          }
        })
        .catch(() => {
          return res.error("Project not found by id!");
        });
    });
  });
};

function removeItemFromTrash(id, callback) {
  try {
    Trash.destroy({
      where: {
        id: id
      }
    });
    return callback("success");
  } catch (error) {
    return callback("fail");
  }
}
