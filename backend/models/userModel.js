const config = require("../config/config");
const { removeFile, getRandomNumbers, sendMail } = require("../libs/helpers");
const tempPasswordLength = 7;
const tokenLength = 80;
const saltLength = 32;

let crypto;
try {
  crypto = require("crypto");
} catch (err) {
  console.log("crypto support is disabled!");
}

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define(
    "user",
    {
      name: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: true
      },
      avatarPath: {
        type: DataTypes.STRING
      },
      avatarFullPath: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      company: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set: function(plain_password) {
          this.setDataValue(
            "salt",
            crypto.randomBytes(saltLength).toString("hex")
          );
          this.setDataValue(
            "password",
            User.options.instanceMethods.encryptPassword(
              plain_password,
              this.salt
            )
          );
          this.token = User.options.classMethods.generateToken();
        }
      },
      oneTimePassword: {
        type: DataTypes.BOOLEAN
      },
      status: {
        type: DataTypes.ENUM("new", "active", "disabled"),
        defaultValue: "new"
      },
      role: {
        type: DataTypes.ENUM("owner", "admin", "user"),
        defaultValue: "user"
      },
      salt: {
        type: DataTypes.STRING
      },
      token: {
        type: DataTypes.STRING,
        set: function(newToken) {
          this.setDataValue("token", newToken);
          this.tokenCreatedAt = Date.now();
        }
      },
      tokenCreatedAt: {
        type: DataTypes.DATE
      },
      confirmationCode: {
        type: DataTypes.STRING,
        set: function(code) {
          this.setDataValue("confirmationCode", code);
          this.confirmationCodeCreatedAt = Date.now();
        }
      },
      confirmationCodeCreatedAt: {
        type: DataTypes.DATE
      }
    },
    {
      instanceMethods: {
        encryptPassword: function(plain, salt_key) {
          const salt = this.salt || salt_key;
          return crypto
            .createHmac("sha1", salt)
            .update(plain)
            .digest("hex");
        },
        checkOutdated(createdAt, outdatedAt) {
          const currentDate = new Date(),
            targetAge = (currentDate - createdAt) / 1000;
          return targetAge > outdatedAt;
        },
        isTokenOutdated: function(user) {
          if (!user) {
            return;
          }
          return this.checkOutdated(
            user.tokenCreatedAt,
            config.authorization.token_out_of_date
          );
        },
        isConfirmationCodeOutdated(user) {
          if (!user) {
            return;
          }
          return this.checkOutdated(
            user.confirmationCodeCreatedAt,
            config.authorization.confirmation_code_out_of_date
          );
        },
        isConfirmationCodeResendTimeout(user) {
          if (!user) {
            return;
          }
          return this.checkOutdated(
            user.confirmationCodeCreatedAt,
            config.authorization.confirmation_code_resend_timeout
          );
        },
        createToken: function() {
          if (!this.token || this.isTokenOutdated()) {
            this.token = User.options.classMethods.generateToken();
          }
          return this.token;
        },
        createConfirmationCode(user) {
          if (!this.confirmationCode || this.isConfirmationCodeOutdated(user)) {
            this.confirmationCode = getRandomNumbers(4);
          }
          return this.confirmationCode;
        },
        removeAvatar: function() {
          if (this.avatar) {
            removeFile(config.upload.path + this.avatar);
          }
        }
      },
      classMethods: {
        createNewUser: function(req, done) {
          User.findAll({
            where: {
              email: req.email
            }
          })
            .then(users => {
              if (users.length) {
                return done("User with same email already exist!");
              }
              return User.create({
                name: req.name,
                company: req.company,
                email: req.email,
                role: req.role,
                password: req.password || this.generatePassword(),
                oneTimePassword: !req.password
              }).then(user => {
                if (user.oneTimePassword) {
                  /** No need to sent confirmation code, if password specified **/
                  done(null, user);
                } else {
                  this.sendConfirmationCode(user, true, done);
                }
              });
            })
            .catch(message => {
              console.log(message);
            });
        },
        generatePassword: function() {
          return crypto.randomBytes(tempPasswordLength).toString("hex");
        },
        generateToken: function(length) {
          return crypto.randomBytes(length || tokenLength).toString("hex");
        },
        authorization: function(email, password, done) {
          User.findOne({
            where: {
              email: email
            }
          }).then(function(foundUser) {
            if (!foundUser) {
              return done("User not found");
            }

            if (
              foundUser.password !==
              User.options.instanceMethods.encryptPassword(
                password,
                foundUser.salt
              )
            ) {
              return done("Incorrect password");
            }

            if (foundUser.status === "disabled") {
              done(
                "This user isn't confirmed by admin or account has been locked"
              );
            }
            const token = User.options.classMethods.generateToken();
            foundUser.update({ token: token });
            if (foundUser.dataValues.oneTimePassword) {
              foundUser.update({
                password: this.generatePassword()
              });
              /** Todo: Need to send password on email here **/
            }
            return done(null, {
              ...foundUser.dataValues,
              confirmationCodeTimeout:
                config.authorization.confirmation_code_resend_timeout
            });
          }, done);
        },
        authByToken: function(token, done) {
          User.findOne({
            where: {
              token: token
            }
          }).then(function(foundUser) {
            if (!foundUser) {
              return done(null, false);
            } else if (
              User.options.instanceMethods.isTokenOutdated(foundUser)
            ) {
              return done("tokenOutdated");
            }
            foundUser.dataValues.confirmationCodeTimeout =
              config.authorization.confirmation_code_resend_timeout;
            return done(null, foundUser);
          }, done);
        },
        confirmAccount(email, code, done) {
          User.findOne({
            where: {
              email: email
            }
          })
            .then(user => {
              if (
                User.options.instanceMethods.isConfirmationCodeOutdated(user)
              ) {
                this.sendConfirmationCode(user.email, () => {});
                return done("codeOutdated", user);
              }
              if (user.confirmationCode !== code) {
                this.sendConfirmationCode(user.email, () => {});
                return done("codeIncorrect", user);
              }
              user.update({ status: "active" }).then(resultUser => {
                return done(null, resultUser);
              });
            }, done)
            .catch(error => {
              done(error);
            });
        },
        sendConfirmationCode(email, resend, done) {
          User.findOne({
            where: {
              email: email
            }
          })
            .then(user => {
              if (!user) {
                return done("User not found");
              }
              if (!user.dataValues.status === "active") {
                return done("userConfirmed");
              }
              if (!user.dataValues.status === "disabled") {
                return done("userDisabled");
              }
              if (
                !User.options.instanceMethods.isConfirmationCodeResendTimeout(
                  user
                )
              ) {
                return done("codeResendingTimeout");
              }
              if (
                !resend &&
                !User.options.instanceMethods.isConfirmationCodeOutdated(user)
              ) {
                return done("codeAlreadySent");
              }

              const code = User.options.instanceMethods.createConfirmationCode();
              sendMail(
                user.email,
                "Confirm account",
                `<p>Your activation code is: <b>${code}</b></p>`
              )
                .then(success => {
                  console.log(`Sent code: ${code} on email: ${user.email}`);
                  return user.update({ confirmationCode: code }).then(resultUser => {
                    return done(null, resultUser);
                  });
                })
                .catch(error => {
                  console.error(error);
                  return done(error);
                });
            })
            .catch(() => {
              return done("User not found");
            });
        }
      },
      hooks: {
        beforeDestroy: function(user) {
          user.removeAvatar();
        }
      }
    }
  );

  return User;
};
