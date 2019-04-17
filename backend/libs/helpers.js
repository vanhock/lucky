const { User } = require("../sequelize");
const getUserByToken = function(req, res, cb) {
  if (!req.headers.authorization) {
    return;
  }
  User.options.classMethods.findByToken(
    req.headers.authorization,
    (message, user) => {
      if (!user) {
        res.status(500).send("User not found");
      } else {
        cb(user);
      }
    }
  );
};

const filterObject = function(object, params) {
  return Object.keys(object)
    .filter(key => params.includes(key))
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
};

module.exports = {
  getUserByToken,
  filterObject
};
