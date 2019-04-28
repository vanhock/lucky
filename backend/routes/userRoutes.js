const config = require("../config/config");
const { User } = require("../sequelize");
const {
  getUserByToken,
  filterObject,
  removeFile,
  moveFile
} = require("../libs/helpers");

const allowedParams = ["id", "name", "avatarPath", "email", "company"];
module.exports = function(app) {
  app.post("/registration", (req, res) => {
    const fields = req.fields;
    if (
      !Object.keys(fields).length ||
      !fields.name ||
      !fields.email ||
      !fields.password
    ) {
      return res.error("Required fields did not provide!");
    }

    User.options.classMethods.createNewUser(
      {
        name: fields.name,
        email: fields.email,
        password: fields.password,
        company: fields.company
      },
      (fail, success) => {
        if (fail) {
          return res.error(fail);
        }
        return res.status(200).send(
          JSON.stringify({
            message: success
          })
        );
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
          return res.status(200).send(JSON.stringify(object));
        } else {
          return res.error(response);
        }
      }
    );
  });

  app.post("/change-user-info", (req, res) => {
    if (!Object.keys(req.fields).length) {
      return res.status(400).send("Fields are empty!");
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
          return res.status(400).send("Error: " + message);
        });
    });
  });
  app.post("/set-user-avatar", (req, res) => {
    if (!Object.keys(req.files).length || !req.files.avatar) {
      return res.status(400).send("Avatar did not provide!");
    }
    const tempPath = req.files.avatar.path;
    const avatarName =
      req.files.avatar.name.substring(
        0,
        req.files.avatar.name.lastIndexOf(".") + 1
      ) + "png";
    getUserByToken(req, res, user => {
      /**
       * Remove previous avatar first
       */
      removeFile(user.avatarFullPath, message => {
        console.log(message);
      });
      moveFile(tempPath, config.upload.avatarFullPath + avatarName, message => {
        console.log(message);
      });
      user
        .update({
          avatarPath: config.upload.avatarPath + avatarName,
          avatarFullPath: config.upload.avatarFullPath + avatarName
        })
        .then(user => {
          return res
            .status(200)
            .send(JSON.stringify(filterObject(user.dataValues, allowedParams)));
        })
        .catch(message => {
          return res.status(400).send("Error: " + message);
        });
    });
    //removeFile(tempPath);
  });

  app.post("/delete-user-avatar", (req, res) => {
    getUserByToken(req, res, user => {
      if (!user.avatarFullPath && !user.avatarFullPath.length) {
        return res.status(400).send("Avatar not set!");
      }
      removeFile(user.avatarFullPath, message => {
        console.log(message);
      });
      user
        .update({
          avatarPath: null,
          avatarFullPath: null
        })
        .then(user => {
          return res
            .status(200)
            .send(JSON.stringify(filterObject(user.dataValues, allowedParams)));
        })
        .catch(message => {
          return res.status(400).send("Error: " + message);
        });
    });
  });
};
