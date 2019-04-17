const { Project, User } = require("../sequelize");
module.exports = function(app) {
  app.post("/create-project", (req, res) => {
    if (
      !req.headers.authorization ||
      !Object.keys(req.fields).length ||
      req.fields.name === ""
    ) {
      return;
    }
    User.options.classMethods.findByToken(
      req.headers.authorization,
      (message, user) => {
        if (!user) {
          res.status(500).send("User not found");
        }
        Project.create({
          name: req.fields.name,
          userId: user.id
        }).then(response => {
          res
            .status(200)
            .send("Project created: " + JSON.stringify(response.dataValues));
        });
      }
    );
  });
};
