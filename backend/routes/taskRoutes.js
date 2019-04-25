const { Task } = require("../sequelize");
const {
  getUserByToken,
  checkAllowChangesToPage,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-task", (req, res) => {
    if (!req.fields.pageId || !req.fields.name) {
      return res.status(500).send("Required fields did not provide!");
    }
    checkAllowChangesToPage(req, res, (page, project, user) => {
      Task.create({
        userId: user.id,
        ...req.fields
      })
        .then(task => {
          return res.status(200).send(JSON.stringify(task));
        })
        .catch(message => {
          return res.status(500).send(message);
        });
    });
  });

  app.get("/get-all-tasks", (req, res) => {
    if (!req.fields.pageId) {
      return res.status(500).send("Page id did not provide!");
    }
    checkAllowChangesToPage(req, res, () => {
      Task.findAll({
        where: {
          pageId: req.fields.pageId
        }
      })
        .then(tasks => {
          if (!tasks.length) {
            return res.status(500).send("Tasks not found");
          }
          return res.status(200).send(JSON.stringify(tasks));
        })
        .catch(message => {
          return res.status(500).send(message);
        });
    });
  });

  app.post("/edit-task", (req, res) => {
    if (!req.fields.id) {
      return res.status(500).send("Task id did not provide!");
    }
    getUserByToken(req, res, user => {
      Task.findOne({
        where: {
          id: req.fields.id
        }
      }).then(task => {
        if (!task) {
          return res.status(500).send("Task not found!");
        }
        if (user.id === task.userId || user.isAdmin) {
          task
            .update({
              ...filterObject(req.fields, null, ["id", "userId", "pageId"])
            })
            .then(task => {
              return res.status(200).send(JSON.stringify(task));
            })
            .catch(message => {
              return res.status(500).send("Error with update task: " + message);
            });
        } else {
          return res
            .status(500)
            .send("You don't have rights to edit this task!");
        }
      });
    });
  });

  app.post("/delete-task", (req, res) => {
    if (!req.fields.id) {
      return res.status(500).send("Task id did not provide!");
    }
    getUserByToken(req, res, user => {
      Task.findOne({
        where: {
          id: req.fields.id
        }
      }).then(task => {
        if (!task) {
          return res.status(500).send("Task not found!");
        }
        if (user.id === task.userId || user.isAdmin) {
          task.destroy();
          return res.status(200).send("Task deleted!");
        } else {
          return res
            .status(500)
            .send("You don't have rights to delete this task!");
        }
      });
    });
  });
};
