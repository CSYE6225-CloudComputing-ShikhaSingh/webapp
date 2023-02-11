'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
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
        type: DataTypes.INTEGER
      },
      owner_user_id:{
        allowNull: false,
        type: DataTypes.INTEGER,
        references:{
          model:'users',   //here it requires table name and not model name
          key:'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('products');
  }
};