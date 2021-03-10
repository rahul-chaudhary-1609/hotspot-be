'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('driver_addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

    driver_id: {
      type: Sequelize.INTEGER,
          references: {
            model: 'drivers',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
    },
    address_line1: {
      type: Sequelize.STRING,
      allowNull: false,
      },
    street: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    state: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    postal_code: {
      type: Sequelize.STRING(45),
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
    await queryInterface.dropTable('driver_addresses');
  }
};