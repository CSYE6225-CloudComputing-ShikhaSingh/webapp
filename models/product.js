'use strict';
const {
  Model,DataTypes,Optional
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User,{foreignKey:'owner_user_id'});
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    manufacturer: {
      type: DataTypes.STRING
    },
    sku: {
      type: DataTypes.STRING
    },
    quantity: {
      type: DataTypes.STRING
    },
    owner_user_id:{
      allowNull: false,
      type: DataTypes.INTEGER,
      references:{
        model:'users',   //here it requires table name and not model name
        key:'id'
      }
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName:'products'
  });
  return Product;
};