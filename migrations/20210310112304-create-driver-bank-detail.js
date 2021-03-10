'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('driver_bank_details', {
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
    bank_name: {
      type: Sequelize.STRING(45),
      allowNull: false,
      },
    account_number: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    account_holder_name: {
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
    await queryInterface.dropTable('driver_bank_details');
  }
};