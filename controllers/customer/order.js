require('dotenv/config');
const models = require('../../models');
const validate = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");

module.exports = {
    addToCart: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.id;
            const restaurant_dish_id = parseInt(req.body.restaurant_dish_id);
            const cart_count = parseInt(req.body.cart_count);
            const dish_add_on_ids = Array.isArray(req.body.dish_add_on_ids)?req.body.dish_add_on_ids:req.body.dish_add_on_ids.split(",");

            const [cart, created] = await models.Cart.findOrCreate({
                where: {
                    restaurant_dish_id, customer_id,
                },
                defaults: {
                    restaurant_dish_id, cart_count, dish_add_on_ids, customer_id
                }
            });
            
            if (created) {
                return res.status(200).json({ status: 200, message:`Added to cart`});
            }
            
            if (cart) {
                await models.Cart.update({
                    cart_count, dish_add_on_ids,
                    },
                    {
                        where: {
                            restaurant_dish_id, customer_id,
                        },
                        returning: true,
                    }
                );
                
                return res.status(200).json({ status: 200, message:`updated to cart`});
            }          
            
            
        } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    
}