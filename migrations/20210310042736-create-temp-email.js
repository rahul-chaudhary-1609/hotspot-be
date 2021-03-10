'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('temp_emails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
          type: Sequelize.STRING(45),
          allowNull: false,
      },
      email_verification_otp: {
          type: Sequelize.STRING(45),
      },
      is_email_verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      email_verification_otp_expiry: {
          type: Sequelize.DATE,
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
    await queryInterface.dropTable('temp_emails');
  }
};
