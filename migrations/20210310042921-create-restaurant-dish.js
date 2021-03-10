'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurant_dishes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      price: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
      description: {
          type: Sequelize.STRING,
          allowNull: false,
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

      dish_category_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'dish_categories',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
      },
      image_url: {
          type: Sequelize.STRING,
          allowNull: false,
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
    await queryInterface.dropTable('restaurant_dishes');
  }
};
