'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hotspot_offers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
          type: Sequelize.STRING(45),
          allowNull: false,
      },
      image_url: {
          type: Sequelize.STRING,
          allowNull: false,
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
    await queryInterface.dropTable('hotspot_offers');
  }
};
