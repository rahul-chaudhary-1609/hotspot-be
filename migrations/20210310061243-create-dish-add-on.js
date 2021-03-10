'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dish_add_ons', {
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
          type: Sequelize.FLOAT,
          allowNull: false,
      },

      image_url: {
          type: Sequelize.STRING,
          allowNull: false,
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
    await queryInterface.dropTable('dish_add_ons');
  }
};

