const path = require("path");
module.exports = {
  server: {
    address: "http://localhost",
    port: process.env.SERVER_PORT
  },
  authorization: {
    token_out_of_date: 604800 /** 1 week **/,
    confirmation_code_out_of_date: 3600 /** 1 hour **/,
    confirmation_code_resend_timeout: 60,
    figmaAccessToken: "11971-5d340a8f-7932-4e2e-9d36-3d193a64abe7"
  },
  upload: {
    path: path.join(__dirname, "../public/images/"),
    tempPath: path.join(__dirname, "../public/images/temp/"),
    designImagesFullPath: path.join(__dirname, "../public/images/designs/"),
    designImagesPath: "/images/designs/",
    projectsFolderFullPath: path.join(__dirname, "../public/projects/"),
    projectsFolderPath: "/projects/",
    avatarFullPath: path.join(__dirname, "../public/images/avatars/"),
    avatarPath: "/images/avatars/"
  },
  rights: {
    edit: ["owner", "admin"],
    view: ["owner", "admin", "collaborator", "client"],
    collaborator: ["owner", "admin", "collaborator"]
  }
};
