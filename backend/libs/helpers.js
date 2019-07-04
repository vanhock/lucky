const fs = require("fs");

const config = require("../config/config");
const extractHostname = function(url) {
  let hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
};

const getUserByToken = function(req, res, cb) {
  const { User } = require("../sequelize");
  if (!req.headers.authorization) {
    return res.error("Auth token did not provide!");
  }
  User.options.classMethods.authByToken(
    req.headers.authorization,
    (message, user) => {
      if (message && message === "tokenOutdated") {
        return res.error({ title: "Token outdated!", code: 401 });
      }
      if (!user) {
        return res.error({ title: "User not found", code: 401 });
      }

      cb(user);
    }
  );
};

function updateProjectUser(req, res, project, user, params = {}, cb) {
  user
    .getProjects({
      where: {
        id: project.id
      }
    })
    .then(projects => {
      if (!projects.length) {
        return add();
      }
      return user.setProject(project, { through: params }).then(projectUser => {
        cb({
          ...project.dataValues,
          ...projectUser.dataValues
        });
      });
    })
    .catch(() => {
      return add();
    });

  function add() {
    return user.addProject(project, { through: params }).then(projectUser => {
      cb({
        ...project.dataValues,
        ...projectUser.dataValues
      });
    });
  }
}

function checkProjectAccess(
  projectParams = {},
  user,
  role = config.rights.edit,
  cb
) {
  if (!user) {
    return;
  }

  const errorMessage = `Access to project denied for user: ${user.email}!`;

  user
    .getProjects({ where: projectParams })
    .then(projects => {
      if (!projects.length) {
        return cb(errorMessage);
      }
      if (
        role === [] /* Accept all roles */ ||
        role.includes(projects[0].user_project.dataValues.role)
      ) {
        return cb(null, projects[0]);
      } else {
        return cb(errorMessage);
      }
    })
    .catch(() => {
      return cb(errorMessage);
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

const removeFile = function(filePath, cb) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, message => {
      message && cb(message);
    });
  } else {
    cb("File does not exist");
  }
};
const shell = require("shelljs");
const removeFolder = function(folderPath, cb) {
  if (fs.existsSync(folderPath)) {
    shell.rm("-rf", folderPath);
  } else {
    cb("This path does not exist");
  }
};

const moveFile = function(sourceName, targetName, cb) {
  if (fs.existsSync(sourceName)) {
    fs.rename(sourceName, targetName, message => {
      message && cb(message);
    });
  } else {
    cb("File does not exist");
  }
};

const getUrlDomain = url => {
  const urlDomain = url.match(
    /([^\/]+:)?\/\/[^\/]*?\.?([^\/.]+)\.[^\/.]+(?::\d+)?\//g
  );
  return (urlDomain && urlDomain[0]) || "";
};

const getUrlData = url => {
  return new Promise((resolve, reject) => {
    const request = require("request");

    request(url, (err, response) => {
      if (err) {
        return reject(err);
      }
      if (
        response.statusCode === 200 &&
        response.headers &&
        (!response.headers["x-frame-options"] ||
          response.headers["x-frame-options"] !== "deny")
      ) {
        resolve(response.body);
      }
    });
  });
};

module.exports = {
  extractHostname,
  getUserByToken,
  updateProjectUser,
  checkProjectAccess,
  filterObject,
  normalizePSD,
  normalizeFigma,
  getParentAndChild,
  removeFile,
  removeFolder,
  moveFile,
  getUrlData,
  getUrlDomain
};
