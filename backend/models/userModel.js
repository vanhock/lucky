const config = require("../config/config");
const { removeFile } = require("../libs/helpers");
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
            targetAge = (currentDate - user.tokenCreatedAt) / 1000;
          return targetAge > config.authorization.token_out_of_date;
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
            config.authorization.authorization.confirmation_code_out_of_date
          );
        },
        isConfirmationCodeResendTimeout(user) {
          if (!user) {
            return;
          }
          return this.checkOutdated(
            user.confirmationCodeCreatedAt,
            config.authorization.authorization.confirmation_code_resend_timeout
          );
        },
        createToken: function() {
          if (!this.token || this.isTokenOutdated()) {
            this.token = User.options.classMethods.generateToken();
          }
          return this.token;
        },
        createConfirmationCode() {
          if (!this.confirmationCode || this.isConfirmationCodeOutdated()) {
            this.confirmationCode = User.options.classMethods.generateToken(5);
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
                } else {
                  this.sendConfirmationCode();
                }
                done(null, user);
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

            if (foundUser.status !== "active") {
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
              ...foundUser.dataValues
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
            } else if (foundUser.isTokenOutdated(foundUser)) {
              return done("tokenOutdated");
            }
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
              if (user.isConfirmationCodeOutdated(user)) {
                this.sendConfirmationCode();
                return done("codeOutdated");
              }
              if (user.confirmationCode !== code) {
                this.sendConfirmationCode();
                return done("codeIncorrect");
              }
              user.update({ status: "active" }).then(resultUser => {
                return done(null, resultUser);
              });
            }, done)
            .catch(error => {
              done(error);
            });
        },
        sendConfirmationCode() {
          if (!this.user.isConfirmationCodeResendTimeout(this.user)) {
            return "codeResentTimeout";
          }
          const code = this.user.createConfirmationCode();
          return console.log(`Sent code: ${code} on email: ${this.user.email}`);
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
