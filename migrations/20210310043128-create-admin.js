'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name:{
      type:Sequelize.STRING(45),
      allowNull: false,
      }, 
      email: {
        type: Sequelize.STRING(45),
        allowNull:false,
      },
      password: {
        type: Sequelize.STRING(60),
      },
      reset_pass_otp: {
        type: Sequelize.STRING(45),
      },
      reset_pass_expiry: {
        type: Sequelize.DATE,
      },
      token: {
        type: Sequelize.STRING(600)
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
    await queryInterface.dropTable('admins');
  }
};
