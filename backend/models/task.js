module.exports = (sequelize, DataTypes) => {
  return sequelize.define("task", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: DataTypes.STRING,
    designBlockId: DataTypes.STRING,
    websiteNodeId: DataTypes.STRING,
    coordinatesOnWebsite: DataTypes.STRING,
    coordinatesOnDesign: DataTypes.STRING
  });
};
