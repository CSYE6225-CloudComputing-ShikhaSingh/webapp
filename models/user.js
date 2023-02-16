'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Product,{foreignKey:'owner_user_id'})
    }
  }
  User.init({
    first_name: 
    {
      type:DataTypes.STRING,
      allowNull:false
    },
    last_name: 
    {
       type: DataTypes.STRING,
    },
    password: 
    {
      type:DataTypes.STRING,
      allowNull: false
    },
    username:
    {
      type:DataTypes.STRING,
      unique:true,
      allowNull:false,
      validate: {
        isEmail: true
    }
    } 
  }, {
    sequelize,
    modelName: 'User',
    tableName:'users'
  });
  return User;
};