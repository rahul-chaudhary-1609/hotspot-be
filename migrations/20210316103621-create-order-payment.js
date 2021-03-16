'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'order',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },

      transaction_id: {
          type: Sequelize.STRING
      },

      payment_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0,
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
    await queryInterface.dropTable('order_payments');
  }
};
