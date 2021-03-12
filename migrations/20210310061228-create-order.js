'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      order_id: {
            type: Sequelize.STRING,
            allowNull: false,
            unique:true,
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

      restaurant_id: {
       type: Sequelize.INTEGER,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
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

      amount: {
          type: Sequelize.FLOAT,
          allowNull: false,
      },

      status: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },

      type: {
          type: Sequelize.STRING,
          allowNull: false,
      },

      tip_amount: {
          type: Sequelize.FLOAT,
      },
      
      cooking_instructions: {
          type: Sequelize.STRING,
      },

      delivery_datetime: {
          type: Sequelize.DATE,
      },

      driver_id: {
          type: Sequelize.INTEGER,
      },

      push_order_id: {
          type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('orders');
  }
};
