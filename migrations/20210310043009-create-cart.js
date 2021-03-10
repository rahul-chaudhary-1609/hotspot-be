'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cart', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      restaurant_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
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

      cart_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },

      dish_add_on_ids: {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
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
    await queryInterface.dropTable('cart');
  }
};
