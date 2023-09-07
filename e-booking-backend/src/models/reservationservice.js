'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReservationService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  }
  ReservationService.init({
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ReservationService',
    tableName: 'ReservationServices'
  });
  return ReservationService;
};