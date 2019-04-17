const { User } = require("../sequelize");
const allowedParams = ["id", "name", "avatar", "email", "company"];
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
      (response, object) => {
        if (!response) {
          res.status(200).send("User authorized: " + JSON.stringify(object));
        } else {
          res.status(500).send("Error: " + response);
        }
      }
    );
  });

  app.post("/change-user-info", (req, res) => {
    if (!req.headers.authorization || !Object.keys(req.query).length) {
      return;
    }
    const fields = req.query;

    User.options.classMethods.findByToken(
      req.headers.authorization,
      (message, user) => {
        if (!user) {
          res.status(500).send("User not found");
        }
        user
          .update(fields)
          .then(user => {
            res.status(200).send(
              "User edited: " +
                JSON.stringify(
                  Object.keys(user.dataValues)
                    .filter(key => allowedParams.includes(key))
                    .reduce((obj, key) => {
                      obj[key] = user.dataValues[key];
                      return obj;
                    }, {})
                )
            );
          })
          .catch(message => {
            res.status(500).send("Error: " + message);
          });
      }
    );
  });
  app.post("/set-user-avatar", (req, res) => {
    if (!req.headers.authorization) {
      return;
    }
    User.options.classMethods.findByToken(req.headers.authorization, (message, user) => {});
    console.log(req.files);
  });
};
