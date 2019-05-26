const { checkAllowChangesToPage } = require("../libs/helpers");

const sequelize = require("sequelize");

const { Project, Page, Trash, Task } = require("../sequelize");
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
    getUserByToken(req, res, user => {
      Project.findAll({
        where: {
          userId: user.id,
          trashId: null
        },
        include: {
          model: Page,
          as: "pages",
          where: {
            trashId: {
              [sequelize.Op.not]: null
            }
          }
        }
      })
        .then(projects => {
          const pagesTrash = [];
          projects.forEach(project =>
            project.pages.forEach(page => pagesTrash.push(page.dataValues))
          );
          return res.status(200).send(JSON.stringify(pagesTrash));
        })
        .catch(() => {
          return res.error("Have no pages found for this project!");
        });
    });
  });
  app.post("/move-page-to-trash", (req, res) => {
    if (!req.fields.id || !req.fields.projectId) {
      return res.error("Required fields did not provide!");
    }
    checkAllowChangesToPage(req, res, page => {
      Trash.create().then(trash => {
        page.update({ trashId: trash.id });
        res.status(200).send(JSON.stringify(page.dataValues));
      });
    });
  });

  app.post("/restore-page", (req, res) => {
    if (!req.fields.id) {
      return res.error("Page id did not provide!");
    }
    getUserByToken(req, res, user => {
      Project.findAll({
        where: {
          userId: user.id,
          trashId: null
        },
        include: {
          model: Page,
          where: {
            id: req.fields.id
          }
        }
      })
        .then(projects => {
          const page = projects[0].pages[0];
          removeItemFromTrash(page.dataValues.trashId, status => {
            if (status === "fail") {
              return res.error(null, 500);
            }
            page.update({ trashId: null }).then(page => {
              return res.status(200).send(JSON.stringify(page.dataValues));
            });
          });
        })
        .catch(() => {
          return res.error("Page not found!");
        });
    });
  });

  app.get("/get-tasks-trash", (req, res) => {
    getUserByToken(req, res, user => {
      Page.findAll({
        where: {
          userId: user.id,
          trashId: null
        },
        include: {
          model: Task,
          as: "tasks",
          where: {
            trashId: {
              [sequelize.Op.not]: null
            }
          }
        }
      })
        .then(pages => {
          const tasksTrash = [];
          pages.forEach(page =>
            page.tasks.forEach(task => tasksTrash.push(task.dataValues))
          );
          return res.status(200).send(JSON.stringify(tasksTrash));
        })
        .catch(() => {
          return res.error("Have no tasks found for this page!");
        });
    });
  });
  app.post("/move-task-to-trash", (req, res) => {
    if (!req.fields.id) {
      return res.error("Task did not provide!");
    }
    getUserByToken(req, res, user => {
      Task.findOne({
        where: {
          id: req.fields.id,
          userId: user.id
        }
      })
        .then(task => {
          Trash.create().then(trash => {
            task.update({ trashId: trash.id });
            res.status(200).send(JSON.stringify(task.dataValues));
          });
        })
        .catch(() => {
          res.error("Task not found");
        });
    });
  });

  app.post("/restore-task", (req, res) => {
    if (!req.fields.id) {
      return res.error("Task id did not provide!");
    }
    getUserByToken(req, res, user => {
      Page.findAll({
        where: {
          userId: user.id,
          trashId: null
        },
        include: {
          model: Task,
          where: {
            id: req.fields.id
          }
        }
      })
        .then(pages => {
          const task = pages[0].tasks[0];
          removeItemFromTrash(task.dataValues.trashId, status => {
            if (status === "fail") {
              return res.error(null, 500);
            }
            task.update({ trashId: null }).then(task => {
              return res.status(200).send(JSON.stringify(task.dataValues));
            });
          });
        })
        .catch(() => {
          return res.error("Task not found!");
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
