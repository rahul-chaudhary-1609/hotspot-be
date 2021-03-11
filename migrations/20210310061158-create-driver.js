'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('drivers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name:{
        type:Sequelize.STRING(45),
        allowNull: false,
      },
      last_name:{
        type:Sequelize.STRING(45),
        allowNull: false,
      },
      
      email: {
        type: Sequelize.STRING(45),
        allowNull:false,
      },
      country_code: {
        type: Sequelize.STRING(45),
      },
      phone_no: {
        type: Sequelize.BIGINT,
      },
      dob: {
        type: Sequelize.STRING(45),
      },
      gender: {
        type: Sequelize.STRING(45),
      },
      nationality: {
        type: Sequelize.STRING(45),
      },
      passport_picture_url: {
        type: Sequelize.STRING,
      },
      
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      is_approved: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      },
      is_rejected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false
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
    await queryInterface.dropTable('drivers');
  }
};

