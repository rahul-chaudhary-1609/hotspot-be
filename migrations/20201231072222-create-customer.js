'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(45),
      },
      country_code: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      phone_no: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      email_verification_otp: {
        type: Sequelize.STRING(45),
      },
      reset_pass_otp: {
        type: Sequelize.STRING(45),
      },
      reset_pass_expiry: {
        type: Sequelize.DATE,
      },
      apple_id: {
        type: Sequelize.STRING(45),
      },
      google_id: {
        type: Sequelize.STRING(45),
      },
      facebook_id: {
        type: Sequelize.STRING(45),
      },
      status: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('customers');
  }
};