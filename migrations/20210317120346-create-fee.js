'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      order_range_from: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        order_range_to: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        fee_type:{
            type: Sequelize.STRING,
            allowNull: false,
        },

        fee:{
            type: Sequelize.FLOAT,
            allowNull: false,
        },    
    
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('fees');
  }
};
