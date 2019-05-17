module.exports = (sequelize, DataTypes) => {
  return sequelize.define("page", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    foundNodes: DataTypes.JSON,
    websiteUrl: DataTypes.STRING,
    websiteWidth: DataTypes.STRING,
    websiteHeight: DataTypes.STRING,
    showWebsiteInspector: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    showDesignInspector: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    websiteInspectorPercentage: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    showDesignViewMode: {
      type: DataTypes.ENUM("all", "found", "none"),
      defaultValue: "found"
    },
    showWebsiteViewMode: {
      type: DataTypes.ENUM("all", "found", "none"),
      defaultValue: "found"
    },
    syncScroll: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};
