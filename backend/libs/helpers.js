const fs = require("fs");
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

function checkAllowChangesToPage(req, res, cb) {
  const { Page, Project } = require("../sequelize");
  getUserByToken(req, res, user => {
    Page.findOne({
      where: {
        id: req.fields.id
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
              return cb(page, project, user);
            } else {
              return res.error.send({
                title: "You don't have rights to edit this page!",
                status: 403
              });
            }
          })
          .catch(() => {
            return res.error("Project of this page not found!");
          });
      })
      .catch(() => {
        return res.error("Page not found!");
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

const removeFile = function(filePath, cb) {
  /** Remove temp design file **/
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, message => {
      message && cb(message);
    });
  } else {
    cb("File does not exist");
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

const getUrlData = url => {
  return new Promise((resolve, reject) => {
    const https = require("https");
    let client = require("http");

    if (url.toString().indexOf("https") === 0) {
      client = https;
    }

    client
      .get(url, resp => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", chunk => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          resolve(data);
        });
      })
      .on("error", err => {
        reject(err);
      });
  });
};

module.exports = {
  extractHostname,
  getUserByToken,
  filterObject,
  normalizePSD,
  normalizeFigma,
  getParentAndChild,
  checkAllowChangesToPage,
  removeFile,
  moveFile,
  getUrlData
};
