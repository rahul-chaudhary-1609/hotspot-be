'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('driver_vehicle_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

    driver_id: {
      type: Sequelize.INTEGER,
          references: {
            model: 'drivers',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
    },
    vehicle_type: {
      type: Sequelize.STRING(45),
      allowNull: false,
      },
    
    image_url: {
      type: Sequelize.STRING,
      allowNull: false,
      },
    
    plate_number: {
      type: Sequelize.STRING(45),
      allowNull: false,
      },
    
    vehicle_model: {
      type: Sequelize.STRING(45),
      allowNull: false,
      },
    
    license_number: {
      type: Sequelize.STRING(45),
      allowNull: false,
      },
    
    license_image_url: {
      type: Sequelize.STRING,
      allowNull: false,
      },
    
    insurance_number: {
      type: Sequelize.STRING(45),
      allowNull: false,
      },
    
    insurance_image_url: {
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
    await queryInterface.dropTable('driver_vehicle_details');
  }
};
