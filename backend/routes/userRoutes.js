const config = require("../config/config");
const { User } = require("../sequelize");
const {
  getUserByToken,
  filterObject,
  removeFile,
  moveFile
} = require("../libs/helpers");

const allowedParams = [
  "id",
  "name",
  "avatarPath",
  "email",
  "company",
  "token",
  "createdAt",
  "updatedAt"
];
module.exports = function(app) {
  app.post("/registration", (req, res) => {
    if (!req.fields.email || !req.fields.password) {
      return res.error("Required fields did not provide!");
    }

    User.options.classMethods.createNewUser(req.fields, (error, user) => {
      if (error) {
        return res.error(error);
      }
      return res.status(200).send(
        JSON.stringify({
          message: "User created",
          user: filterObject(user, allowedParams)
        })
      );
    });
  });

  app.get("/auth-by-token", (req, res) => {
    getUserByToken(req, res, user => {
      res.status(200).send(filterObject(user.dataValues, allowedParams));
    });
  });

  app.post("/authorization", (req, res) => {
    if (!Object.keys(req.fields).length) {
      return;
    }
    if (!req.fields.email || !req.fields.password) {
      return res.error("Required fields did not provide!");
    }
    User.options.classMethods.authorization(
      req.fields.email,
      req.fields.password,
      (error, response) => {
        if (!error) {
          return res
            .status(200)
            .send(JSON.stringify(filterObject(response, allowedParams)));
        } else {
          return res.error(error);
        }
      }
    );
  });

  app.get("/check-user-exist", (req, res) => {
    if (!req.fields.email) {
      return res.error("Email did not provide!");
    }
    User.findOne({
      where: {
        email: req.fields.email
      }
    })
      .then(user => {
        if (!user) {
          return res
            .status(200)
            .send(JSON.stringify({ message: "User not found" }));
        }
        if (user.dataValues.oneTimePassword) {
          return res.status(200).send(
            JSON.stringify({
              message: "Password sent on your email!",
              oneTimePassword: true
            })
          );
        }
        return res.status(200);
      })
      .catch(error => res.error(error));
  });

  app.post("/change-user-info", (req, res) => {
    if (!Object.keys(req.fields).length) {
      return res.error("Fields are empty!");
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
          return res.error("Error: " + message);
        });
    });
  });
  app.post("/set-user-avatar", (req, res) => {
    if (!Object.keys(req.files).length || !req.files.avatar) {
      return res.error("Avatar did not provide!");
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
          return res.error("Error: " + message);
        });
    });
    //removeFile(tempPath);
  });

  app.post("/delete-user-avatar", (req, res) => {
    getUserByToken(req, res, user => {
      if (!user.avatarFullPath && !user.avatarFullPath.length) {
        return res.error("Avatar not set!");
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
          return res.error("Error: " + message);
        });
    });
  });
};
