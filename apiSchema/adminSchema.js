const Joi = require("joi");
const constants = require("../constants");


module.exports = {
    login : Joi.object({
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        password: Joi.string().min(8)
            .max(15)
            .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
            .required()
            .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        }),
    }),

    addNewAdmin : Joi.object({
        email: Joi.string().regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i).required(),
        password: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        }),
        confirmPassword: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        }),
        passkey: Joi.string().required(),
        name: Joi.string().required(),
    }),

    forgetPassword : Joi.object({
        email: Joi.string().regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i).required(),
    }),

    resetPassword : Joi.object({
        email: Joi.string().regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i).required(),
        password: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        }),
        confirmPassword: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        }),
        otp: Joi.string().required(),
    }),

    changePassword : Joi.object({
        old_password: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        }),
        new_password: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        })
    }),

    updateProfile : Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string().trim().required(),
        phone: Joi.string().trim().required(),
        country_code: Joi.string().trim().optional(),
        profile_picture_url: Joi.string().trim().optional(),
    }),

    addDish : Joi.object({
        name: Joi.string().trim().required(),
        price: Joi.number().required(),
        description: Joi.string().required(),
        restaurant_id: Joi.number().required(),
        dish_category_id: Joi.number().optional(),
        image_url: Joi.string().uri().required(),
        is_recommended: Joi.number().optional(),
        is_quick_filter: Joi.number().optional(),
    }),

    listDishes: Joi.object({
        restaurantId: Joi.number().required(),
    }),

    getDish: Joi.object({
        dishId: Joi.number().required(),
    }),

    editDish : Joi.object({
        name: Joi.string().trim().required(),
        price: Joi.number().required(),
        description: Joi.string().required(),
        restaurant_id: Joi.number().required(),
        dish_category_id: Joi.number().optional(),
        image_url: Joi.string().uri().required(),
        is_recommended: Joi.number().optional(),
        is_quick_filter: Joi.number().optional(),
    }),


    deleteDish : Joi.object({
        dishId: Joi.number().required(),
    }),

    toggleDishAsRecommended : Joi.object({
        dishId: Joi.number().required(),
    }),

    toggleDishAsQuickFilter : Joi.object({
        dishId: Joi.number().required(),
    }),

    addDishAddon : Joi.object({
        name: Joi.string().trim().required(),
        price: Joi.number().required(),
        image_url: Joi.string().uri().required(),
        restaurant_dish_id: Joi.number().required(),
    }),

    listDishAddon: Joi.object({
        restaurant_dish_id: Joi.number().required(),
    }),

    getDishAddonById: Joi.object({
        dish_addon_id: Joi.number().required(),
    }),

    editDishAddon: Joi.object({
        dish_addon_id: Joi.number().required(),
        name: Joi.string().trim().optional(),
        price: Joi.number().optional(),
        image_url: Joi.string().uri().optional(),
        restaurant_dish_id: Joi.number().optional(),
    }),


    deleteDishAddon : Joi.object({
        dish_addon_id: Joi.number().required(),
    }),


    driverSchema : Joi.object({
        first_name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).messages({
        "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),

        last_name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).messages({
        "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),

        email: Joi.string().trim().max(45).email(),
        
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }).optional(),

        phone_no: Joi.string().trim().regex(/^\(?\d{10}$/).min(10).max(10).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),

        dob: Joi.string().regex(/^\d{2}-\d{2}-\d{4}$/).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.dob_msg.pattern,
        }),

        gender: Joi.string().max(45),

        nationality: Joi.string().max(45),

        passport_picture_url: Joi.string().uri(),
        

        address_line1: Joi.string(),
        street: Joi.string().max(45),
        city: Joi.string().max(45),
        state: Joi.string().max(45),
        postal_code:Joi.string().regex(/^\d{5}|\d{6}$/).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.postal_code_msg.pattern,
        }),


        vehicle_type: Joi.string().max(45),
        image_url: Joi.string().uri(),
        plate_number: Joi.string().max(45),
        vehicle_model: Joi.string().max(45),
        license_number: Joi.string().max(45),
        license_image_url: Joi.string().uri(),
        insurance_number: Joi.string().max(45),
        insurance_image_url: Joi.string().uri(),

    }),

    dateSchema : Joi.object({
        start_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.start_date_msg.pattern,
        }),
        end_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.end_date_msg.pattern,
        }),

    }),

    customerSchema : Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        profile_picture_url: Joi.string().uri(),
        email: Joi.string().trim().max(45).email(),
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).messages({
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }).optional(),
        phone_no: Joi.string().trim().regex(/^\(?\d{10}$/).min(10).max(10).messages({
            "string.pattern.base":constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        city: Joi.string().max(45),
        state: Joi.string().max(45),
    }),

    addDriverFee : Joi.object({
        order_range_from: Joi.number().required(),
        order_range_to: Joi.number().allow(null, '').optional(),        
        fee: Joi.number().required(),        
    }),

    editDriverFee: Joi.object({
        fee_id:Joi.number().required(),
        order_range_from: Joi.number().optional(), 
        order_range_to: Joi.number().allow(null, '').optional(),        
        fee: Joi.number().optional(),        
    }),

    getDriverFeeById: Joi.object({
        fee_id:Joi.number().required(),       
    }),

    deleteDriverFee: Joi.object({
        fee_id:Joi.number().required(),       
    }),

    editRestaurantFee: Joi.object({
        restaurant_id: Joi.number().required(),
        percentage_fee:Joi.number().required(),
    }),

    hotspotSchema: Joi.object({
        name: Joi.string().trim().required(),
        //     regex(/^[a-zA-Z\s]+$/).max(45).messages({
        //     "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        // }),
        location: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),
        location_detail: Joi.string().required(),
        city: Joi.string().max(45).required(),
        state: Joi.string().max(45).required(),
        postal_code: Joi.string().max(45).required(),
        country: Joi.string().max(45).required(),
        dropoffs: Joi.array(),
        delivery_shifts: Joi.array()
            .items(
                Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
                    "string.pattern.base":constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
                }),
                Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
                    "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
                }),
                Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
                    "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
                }),
            ).length(3)
            .required(),
        
        restaurant_ids: Joi.array(),
        driver_ids: Joi.array(),
    }),

    restaurantSchema: Joi.object({
        restaurant_name: Joi.string().trim().required(),
        restaurant_image_url: Joi.string().trim().required(),
        owner_name: Joi.string().trim().required(),
        role: Joi.string().trim().required(),
        owner_email: Joi.string().trim().email().required(),
        owner_phone: Joi.string().trim().regex(/^\(?\d{10}$/).min(10).max(10).messages({
            "string.pattern.base":constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),       
        lat: Joi.number().required(),
        long:Joi.number().required(),
        address: Joi.string().required(),
        deliveries_per_shift: Joi.number().required(),
        cut_off_time: Joi.number().required(),
        working_hours_from: Joi.string().required(),
        working_hours_to: Joi.string().required(),
        order_type: Joi.number().required(),
        restaurant_category_ids: Joi.array().required(),
        agreement_doc_url: Joi.string().optional(),
        hotspot_location_ids: Joi.array(),
    }),

    restaurantIdSchema: Joi.object({
        restaurantId: Joi.number().required(),
    }),

    statusTypeSchema: Joi.object({
        restaurantId: Joi.number(),
    }),

    getDriverEarningDetails : Joi.object({
        driver_id: Joi.number().required(),
        page: Joi.number().required(),        
        page_size: Joi.number().required()      
    }),

    addNotification: Joi.object({
        title: Joi.string().required(), 
        description: Joi.string().required(),
        reciever_id: Joi.number().optional(),    
        type:  Joi.number().min(1).max(4).required(),   
    }),

    getNotificationDetails: Joi.object({
        notification_id: Joi.string().required() 
    }),

    deleteNotification: Joi.object({
        notification_id: Joi.string().required() 
    }),

    getStaticContentDetails: Joi.object({
        id: Joi.string().required() 
    }),

    updateStaticContent: Joi.object({
        id: Joi.string().required(),
        page_url: Joi.string().optional(),
        video_url: Joi.string().optional()
    }),

    addFaq: Joi.object({
        topic_id: Joi.number().optional(),
        topic_name: Joi.string().optional(),
        question: Joi.string().required(),
        answer: Joi.string().required()
    }),

    getFaqTopicById: Joi.object({
        topic_id: Joi.number().required(),
    }),

    editFaqTopic: Joi.object({
        topic_id: Joi.number().required(),
        topic_name: Joi.string().required(),
    }),

    deleteFaqTopic: Joi.object({
        topic_id: Joi.number().required(),
    }),

    getFaqQuestions: Joi.object({
        id: Joi.number().required() ,
        page: Joi.number().optional(),        
        page_size: Joi.number().optional()     
    }),

    getFaqQuestionById: Joi.object({
        id: Joi.number().required() ,   
    }),

    editFaqQuestion: Joi.object({
        id: Joi.number().required(),
        topic_id: Joi.number().required(),
        question: Joi.string().required(),
        answer: Joi.string().required()
    }),

    deleteFaqQuestion: Joi.object({
        id: Joi.number().required() ,   
    }),

      addBanner: Joi.object({
        name: Joi.string().required(),
        image_url: Joi.string().required(),
        order: Joi.number().required()
    }),

    editBanner: Joi.object({
        name: Joi.string().optional(),
        image_url: Joi.string().optional(),
        order: Joi.number().optional()
    }),

    getOrderDeliveryDetails: Joi.object({
        order_delivery_id: Joi.string().required(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrderDeliveries: Joi.object({
        search_key: Joi.string().allow(null, '').trim().optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().empty().trim().valid("Daily", "Weekly", "Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getPickupOrders: Joi.object({
        search_key: Joi.string().allow(null, '').optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().valid("Daily", "Weekly", "Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getRestaurantEarnings: Joi.object({
        search_key: Joi.string().allow(null, '').optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().valid("Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrdersByRestaurantIdAndDateRange: Joi.object({
        restaurant_id: Joi.number().required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().required(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getDriverEarnings: Joi.object({
        search_key: Joi.string().allow(null, '').optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().valid("Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrdersByDriverIdAndDateRange: Joi.object({
        driver_id: Joi.number().required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().required(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),


    getDriverListByHotspot: Joi.object({
        hotspot_location_id: Joi.number().required(),
    }),

    paymentDriver: Joi.object({
        payment_id: Joi.string().trim().required(),
        payment_mode:Joi.number().valid(1,2,3,4,5,6).required(),
    }),

    paymentRestaurant: Joi.object({
        payment_id: Joi.string().trim().required(),
        payment_mode:Joi.number().valid(1,2,3,4,5,6).required(),
    })
   
    
}



