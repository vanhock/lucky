const { removeFile } = require("../libs/helpers");
const config = require("../config/config");

const emptyProjectStorage = folderName => {
  removeFile(config.upload.projectsFolderFullPath + "/" + folderName);
};
