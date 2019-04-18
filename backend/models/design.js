module.exports = (sequelize, DataTypes) => {
  return sequelize.define("design", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fileName: DataTypes.STRING,
    fileSize: DataTypes.STRING,
    fileType: DataTypes.STRING,
    width: DataTypes.STRING,
    height: DataTypes.STRING,
    blocks: DataTypes.JSON,
    image: DataTypes.STRING
  });
};
