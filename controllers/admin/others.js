const { sequelize } = require('../../models');

module.exports = {
    drop: async (req, res) => {
        try {
            await sequelize.sync({ force: true });
            return res.status(200).json({ status: 200, message: `Successfull` });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    }
}