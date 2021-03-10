'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hotspot_dropoffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hotspot_location_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'hotspot_locations',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
      },
      dropoff_detail: {
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
    await queryInterface.dropTable('hotspot_dropoffs');
  }
};
