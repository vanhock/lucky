const sequelize = require("sequelize");
const { Task, Page } = require("../sequelize");
const {
  checkProjectAccess,
  getUserByToken,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-task", (req, res) => {
    if (!req.fields.id) {
      return res.error("Page id did not provide!");
    }
    getUserByToken(req, res, user => {
      checkPageAccess(req, res, null, () => {
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
      });
    });
  });

  app.get("/get-all-tasks", (req, res) => {
    if (!req.query.pageId) {
      return res.error("Page id did not provide!");
    }
    const sort = req.query.sort || "updatedAt";
    const orderBy = req.query.sort === "name" ? "ASC" : "DESC";
    getUserByToken(req, res, user => {
      checkPageAccess(req, res, user, [], () => {
        Task.findAll({
          where: {
            pageId: req.query.pageId,
            userId: user.id,
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
      });
    });
  });

  app.post("/edit-task", (req, res) => {
    if (!req.fields.id) {
      return res.error("Task id did not provide!");
    }
    getUserByToken(req, res, user => {
      checkPageAccess(req, res, user, null, () => {
        Task.findOne({
          where: {
            id: req.fields.id
          }
        })
          .then(task => {
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
          })
          .catch(() => {
            return res.error("Task not found!");
          });
      });
    });
  });

  app.post("/delete-task", (req, res) => {
    if (!req.fields.id) {
      return res.error("Task id did not provide!");
    }
    getUserByToken(req, res, user => {
      checkPageAccess(req, res, user, null, () => {
        Task.findOne({
          where: {
            id: req.fields.id
          }
        })
          .then(task => {
            task.destroy();
            return res.status(200).send("Task deleted!");
          })
          .catch(() => {
            return res.error("Task not found!");
          });
      });
    });
  });
};

function checkPageAccess(
  req,
  res,
  user,
  roles = ["owner", "admin", "collaborator"],
  cb
) {
  Page.findOne({
    where: {
      id: req.fields.id
    }
  })
    .then(page => {
      checkProjectAccess(page.projectId, user, (error, role) => {
        if (error) {
          return res.error(error);
        }

        if (roles === [] || roles.some(r => r === role)) {
          return cb();
        }
        return res.error("Access to page denied!");
      });
    })
    .catch(() => {
      return res.error({ title: "Page not found!", code: 404 });
    });
}
