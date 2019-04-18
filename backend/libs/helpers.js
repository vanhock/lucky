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

const filterObject = function(object, includes, except) {
  return Object.keys(object)
    .filter(key =>
      except.length ? !except.includes(key) : includes.includes(key)
    )
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
};

const normalizePSD = function(source) {
  return getParentAndChild(source.children)
    .filter(f => f.type === "layer")
    .map(i => ({
      name: i.name,
      opacity: i.opacity,
      left: i.left,
      right: i.right,
      top: i.top,
      bottom: i.bottom,
      visible: i.visible,
      width: i.width,
      height: i.height,
      hide:
        i.width === source.document.width ||
        i.height === source.document.height,
      text: i.text &&
        Object.keys(i.text).length && {
          value: i.text.value && i.text.value.trim().toLowerCase(),
          fontSize: i.text.font.sizes && i.text.font.sizes[0],
          fontFamily: i.text.font.name,
          align: i.text.font.alignment[0],
          color:
            i.text.font.colors &&
            i.text.font.colors[0] &&
            i.text.font.colors[0].join(",")
        },
      image: {}
    }));
};

const getParentAndChild = function(list) {
  return list.map(getPairsForNode).reduce((arr1, arr2) => arr1.concat(arr2));
};

const getPairsForNode = function(node) {
  if (node.children)
    return node.children
      .map(child => getPairsForNode(child))
      .concat(node.children)
      .reduce((arr1, arr2) => arr1.concat(arr2));
  else return [node];
};

module.exports = {
  getUserByToken,
  filterObject,
  normalizePSD
};
