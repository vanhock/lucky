const Sequelize = require("sequelize");
const UserModel = require("./models/user");
const ProjectModel = require("./models/project");
const PageModel = require("./models/page");
const CommentModel = require("./models/comment");
const DesignModel = require("./models/design");

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
const UserProject = sequelize.define("user_project", {
  role: Sequelize.STRING
});
const ProjectPage = sequelize.define("project_page", {});
const PageComment = sequelize.define("page_comment", {});
const CommentUser = sequelize.define("comment_user", {});
const DesignProject = sequelize.define("design_project", {});
const Project = ProjectModel(sequelize, Sequelize);
const Page = PageModel(sequelize, Sequelize);
const Comment = CommentModel(sequelize, Sequelize);
const Design = DesignModel(sequelize, Sequelize);

Project.belongsToMany(User, { through: UserProject, unique: false });
Project.belongsToMany(Page, { through: ProjectPage, unique: false });

Project.belongsToMany(Design, { through: DesignProject, unique: false });
Design.belongsToMany(Project, { through: DesignProject, unique: false });

Comment.belongsToMany(Page, { through: PageComment, unique: false });
User.belongsToMany(Comment, { through: CommentUser, unique: false });

Project.belongsTo(User);

sequelize.sync({ force: true }).then(() => {
  console.log(`Database & tables created!`);
});

module.exports = {
  User,
  Project,
  Page,
  Comment
};
