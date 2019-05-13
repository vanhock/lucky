module.exports = (sequelize, DataTypes) => {
  return sequelize.define("trash", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  });
};
