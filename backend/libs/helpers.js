const { User, Page, Project } = require("../sequelize");
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

function checkAllowChangesToPage(req, res, cb) {
  getUserByToken(req, res, user => {
    Page.findOne({
      where: {
        id: req.fields.pageId
      }
    })
      .then(page => {
        Project.findOne({
          where: {
            id: page.projectId
          }
        })
          .then(project => {
            if (project.userId === user.id || user.isAdmin) {
              cb(page, project, user);
            } else {
              res.status(500).send("You don't have rights to edit this page!");
            }
          })
          .catch(() => {
            res.status(500).send("Project of this page not found!");
          });
      })
      .catch(() => {
        res.status(500).send("Page not found!");
      });
  });
}

const filterObject = function(object, includes, except) {
  return Object.keys(object)
    .filter(key =>
      except && except.length ? !except.includes(key) : includes.includes(key)
    )
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
};

const normalizePSD = function(source) {
  return getParentAndChild(source.children, "children")
    .filter(f => f.type === "layer")
    .map(i => ({
      name: i.name,
      type: i.type,
      left: i.left,
      top: i.top,
      width: i.width,
      height: i.height,
      visible: i.visible,
      opacity: i.opacity,
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

const normalizeFigma = function(source) {
  const test = getParentAndChild(source.children, "children");
  return test.map(i => ({
    name: i.name,
    type: i.type,
    left: i.absoluteBoundingBox.x,
    top: i.absoluteBoundingBox.y,
    width: i.absoluteBoundingBox.width,
    height: i.absoluteBoundingBox.height,
    visible: true,
    /*opacity:
      i.hasOwnProperty("style") &&
      i.style.hasOwnProperty("opacity") &&
      i.style.opacity,*/
    textValue: i.characters,
    textStyle: i.type === "TEXT" && {
      value: i.characters,
      fontFamily: i.style.fontFamily,
      fontSize: i.style.fontSize,
      fontWeight: i.style.fontWeight,
      letterSpacing: i.style.letterSpacing,
      lineHeightPercent: i.style.lineHeightPercent,
      lineHeightPx: i.style.lineHeightPx,
      textAlignHorizontal: i.style.textAlignHorizontal,
      textAlignVertical: i.style.textAlignVertical
    }
  }));
};

const getParentAndChild = function(list, childrenKey) {
  return list
    .map(node => getPairsForNode(node, childrenKey))
    .reduce((arr1, arr2) => arr1.concat(arr2));
};

const getPairsForNode = function(node, childrenKey) {
  if (node[childrenKey])
    return node[childrenKey]
      .map(child => getPairsForNode(child, childrenKey))
      .concat(node[childrenKey])
      .reduce((arr1, arr2) => arr1.concat(arr2));
  else return [node];
};

module.exports = {
  getUserByToken,
  filterObject,
  normalizePSD,
  normalizeFigma,
  getParentAndChild,
  checkAllowChangesToPage
};
