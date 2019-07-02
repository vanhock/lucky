module.exports = (sequelize, DataTypes) => {
  return sequelize.define("project", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    permalink: DataTypes.STRING,
    name: DataTypes.STRING,
    status: DataTypes.ENUM("public", "private", "closed"),
    url: DataTypes.STRING,
    image: DataTypes.STRING
  });
};
