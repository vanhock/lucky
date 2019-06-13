module.exports = (sequelize, DataTypes) => {
  return sequelize.define("design", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    width: DataTypes.STRING,
    height: DataTypes.STRING,
    blocks: DataTypes.JSON,
    imagePath: DataTypes.STRING,
    imageFullPath: DataTypes.STRING
  });
};
