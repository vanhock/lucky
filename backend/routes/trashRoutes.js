const sequelize = require("sequelize");
const config = require("../config/config");
const { Trash, Task } = require("../sequelize");
const { getUserByToken, checkProjectAccess } = require("../libs/helpers");

module.exports = function(app) {
  app.get("/get-projects-trash", (req, res) => {
    getUserByToken(req, res, user =>
      user
        .getProjects({
          where: {
            trashId: {
              [sequelize.Op.not]: null
            }
          }
        })
        .then(projects => {
          return res
            .status(200)
            .send(
              JSON.stringify(
                projects.filter(p =>
                  config.rights.edit.includes(p.user_project.dataValues.role)
                )
              )
            );
        })
        .catch(message => {
          return res.error("Error with getting trashed projects: " + message);
        })
    );
  });

  app.post("/move-project-to-trash", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      checkProjectAccess(
        {
          id: req.fields.id,
          trashId: null
        },
        user,
        undefined,
        (error, project) => {
          if (error) {
            return res.error(error);
          }
          Trash.create().then(trash => {
            project.update({ trashId: trash.id });
            res.status(200).send(JSON.stringify(project));
          });
        }
      );
    });
  });

  app.post("/restore-project", (req, res) => {
    if (!req.fields.id) {
      return res.error("Id did not provide!");
    }
    getUserByToken(req, res, user => {
      checkProjectAccess(
        {
          id: req.fields.id
        },
        user,
        undefined,
        (error, project) => {
          removeItemFromTrash(project.trashId, status => {
            if (status === "fail") {
              return res.error(null, 500);
            }
            project.update({ trashId: null }).then(project => {
              return res.status(200).send(JSON.stringify(project.dataValues));
            });
          });
        }
      );
    });
  });

  app.get("/get-tasks-trash", (req, res) => {
    getUserByToken(req, res, user => {
      user
        .getProjects({
          where: {
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
        .then(projects => {
          const tasksTrash = [];
          projects.forEach(project => {
            if (
              !config.rights.edit.includes(project.user_project.dataValues.role)
            ) {
              return;
            }
            project.tasks.forEach(task => tasksTrash.push(task.dataValues));
          });
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
          id: req.fields.id
        }
      })
        .then(task => {
          if (task.userId === user.id) {
            return moveToTrash(task);
          }
          checkProjectAccess(
            { id: task.projectId },
            user,
            config.rights.collaborator,
            error => {
              if (!error) {
                return res.error(error);
              }
              moveToTrash(task);
            }
          );
        })
        .catch(() => {
          res.error("Task not found");
        });
    });
    function moveToTrash(task) {
      Trash.create().then(trash => {
        task.update({ trashId: trash.id });
        res.status(200).send(JSON.stringify(task.dataValues));
      });
    }
  });

  app.post("/restore-task", (req, res) => {
    if (!req.fields.id) {
      return res.error("Task id did not provide!");
    }
    getUserByToken(req, res, user => {
      Task.findOne({
        where: {
          id: req.fields.id,
          trashId: { [sequelize.Op.not]: null }
        }
      })
        .then(task => {
          if (task.userId === user.id) {
            return restoreTask(task);
          }
          checkProjectAccess(
            { id: task.projectId },
            user,
            config.rights.collaborator,
            error => {
              if (!error) {
                return res.error(error);
              }
              restoreTask(task);
            }
          );
        })
        .catch(() => {
          res.error("Task not found");
        });
    });
    function restoreTask(task) {
      removeItemFromTrash(task.dataValues.trashId, status => {
        if (status === "fail") {
          return res.error(null, 500);
        }
        task.update({ trashId: null }).then(task => {
          return res.status(200).send(JSON.stringify(task.dataValues));
        });
      });
    }
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
