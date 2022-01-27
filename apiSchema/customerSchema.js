const Joi = require('joi');
const constants = require("../constants");


module.exports = {
    emailLogin : Joi.object({
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
        device_token:Joi.string().allow(null, '').optional(),
    }),

    phoneLogin : Joi.object({
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }).optional(),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
        device_token:Joi.string().allow(null, '').optional(),
    }),

    googleLogin: Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        id: Joi.string().trim().max(45),
        device_token:Joi.string().allow(null, '').optional(),
    }),

    facebookLogin: Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        id: Joi.string().trim().max(45),
        device_token:Joi.string().allow(null, '').optional(),
    }),

    appleLogin: Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        id: Joi.string().trim().max(45),
        device_token:Joi.string().allow(null, '').optional(),
    }),

    forgetPassword : Joi.object({
        email: Joi.string().regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i).required(),
    }),

    // resetPassword : Joi.object({
    //     email: Joi.string().regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i).required(),
    //     password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
    //         "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
    //         "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
    //         "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
    //         "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
    //         "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
    //         "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
    //     }),
    //     confirmPassword: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
    //         "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
    //         "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
    //         "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
    //         "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
    //         "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
    //         "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
    //     }),
    //     otp: Joi.string().required(),
    // }),

    customerSchema : Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string().trim().max(45).email().required(),
        address:Joi.string().max(45),
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }).optional(),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
            }),
        apple_id: Joi.string().trim().max(45),
        google_id: Joi.string().trim().max(45),
        facebook_id: Joi.string().trim().max(45),
        device_token:Joi.string().allow(null, '').optional(),
    }),

    nameSchema : Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
    }),

    emailSchema: Joi.object({
        phone:Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).optional().allow(null,'').messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        email: Joi.string().trim().max(45).email().required(),
        code:Joi.string().trim().max(45),
    }),

    phoneSchema : Joi.object({
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }).optional(),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        code:Joi.string().trim().max(45),
    }),

    resetPhoneSchema : Joi.object({
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().optional(),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required(),
        code:Joi.string().trim().max(45),
    }),

    onlyPhoneSchema : Joi.object({
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg,
        }),
    }),

    feedbackSchema : Joi.object({
        message: Joi.string().trim().required(),
    }),

    passwordSchema : Joi.object({
        oldPassword: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
        newPassword: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    resetPassword : Joi.object({
        emailOrPhone: Joi.string().trim().required(),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    customerAddressSchema : Joi.object({    
        address: Joi.string().required(),
        city: Joi.string().max(45).required(),
        state: Joi.string().max(45).required(),
        postal_code: Joi.string().max(45).required(),
        country: Joi.string().max(45).required(),
        location_geometry: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),
    }),

    locationGeometrySchema : Joi.object({
        location_geometry: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),
    }),

    timeSchema : Joi.object({
        time: Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }),
    }),

    getHotspotLocation: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
    }),

    getHotspotDropoff: Joi.object({
        hotspot_location_id:Joi.number().required(),
    }),

    getAddressDropoff: Joi.object({
        hotspot_location_id:Joi.number().required(),
    }),

    setDefaultDropoff: Joi.object({
        hotspot_location_id: Joi.number().required(),
        hotspot_dropoff_id:Joi.number().required(),
    }),

    setFavoriteRestaurant:Joi.object({
        restaurant_id: Joi.number().required(),
    }),

    getFavoriteRestaurant: Joi.object({
        hotspot_location_id:Joi.number().allow(null, '').optional(),
        delivery_shift: Joi.string().trim().allow(null, '').regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }).optional(),
    }),

    getAvailableRestaurants:Joi.object({
        hotspot_location_id:Joi.number().required(),
        delivery_shift: Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }),
    }),

    getHotspotRestaurantDelivery:Joi.object({
        hotspot_location_id:Joi.number().required(),
        delivery_shift: Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }),
        customer_location:Joi.array().required(),
        datetime:Joi.string().trim().required(),
        quick_filter_ids:Joi.array().allow(null, '').optional(),
        searchPhrase:Joi.string().trim().allow(null, '').optional(),
    }),

    getHotspotRestaurantPickup:Joi.object({
        customer_location:Joi.array().required(),
        datetime:Joi.string().trim().required(),
        quick_filter_ids:Joi.array().allow(null, '').optional(),
        searchPhrase:Joi.string().trim().allow(null, '').optional(),
    }),

    getQuickFilterList: Joi.object({
        hotspot_location_id: Joi.number().allow(null, '').optional(),
    }),

    getRestaurantDetails:Joi.object({
        restaurant_id: Joi.number().required(),
        datetime:Joi.string().trim().required(),
    }),

    getRestaurantSchedule:Joi.object({
        restaurant_id: Joi.number().required(),
    }),

    getSearchSuggestion: Joi.object({
        searchPhrase: Joi.string().trim().required(),
        hotspot_location_id:Joi.number().required(),
        delivery_shift: Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }),
    }),

    setFavoriteFood:Joi.object({
        restaurant_dish_id: Joi.number().required(),
    }),

    getFavoriteFood: Joi.object({
        hotspot_location_id:Joi.number().required(),
        delivery_shift: Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }),
    }),

    getRecomendedSlide:Joi.object({
        restaurantId: Joi.number().required(),
    }),

    addPaymentCard : Joi.object({
        name_on_card: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),

        card_number: Joi.string().trim().min(12).max(19).regex(/^\d{12,19}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_no_msg.pattern,
        }),
        card_exp_month: Joi.string().trim().min(2).max(2).regex(/^\d{2}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_month_msg.pattern,
        }),
        card_exp_year: Joi.string().trim().min(4).max(4).regex(/^\d{4}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_year_msg.pattern,
        }),

        card_cvv: Joi.string().trim().min(3).max(4).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_cvc_msg.pattern,
        }),
    }),

    updatePaymentCard: Joi.object({
        payment_card_id: Joi.number().required(),
        
        name_on_card: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),

        card_number: Joi.string().trim().min(12).max(19).regex(/^\d{12,19}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_no_msg.pattern,
        }),
        card_exp_month: Joi.string().trim().min(2).max(2).regex(/^\d{2}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_month_msg.pattern,
        }),
        card_exp_year: Joi.string().trim().min(4).max(4).regex(/^\d{4}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_year_msg.pattern,
        }),

        card_cvv: Joi.string().trim().min(3).max(4).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_cvc_msg.pattern,
        }),
    }),

    getPaymentCard: Joi.object({
        payment_card_id: Joi.number().required(),
    }),

    setDeafultPaymentCard: Joi.object({
        payment_card_id: Joi.number().required(),
    }),

    deletePaymentCard: Joi.object({
        payment_card_id: Joi.number().required(),
    }),

    payment: Joi.object({
        order_id: Joi.string().optional(),
        
        name_on_card: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),

        card_number: Joi.string().trim().min(12).max(19).regex(/^\d{12,19}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_no_msg.pattern,
        }),
        card_exp_month: Joi.string().trim().min(2).max(2).regex(/^\d{2}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_month_msg.pattern,
        }),
        card_exp_year: Joi.string().trim().min(4).max(4).regex(/^\d{4}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_year_msg.pattern,
        }),
        card_cvc: Joi.string().trim().min(3).max(4).regex(/^\d{3}|\d{4}$/).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_cvc_msg.pattern,
        }),
        amount: Joi.number(),

    }),

    update_device_token : Joi.object({
        device_token: Joi.string().trim().required().messages(),
    }),

    paymentSuccess: Joi.object({
        order_id: Joi.string().required(),
        payment_intent: Joi.object().required(), 
        payment_datetime:Joi.string().trim().required(),       
    }),

    getStaticContent: Joi.object({
        type: Joi.number().required()   
    }),

    getFaqs: Joi.object({
        topic_id: Joi.number().required() ,
        page: Joi.number().allow(null, '').optional(),        
        page_size: Joi.number().allow(null, '').optional()     
    }),

    getOrderDeliveryImage:Joi.object({
        order_id: Joi.string().required()   
    }),

    checkCartItem:Joi.object({
        restaurant_id: Joi.number().required()   
    }),

    getRestaurantDishCategories: Joi.object({        
        restaurant_id: Joi.number().required(),
    }),

    getDishes: Joi.object({        
        restaurant_dish_category_id: Joi.number().required(),
    }),

    getDishDetails: Joi.object({        
        restaurant_dish_id: Joi.number().required(),
    }),

    addToCart: Joi.object({        
        restaurant_id:Joi.number().required(),
        restaurant_dish_id:Joi.number().required(),
        cart_count:Joi.number().required(),
        dish_add_on_ids:Joi.array().allow(null, '').optional(),
        special_instructions:Joi.string().allow(null, '').optional(),
    }),

    getCartItemById: Joi.object({     
        cart_item_id:Joi.number().required(),
    }),

    editCartItem: Joi.object({     
        cart_item_id:Joi.number().required(),   
        cart_count:Joi.number().optional(),
        dish_add_on_ids:Joi.array().allow(null, '').optional(),
        special_instructions:Joi.string().allow(null, '').optional(),
    }),

    createOrder:Joi.object({
        restaurant_id:Joi.number().required(),
        cart_ids:Joi.array().required(),
        amount:  Joi.number().required(),
        order_type:Joi.number().required(),   
        delivery_datetime:Joi.string().optional(),
    }),

    updateTipAmount:Joi.object({     
        order_id:Joi.string().required(),   
        tip_amount:Joi.number().required(),
    }),

    getOrders:Joi.object({
        is_pagination: Joi.number().optional(),
        page: Joi.number().allow(null).optional(),
        page_size: Joi.number().allow(null).optional(),
    }),

    getCompletedOrders:Joi.object({
        is_pagination: Joi.number().optional(),
        page: Joi.number().allow(null).optional(),
        page_size: Joi.number().allow(null).optional(),
    }),

    raiseDispute:Joi.object({
        order_id: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().optional(),
        datetime: Joi.string().required(),
    })

}

