require("dotenv").config();
const config = require("./config/db");
const Sequelize = require("sequelize");
const UserModel = require("./models/userModel");
const ProjectModel = require("./models/projectModel");
const PageModel = require("./models/pageModel");
const CommentModel = require("./models/commentModel");
const DesignModel = require("./models/designModel");
const TaskModel = require("./models/taskModel");
const TrashModel = require("./models/trashModel");

const sequelize = new Sequelize(
  config.dbName,
  config.userName,
  config.userPassword,
  {
    host: config.host,
    dialect: "mysql",
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const User = UserModel(sequelize, Sequelize);
const Project = ProjectModel(sequelize, Sequelize);
const Page = PageModel(sequelize, Sequelize);
const Comment = CommentModel(sequelize, Sequelize);
const Design = DesignModel(sequelize, Sequelize);
const Task = TaskModel(sequelize, Sequelize);
const Trash = TrashModel(sequelize, Sequelize);

User.hasMany(Comment);
User.hasMany(Task);
User.belongsTo(Trash);

Project.hasMany(Page);
Project.hasMany(Design);
Project.hasMany(Task);
Project.belongsTo(Trash);

const UserProject = sequelize.define("user_project", {
  role: Sequelize.ENUM("owner", "admin", "collaborator", "client")
});

User.belongsToMany(Project, {
  through: UserProject
});

Project.belongsToMany(User, {
  through: UserProject
});

Page.hasMany(Comment);
Page.belongsTo(Design);
Page.belongsTo(Project);
Page.belongsTo(User);
Page.hasMany(Task);
Page.belongsTo(Trash);

Task.hasMany(Comment);
Task.belongsTo(Project);
Task.belongsTo(Trash);

Comment.belongsTo(Trash);

Trash.belongsToMany(User, { through: "users_trash" });
Trash.belongsToMany(Project, { through: "projects_trash" });
Trash.belongsToMany(Task, { through: "tasks_trash" });
Trash.belongsToMany(Comment, { through: "comments_trash" });

sequelize.sync({ force: false }).then(() => {
  console.log(`Database & tables created!`);
});

module.exports = {
  User,
  Project,
  Page,
  Design,
  Comment,
  Task,
  Trash
};
