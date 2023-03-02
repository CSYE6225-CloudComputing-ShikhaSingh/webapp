'use strict';
const {
  Model,DataTypes
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  }
  image.init({
    image_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },

    },

    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },

    s3_bucket_path: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },

    date_created: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        isDate: true,
      },
    },
  },{
    sequelize,
    modelName: 'Image',
    tableName:'images'
  });
  return image;
};