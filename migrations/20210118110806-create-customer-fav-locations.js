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
      address: {
      type: Sequelize.STRING,
      allowNull: false,
      },
      city: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      postal_code: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      location_geometry: {
        type: Sequelize.ARRAY(Sequelize.FLOAT),
        allowNull: false,
      },
      default_address: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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