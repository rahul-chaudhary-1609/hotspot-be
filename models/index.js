require('dotenv/config')

const { Sequelize } = require('sequelize');



const sequelize = new Sequelize(process.env.db_url)

try {
    sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }