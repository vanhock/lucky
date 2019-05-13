module.exports = (sequelize, DataTypes) => {
  return sequelize.define("comment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: DataTypes.TEXT
  });
};
