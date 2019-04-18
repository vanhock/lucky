const Sequelize = require("sequelize");
const UserModel = require("./models/user");
const ProjectModel = require("./models/project");
const PageModel = require("./models/page");
const CommentModel = require("./models/comment");
const DesignModel = require("./models/design");
const TaskModel = require("./models/task");

const sequelize = new Sequelize("pixel", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const User = UserModel(sequelize, Sequelize);
const Project = ProjectModel(sequelize, Sequelize);
const Page = PageModel(sequelize, Sequelize);
const Comment = CommentModel(sequelize, Sequelize);
const Design = DesignModel(sequelize, Sequelize);
const Task = TaskModel(sequelize, Sequelize);

User.belongsToMany(Project, { through: "project_collaborators" });
Project.belongsToMany(User, {
  as: "Collaborators",
  through: "project_collaborators"
});

User.hasMany(Project);
User.hasMany(Comment);

Project.hasMany(Page);
Project.hasMany(Design);

Page.hasMany(Comment);
Page.belongsTo(Design);
Page.belongsTo(Project);
Page.hasMany(Task);

Task.hasMany(Comment);

sequelize.sync({ force: false }).then(() => {
  console.log(`Database & tables created!`);
});

module.exports = {
  User,
  Project,
  Page,
  Design,
  Comment
};
