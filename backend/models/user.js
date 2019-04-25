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
      tempPassword: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM("new", "confirmed", "active", "disabled"),
        defaultValue: "active"
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
        isTokenOutdated: function() {
          const currentDate = new Date(),
            tokenAge = (currentDate - this.tokenCreatedAt) / 1000;

          return tokenAge > config.authorization.token_out_of_date;
        },
        createToken: function() {
          if (!this.token || this.isTokenOutdated()) {
            this.token = User.options.classMethods.generateToken();
          }
          return this.token;
        },
        removeAvatar: function() {
          if (this.avatar) {
            removeFile(config.upload.path + this.avatar);
          }
        }
      },
      classMethods: {
        createNewUser: function(user, done) {
          return User.create(
            {
              name: user.name,
              company: user.company,
              email: user.email,
              password: user.password,
              tempPassword: this.generatePassword()
            },
            done()
          );
        },
        generatePassword: function() {
          return crypto.randomBytes(tempPasswordLength).toString("hex");
        },
        generateToken: function() {
          return crypto.randomBytes(tokenLength).toString("hex");
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

            const newToken = User.options.instanceMethods.createToken();
            foundUser.update({ token: newToken });
            if (
              foundUser.status === "confirmed" &&
              foundUser.tempPassword === password
            ) {
              done(null, {
                confirmed: true,
                token: newToken
              });
            } else {
              const newToken = User.options.instanceMethods.createToken();
              done(null, {
                name: foundUser.name,
                email: foundUser.email,
                isAdmin: foundUser.isAdmin,
                token: newToken
              });
            }
          }, done);
        },
        authByToken: function(token, done) {
          User.findOne({
            where: {
              token: token
            }
          }).then(function(foundUser) {
            return done(
              null,
              !foundUser || foundUser.isTokenOutdated() ? false : foundUser
            );
          }, done);
        },
        findByToken: function(token, done) {
          User.findOne({ where: { token: token } })
            .then(user => {
              done(null, user);
            })
            .catch(error => {
              done(error);
            });
        }
        /*associate: function(models) {
          User.hasMany(models.Client);
        }*/
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
