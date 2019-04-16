module.exports = (sequelize, DataTypes) => {
  return sequelize.define("page", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    foundNodes: DataTypes.STRING,
    websiteUrl: DataTypes.STRING,
    websiteWidth: DataTypes.STRING,
    websiteHeight: DataTypes.STRING,
    showWebsiteInspector: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    showDesignInspector: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    websiteInspectorPersentage: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    showDesignViewMode: {
      /**
       * ["all", "found", "none"]
       */
      type: DataTypes.STRING,
      defaultValue: "found"
    },
    showWebsiteViewMode: {
      type: DataTypes.STRING,
      defaultValue: "found"
    },
    syncScroll: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};