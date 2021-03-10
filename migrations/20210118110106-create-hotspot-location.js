'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hotspot_locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      location: {
          type: Sequelize.ARRAY(Sequelize.FLOAT),
          allowNull: false,
      },
      location_detail: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      delivery_shifts: {
          type: Sequelize.ARRAY(Sequelize.TIME),
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
      full_address: {
          type: Sequelize.JSON,
          allowNull: false,
      },
      is_added: {
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
    await queryInterface.dropTable('hotspot_locations');
  }
};
