'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurant_hotspots', {
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

      restaurant_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'restaurants',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
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
    await queryInterface.dropTable('restaurant_hotspots');
  }
};
