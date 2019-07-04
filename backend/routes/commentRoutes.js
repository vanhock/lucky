const config = require("../config/config");
const { Comment } = require("../sequelize");
const {
  getUserByToken,
  checkProjectAccess,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-comment", (req, res) => {
    if (
      !req.fields.id ||
      !req.fields.text ||
      !req.fields.pageId ||
      !req.fields.projectId
    ) {
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
          Comment.create({
            userId: user.id,
            ...filterObject(req.fields, null, ["userId"])
          })
            .then(comment => {
              return res.status(200).send(JSON.stringify(comment));
            })
            .catch(message => {
              return res.error(message);
            });
        }
      );
    });
  });

  app.get("/get-all-comments", (req, res) => {
    if (!req.fields.projectId) {
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
          Comment.findAll({
            where: {
              projectId: req.fields.projectId
            }
          })
            .then(comments => {
              if (!comments.length) {
                return res.error("Comments not found");
              }
              return res.status(200).send(JSON.stringify(comments));
            })
            .catch(message => {
              return res.error(message);
            });
        }
      );
    });
  });

  app.post("/edit-comment", (req, res) => {
    if (!req.fields.id) {
      return res.error("Comment id did not provide!");
    }
    getUserByToken(req, res, user => {
      Comment.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(comment => {
          if (comment.userId === user.id) {
            return editComment(comment);
          }
          checkProjectAccess(
            { id: req.query.projectId },
            user,
            config.rights.collaborator,
            error => {
              if (error) {
                return res.error(error);
              }
              return editComment(comment);
            }
          );
        })
        .catch(() => {
          return res.error("Task not found!");
        });
    });
    function editComment(comment) {
      comment
        .update({
          ...filterObject(req.fields, ["text"])
        })
        .then(comment => {
          return res.status(200).send(JSON.stringify(comment));
        })
        .catch(message => {
          return res.status(400).send("Error with update comment: " + message);
        });
    }
  });

  app.post("/delete-comment", (req, res) => {
    if (!req.fields.id) {
      return res.error("Comment id did not provide!");
    }
    getUserByToken(req, res, user => {
      Comment.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(comment => {
          if (comment.userId === user.id) {
            return deleteComment(comment);
          }
          checkProjectAccess(
            { id: req.query.projectId },
            user,
            config.rights.collaborator,
            error => {
              if (error) {
                return res.error(error);
              }
              return deleteComment(comment);
            }
          );
        })
        .catch(() => {
          return res.error("Task not found!");
        });
    });
    function deleteComment(comment) {
      comment.destroy();
      return res.status(200).send("Comment deleted!");
    }
  });
};
