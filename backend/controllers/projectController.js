const { Project } = require("../sequelize");
const { removeFile } = require("../libs/helpers");
const config = require("../config/config");

const emptyProjectStorage = folderName => {
  removeFile(config.upload.projectsFolderFullPath + "/" + folderName);
};

const getProjectsUsers = (id, cb) => {
  Project.findOne({
    where: { id: id }
  })
    .then(project => {
      project.getUsers().then(users => {
        if (!users.length) {
          return cb("Users not found");
        }
        const result = users.map(user => ({
          id: user.dataValues.id,
          email: user.dataValues.email,
          name: user.dataValues.name,
          role: user.user_project.dataValues.role,
          createdAt: user.user_project.dataValues.createdAt,
          updatedAt: user.user_project.dataValues.updatedAt
        }));
        return cb(null, JSON.stringify(result));
      });
    })
    .catch(() => {
      cb("Project not found");
    });
};

module.exports = {
  emptyProjectStorage,
  getProjectsUsers
};
