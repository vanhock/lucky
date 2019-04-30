const config = require("./config/db");
const Sequelize = require("sequelize");
const UserModel = require("./models/user");
const ProjectModel = require("./models/project");
const PageModel = require("./models/page");
const CommentModel = require("./models/comment");
const DesignModel = require("./models/design");
const TaskModel = require("./models/task");
const TrashModel = require("./models/trash");

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

User.belongsToMany(Project, { through: "project_collaborators" });
Project.belongsToMany(User, {
  as: "Collaborators",
  through: "project_collaborators"
});

User.hasMany(Project);
User.hasMany(Comment);
User.hasMany(Task);
User.belongsTo(Trash);

Project.hasMany(Page);
Project.hasMany(Design);
Project.belongsTo(Trash);

Page.hasMany(Comment);
Page.belongsTo(Design);
Page.belongsTo(Project);
Page.hasMany(Task);
Page.belongsTo(Trash);

Task.hasMany(Comment);
Task.belongsTo(Trash);

Comment.belongsTo(Trash);

Trash.belongsToMany(User, { through: "users_trash" });
Trash.belongsToMany(Project, { through: "projects_trash" });
Trash.belongsToMany(Page, { through: "pages_trash" });
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
  Task
};
