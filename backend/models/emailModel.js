module.exports = (sequelize, DataTypes) => {
  return sequelize.define("email", {
    email: {
      primaryKey: true,
      type: DataTypes.STRING
    }
  });
};
