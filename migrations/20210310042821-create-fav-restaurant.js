'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('fav_restaurants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      restaurant_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },

      customer_id:{
          type: Sequelize.INTEGER,
          references: {
            model: 'customers',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
      },

      is_deleted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
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
    await queryInterface.dropTable('fav_restaurants');
  }
};
