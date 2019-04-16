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
    User.options.classMethods.createNewUser({
      name: fields.name,
      email: fields.email,
      password: fields.password,
      company: fields.company
    });
    res.status(200).send("User created");
  });
};
