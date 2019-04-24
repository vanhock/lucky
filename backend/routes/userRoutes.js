const config = require("../config/config");
const { User } = require("../sequelize");
const {
  getUserByToken,
  filterObject,
  removeFile,
  moveFile
} = require("../libs/helpers");

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
        return res.status(200).send("User created");
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
          return res.status(200).send(JSON.stringify(object));
        } else {
          return res.status(500).send("Error: " + response);
        }
      }
    );
  });

  app.post("/change-user-info", (req, res) => {
    if (!Object.keys(req.fields).length) {
      return res.status(500).send("Fields are empty!");
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
          return res.status(500).send("Error: " + message);
        });
    });
  });
  app.post("/set-user-avatar", (req, res) => {
    if (!Object.keys(req.files).length || !req.files.avatar) {
      return res.status(500).send("Avatar did not provide!");
    }
    const tempPath = req.files.avatar.path;
    const avatarName =
      req.files.avatar.name.substring(
        0,
        req.files.avatar.name.lastIndexOf(".") + 1
      ) + "png";
    getUserByToken(req, res, user => {
      moveFile(tempPath, config.upload.avatarFullPath + avatarName);
      user
        .update({
          avatar: config.upload.avatarPath + avatarName
        })
        .then(user => {
          return res
            .status(200)
            .send(JSON.stringify(filterObject(user.dataValues, allowedParams)));
        })
        .catch(message => {
          return res.status(500).send("Error: " + message);
        });
    });
    removeFile(tempPath);
  });

  app.post("/delete-user-avatar", (req, res) => {
    getUserByToken(req, res, user => {
      if (!user.avatar && !user.avatar.length) {
        return res.status(500).send("Avatar not set!");
      }
      removeFile(config.upload.path + user.avatar);
      user
        .update({
          avatar: null
        })
        .then(user => {
          return res
            .status(200)
            .send(JSON.stringify(filterObject(user.dataValues, allowedParams)));
        })
        .catch(message => {
          return res.status(500).send("Error: " + message);
        });
    });
  });
};
