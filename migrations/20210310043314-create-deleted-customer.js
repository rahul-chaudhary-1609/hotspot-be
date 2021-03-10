'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deleted_customers', {
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

      admin_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'admins',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
      },

      reason: {
          type: Sequelize.STRING,
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
    await queryInterface.dropTable('deleted_customers');
  }
};
