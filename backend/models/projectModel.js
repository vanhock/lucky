module.exports = (sequelize, DataTypes) => {
  return sequelize.define("project", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    image: DataTypes.STRING
  });
};
