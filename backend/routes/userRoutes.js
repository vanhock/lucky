const { User } = require("../sequelize");
module.exports = function(app) {
  app.post("/registration", (req, res) => {
    if (!Object.keys(req.query).length) {
      return;
    }
    const fields = req.query;
    if (!fields.name || !fields.email || !fields.password) {
      return;
    }
    User.options.classMethods.createNewUser(
      {
        name: fields.name,
        email: fields.email,
        password: fields.password,
        company: fields.company
      },
      () => {
        res.status(200).send("User created");
      }
    );
  });
  app.get("/authorization", (req, res) => {
    if (!Object.keys(req.query).length) {
      return;
    }
    const fields = req.query;
    if (!fields.email || !fields.password) {
      return;
    }
    User.options.classMethods.authorization(
      fields.email,
      fields.password,
      response => {
        if (typeof response === "object") {
          res.status(200).send("User created", JSON.stringify(response));
        } else {
          res.status(500).send("Error: " + response);
        }
      }
    );
  });
};
