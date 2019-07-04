const sequelize = require("sequelize");
const config = require("../config/config");
const { Task } = require("../sequelize");
const {
  checkProjectAccess,
  getUserByToken,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-task", (req, res) => {
    if (!req.fields.pageId || !req.fields.projectId) {
      return res.error("Required fields did not provide!");
    }
    getUserByToken(req, res, user => {
      checkProjectAccess(
        { id: req.fields.projectId },
        user,
        config.rights.view,
        error => {
          if (error) {
            return res.error(error);
          }
          Task.create({
            userId: user.id,
            pageId: req.fields.id,
            name: req.fields.name || "Task",
            ...filterObject(req.fields, null, ["name", "id"])
          })
            .then(task => {
              return res.status(200).send(JSON.stringify(task));
            })
            .catch(message => {
              return res.error(message);
            });
        }
      );
    });
  });

  app.get("/get-all-tasks", (req, res) => {
    if (!req.query.projectId) {
      return res.error("Page id did not provide!");
    }
    const sort = req.query.sort || "updatedAt";
    const orderBy = req.query.sort === "name" ? "ASC" : "DESC";
    getUserByToken(req, res, user => {
      checkProjectAccess(
        { id: req.query.projectId },
        user,
        config.rights.view,
        error => {
          if (error) {
            return res.error(error);
          }
          Task.findAll({
            where: {
              projectId: req.query.projectId,
              trashId: null
            },
            order: [[sequelize.literal(sort), orderBy]]
          })
            .then(tasks => {
              if (!tasks.length) {
                return res.error("Tasks not found");
              }
              return res.status(200).send(JSON.stringify(tasks));
            })
            .catch(message => {
              return res.error(message);
            });
        }
      );
    });
  });

  app.post("/edit-task", (req, res) => {
    if (!req.fields.id || req.fields.projectId) {
      return res.error("Required fields did not provide!");
    }
    getUserByToken(req, res, user => {
      Task.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(task => {
          if (task.userId === user.id) {
            return editTask(task);
          }
          checkProjectAccess(
            { id: req.query.projectId },
            user,
            config.rights.collaborator,
            error => {
              if (error) {
                return res.error(error);
              }
              return editTask(task);
            }
          );
        })
        .catch(() => {
          return res.error("Task not found!");
        });
    });
    function editTask(task) {
      task
        .update({
          ...filterObject(req.fields, null, ["id", "userId"])
        })
        .then(task => {
          return res.status(200).send(JSON.stringify(task));
        })
        .catch(message => {
          return res.error("Error with update task: " + message);
        });
    }
  });

  app.post("/delete-task", (req, res) => {
    if (!req.fields.id || req.fields.projectId) {
      return res.error("Required fields did not provide!");
    }
    getUserByToken(req, res, user => {
      Task.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(task => {
          if (task.userId === user.id) {
            return deleteTask(task);
          }
          checkProjectAccess(
            { id: req.query.projectId },
            user,
            config.rights.collaborator,
            error => {
              if (error) {
                return res.error(error);
              }
              return deleteTask(task);
            }
          );
        })
        .catch(() => {
          return res.error("Task not found!");
        });
    });
    function deleteTask(task) {
      task.destroy();
      return res.status(200).send("Task deleted!");
    }
  });
};
