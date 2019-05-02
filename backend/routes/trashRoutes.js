const { Project, Trash } = require("../sequelize");
const { getUserByToken, filterObject } = require("../libs/helpers");

module.exports = function(app) {
  app.post("/create-project", (req, res) => {
    getUserByToken(req, res, user => {
      Project.findAll({
        where: {
          userId: user.id,
          trashId: {

          }
        }
      })
        .then(projects => {
          return res.status(200).send(JSON.stringify(projects));
        })
        .catch(message => {
          return res
            .status(400)
            .send("Error with getting projects: " + message);
        });
    });
  });
};
