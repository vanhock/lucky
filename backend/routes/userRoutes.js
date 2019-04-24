const { User } = require("../sequelize");
const { getUserByToken, filterObject } = require("../libs/helpers");

const allowedParams = ["id", "name", "avatar", "email", "company"];
module.exports = function(app) {
  app.post("/registration", (req, res) => {
    const fields = req.fields;
    if (
      !Object.keys(fields).length ||
      !fields.name ||
      !fields.email ||
      !fields.password
    ) {
      return res.status(500).send("Required fields did not provide!");
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
    if (!Object.keys(req.fields).length) {
      return;
    }
    const fields = req.fields;
    if (!fields.email || !fields.password) {
      return;
    }
    User.options.classMethods.authorization(
      fields.email,
      fields.password,
      (response, object) => {
        if (!response) {
          res.status(200).send(JSON.stringify(object));
        } else {
          res.status(500).send("Error: " + response);
        }
      }
    );
  });

  app.post("/change-user-info", (req, res) => {
    if (!Object.keys(req.fields).length) {
      return;
    }
    const fields = req.fields;

    getUserByToken(req, res, user => {
      user
        .update(fields)
        .then(user => {
          res
            .status(200)
            .send(JSON.stringify(filterObject(user.dataValues, allowedParams)));
        })
        .catch(message => {
          res.status(500).send("Error: " + message);
        });
    });
  });
  app.post("/set-user-avatar", (req, res) => {
    console.log(req.files);
  });
};
