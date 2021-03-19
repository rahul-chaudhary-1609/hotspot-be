'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customer_fav_locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      hotspot_dropoff_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'hotspot_dropoffs',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
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
    await queryInterface.dropTable('customer_fav_locations');
  }
};