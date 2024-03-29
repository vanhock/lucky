module.exports = (sequelize, DataTypes) => {
  return sequelize.define("task", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    text: DataTypes.TEXT,
    designBlockId: DataTypes.STRING,
    websiteNodeId: DataTypes.STRING,
    /**
     * coordinates
     * @value: {
     *   x: INTEGER,
     *   y: INTEGER
     * }
     **/
    coordinatesOnWebsite: DataTypes.JSON,
    coordinatesOnDesign: DataTypes.JSON,
    status: DataTypes.ENUM("draft", "opened", "closed"),
    priority: DataTypes.STRING,
    screenShot: DataTypes.STRING,
    drawings: DataTypes.JSON
  });
};
