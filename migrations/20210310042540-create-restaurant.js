'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      restaurant_name: {
          type: Sequelize.STRING(45),
          allowNull: false,
      },
      restaurant_image_url: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      owner_name: {
          type: Sequelize.STRING(45),
          allowNull: false,
      },
      owner_email: {
          type: Sequelize.STRING(45),
          allowNull: false,
      },
      owner_phone: {
          type: Sequelize.STRING(45),
          allowNull: false,
      },
      country_code: {
          type: Sequelize.STRING(10),
          allowNull: false,
      },
      location: {
          type: Sequelize.ARRAY(Sequelize.FLOAT),
          allowNull: false,
      },
      address: {
          type: Sequelize.JSON,
      },
      deliveries_per_shift: {
          type: Sequelize.INTEGER,
      },
      cut_off_time: {
          type: Sequelize.FLOAT,
      },
      avg_food_price: {
          type: Sequelize.INTEGER,
      },
      working_hours_from: {
          type: Sequelize.TIME,
      },
      working_hours_to: {
          type: Sequelize.TIME,
      },
      order_type: {
          type: Sequelize.INTEGER,
      },
      restaurant_category_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'restaurant_categories',
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
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
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
    await queryInterface.dropTable('restaurants');
  }
};
