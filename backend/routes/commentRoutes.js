const { Comment } = require("../sequelize");
const {
  getUserByToken,
  checkAllowChangesToPage,
  filterObject
} = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-comment", (req, res) => {
    if (!req.fields.pageId || !req.fields.text) {
      return res.status(500).send("Required fields did not provide!");
    }
    checkAllowChangesToPage(req, res, (page, project, user) => {
      Comment.create({
        userId: user.id,
        ...filterObject(req.fields, null, ["userId"])
      })
        .then(comment => {
          return res.status(200).send(JSON.stringify(comment));
        })
        .catch(message => {
          return res.status(500).send(message);
        });
    });
  });

  app.get("/get-all-comments", (req, res) => {
    if (!req.fields.pageId) {
      getUserByToken(req, res, user => {
        Comment.findAll({
          where: {
            userId: user.id
          }
        })
          .then(comments => {
            if (!comments.length) {
              return res.status(500).send("Comments not found");
            }
            return res.status(200).send(JSON.stringify(comments));
          })
          .catch(message => {
            return res.status(500).send(message);
          });
      });
    } else {
      checkAllowChangesToPage(req, res, () => {
        Comment.findAll({
          where: {
            pageId: req.fields.pageId
          }
        })
          .then(comments => {
            if (!comments.length) {
              return res.status(500).send("Comments not found");
            }
            return res.status(200).send(JSON.stringify(comments));
          })
          .catch(message => {
            return res.status(500).send(message);
          });
      });
    }
  });

  app.post("/edit-comment", (req, res) => {
    if (!req.fields.id) {
      return res.status(500).send("Comment id did not provide!");
    }
    getUserByToken(req, res, user => {
      Comment.findOne({
        where: {
          id: req.fields.id
        }
      })
        .then(comment => {
          if (!comment) {
            return res.status(500).send("Comment not found!");
          }
          if (user.id === comment.userId || user.isAdmin) {
            comment
              .update({
                ...filterObject(req.fields, ["text"])
              })
              .then(comment => {
                return res.status(200).send(JSON.stringify(comment));
              })
              .catch(message => {
                return res
                  .status(500)
                  .send("Error with update comment: " + message);
              });
          } else {
            return res
              .status(500)
              .send("You don't have rights to edit this comment!");
          }
        })
        .catch(message => {
          return res.status(500).send("Comment not found: " + message);
        });
    });
  });

  app.post("/delete-comment", (req, res) => {
    if (!req.fields.id) {
      return res.status(500).send("Comment id did not provide!");
    }
    getUserByToken(req, res, user => {
      Comment.findOne({
        where: {
          id: req.fields.id
        }
      }).then(comment => {
        if (!comment) {
          return res.status(500).send("Comment not found!");
        }
        if (user.id === comment.userId || user.isAdmin) {
          comment.destroy();
          return res.status(200).send("Comment deleted!");
        } else {
          return res
            .status(500)
            .send("You don't have rights to delete this comment!");
        }
      });
    });
  });
};
