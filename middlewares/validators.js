
module.exports.trimmer = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        const temp = {};
        for (let [key, value] of Object.entries(req.body)) {
            key = (key).trim();
            if (isNaN(value)) {
                temp[key] = (value).trim();
            } else {
                temp[key] = (value).toString();
            }
            
        }
        req.body = temp;
    }

    if (req.method == 'GET' || req.method == 'DELETE' ) {
        const temp = {};
        for (let [key, value] of Object.entries(req.query)) {
            key = (key).trim();
            if (isNaN(value)) {
                temp[key] = (value).trim();
            } else {
                temp[key] = ((value).toString()).trim();
            }
            
        }
        req.query = temp;
    }
    
    return next();
}


module.exports.parseStringToArray = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (req.body.deliveries && !Array.isArray(req.body.deliveries)) {
            req.body.deliveries = JSON.parse(`[${req.body.deliveries}]`);
        }

        if (req.body.dish_category_ids && !Array.isArray(req.body.dish_category_ids)) {
            req.body.dish_category_ids = JSON.parse(`[${req.body.dish_category_ids}]`);
        }

        if (req.body.restaurant_category_ids && !Array.isArray(req.body.restaurant_category_ids)) {
            req.body.restaurant_category_ids = JSON.parse(`[${req.body.restaurant_category_ids}]`);
        }

        if (req.body.location && !Array.isArray(req.body.location)) {
            req.body.location = JSON.parse(`[${req.body.location}]`);
        }

        if (req.body.dropoffs && !Array.isArray(req.body.dropoffs)) {
            req.body.dropoffs = JSON.parse(`[${req.body.dropoffs}]`);
        }

        if (req.body.delivery_shifts && !Array.isArray(req.body.delivery_shifts)) {
            req.body.delivery_shifts = JSON.parse(`[${req.body.delivery_shifts}]`);
        }

        if (req.body.restaurants_ids && !Array.isArray(req.body.restaurants_ids)) {
            req.body.restaurants_ids = JSON.parse(`[${req.body.restaurants_ids}]`);
        }

        if (req.body.driver_ids && !Array.isArray(req.body.driver_ids)) {
            req.body.driver_ids = JSON.parse(`[${req.body.driver_ids}]`);
        }

        if (req.body.dish_add_on_ids && !Array.isArray(req.body.dish_add_on_ids)) {
            req.body.dish_add_on_ids = JSON.parse(`[${req.body.dish_add_on_ids}]`);
        }

        if (req.body.cart_ids && !Array.isArray(req.body.cart_ids)) {
            req.body.cart_ids = JSON.parse(`[${req.body.cart_ids}]`);
        }

        if (req.body.hotspot_location_ids && !Array.isArray(req.body.hotspot_location_ids)) {
            req.body.hotspot_location_ids = JSON.parse(`[${req.body.hotspot_location_ids}]`);
        }

        if (req.body.customer_location && !Array.isArray(req.body.customer_location)) {
            req.body.customer_location = JSON.parse(`[${req.body.customer_location}]`);
        }
    }
    return next();
}
