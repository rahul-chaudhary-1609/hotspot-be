'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fav_foods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      restaurant_dish_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'restaurant_dishes',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
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
await queryInterface.dropTable('fav_foods');
  }
};
