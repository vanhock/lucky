const config = require("../config/config");
const { User } = require("../sequelize");
const {
  getUserByToken,
  filterObject,
  removeFile,
  moveFile,
  sendMail
} = require("../libs/helpers");
const { defaultMailTemplate } = require("../libs/mailTemplates");

const allowedParams = [
  "id",
  "name",
  "avatarPath",
  "email",
  "company",
  "token",
  "createdAt",
  "updatedAt",
  "status",
  "confirmationCodeTimeout",
  "confirmationCodeCreatedAt",
  "oneTimePassword"
];
const allowedToEditParams = ["name", "company", "oneTimePassword"];
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
    if (!req.query.email) {
      return res.error("Email did not provide!");
    }
    User.findOne({
      where: {
        email: req.query.email
      }
    })
      .then(user => {
        if (!user) {
          return res.error("User not found");
        }
        if (user.dataValues.oneTimePassword) {
          return res.status(200).send(
            JSON.stringify({
              message: "Password sent on your email!",
              oneTimePassword: true
            })
          );
        }
        return res.status(200).send("User exist!");
      })
      .catch(error => res.error(error));
  });

  app.post("/change-user-info", (req, res) => {
    if (!Object.keys(req.fields).length) {
      return res.error("Fields are empty!");
    }
    const allowedFields = filterObject(req.fields, allowedToEditParams);
    if (!Object.keys(allowedFields).length) {
      return res.error("Have no allowed fields for edit");
    }
    getUserByToken(req, res, user => {
      user
        .update(allowedFields)
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

  app.post("/send-confirmation-code", (req, res) => {
    if (!req.fields.email) {
      return res.error("Email did not provide!");
    }
    User.options.classMethods.sendConfirmationCode(
      req.fields.email,
      req.fields.resend,
      (error, user) => {
        if (error) {
          return res.error(error);
        }
        return res
          .status(200)
          .send(JSON.stringify(filterObject(user.dataValues, allowedParams)));
      }
    );
  });

  app.post("/user-confirmation-request", (req, res) => {
    if (!req.fields.code || !req.fields.email) {
      return res.error("Required fields did not provide!");
    }

    User.options.classMethods.confirmAccount(
      req.fields.email,
      req.fields.code,
      (error, user) => {
        if (error) {
          return res.error(error);
        }
        res
          .status(200)
          .send(JSON.stringify(filterObject(user.dataValues, allowedParams)));
      }
    );
  });

  app.post("/reset-password-request", (req, res) => {
    if (!req.fields.email) {
      return res.error("Required field did not provide!");
    }
    User.findOne({
      where: {
        email: req.fields.email
      }
    })
      .then(user => {
        if (!user) {
          return res.error("User does not exist!");
        }
        const token = User.options.classMethods.generateToken();
        user.update({ token: token });
        const mailBody = defaultMailTemplate(
          "Reset password link",
          `<p>Follow this link for reset your password</p>`,
          "Reset password",
          `${config.websiteUrl}?token=${token}&resetPassword=true`
        );
        sendMail(req.fields.email, "Reset password link", mailBody).then(() => {
          res
            .status(200)
            .send({ message: `Reset link sent to ${user.dataValues.email}` });
        });
      })
      .catch(error => {
        return res.error(error);
      });
  });

  app.post("/reset-account-credentials", (req, res) => {
    getUserByToken(req, res, user => {
      if (user.dataValues.status === "disabled") {
        res.error("User disabled");
      }
      if (user.dataValues.status !== "new")
        user
          .update({
            oneTimePassword: true,
            status: "new"
          })
          .then(user => {
            res
              .status(200)
              .send(
                JSON.stringify(filterObject(user.dataValues, allowedParams))
              );
          })
          .catch(error => {
            console.log(`Error with update: ${error}`);
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
