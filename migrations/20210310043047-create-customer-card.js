'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customer_cards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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

      card_number: {
          type: Sequelize.STRING,
          allowNull: false,
      },

      card_exp_month: {
          type: Sequelize.STRING(2),
          allowNull: false,
      },

      card_exp_year: {
          type: Sequelize.STRING(4),
          allowNull: false,
      },

      name_on_card: {
          type: Sequelize.STRING,
          allowNull: false,
      },

      is_default: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
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
    await queryInterface.dropTable('customer_cards');
  }
};
