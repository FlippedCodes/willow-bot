const Sequelize = require('sequelize');

module.exports = sequelize.define('UserDoB', {
  ID: {
    type: Sequelize.STRING(30),
    primaryKey: true,
  },
  DoB: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  allow: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  teammemberID: Sequelize.STRING(30),
});
