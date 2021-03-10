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
      name:{
      type:Sequelize.STRING(45),
      allowNull: false,
      }, 
      profile_picture_url: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING(45),
        allowNull:false,
      },
      address: {
        type: Sequelize.JSON,
      },
      city: {
        type: Sequelize.STRING(45),
      },
      state: {
        type: Sequelize.STRING(45),
      },
      postal_code: {
        type: Sequelize.STRING(45),
      },
      country: {
        type: Sequelize.STRING(45),
      },
      country_code: {
        type: Sequelize.STRING(45),
      },
      phone_no: {
        type: Sequelize.BIGINT,
      },
      is_phone_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      phone_verification_otp_expiry: {
        type: Sequelize.DATE,
      },
      password: {
        type: Sequelize.STRING,
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
        defaultValue: 1,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false
      },
      is_social: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notification_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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