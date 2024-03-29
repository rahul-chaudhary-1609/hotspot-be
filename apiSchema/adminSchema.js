const Joi = require("joi");
const constants = require("../constants");


module.exports = {
    login : Joi.object({
        email: Joi.string()
            // .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
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
        role: Joi.number().valid(1,2).required(),
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
        markup_price: Joi.number().optional(),
        description: Joi.string().required(),
        restaurant_dish_category_id: Joi.number().required(),
        image_url: Joi.string().uri().allow('',null).optional(),
        is_recommended: Joi.number().optional(),
        is_quick_filter: Joi.number().optional(),
    }),

    listDishes: Joi.object({
        restaurant_dish_category_id: Joi.number().required(),
        search_key: Joi.string().allow(null, '').optional(),
        page: Joi.number().required(),        
        page_size: Joi.number().required()
    }),

    getDish: Joi.object({
        dishId: Joi.number().required(),
    }),

    editDish : Joi.object({
        dishId: Joi.number().required(),
        restaurant_dish_category_id: Joi.number().required(),
        name: Joi.string().trim().required(),
        price: Joi.number().required(),
        markup_price: Joi.number().optional(),
        description: Joi.string().required(),
        image_url: Joi.string().uri().allow('',null).optional(),
        is_recommended: Joi.number().optional(),
        is_quick_filter: Joi.number().optional(),
    }),


    deleteDish : Joi.object({
        dishId: Joi.number().required(),
    }),

    toggleDishStatus : Joi.object({
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
        markup_price: Joi.number().optional(),
        image_url: Joi.string().uri().optional(),
        dish_add_on_section_id: Joi.number().required(),
    }),

    listDishAddon: Joi.object({
        dish_add_on_section_id: Joi.number().required(),
        is_pagination: Joi.number().optional(),
        search_key: Joi.string().allow(null, '').optional(),
        page: Joi.number().optional(),        
        page_size: Joi.number().optional()
    }),

    getDishAddon: Joi.object({
        dish_addon_id: Joi.number().required(),
    }),

    editDishAddon: Joi.object({
        dish_addon_id: Joi.number().required(),
        // dish_add_on_section_id: Joi.number().required(),
        name: Joi.string().trim().optional(),
        price: Joi.number().optional(),
        markup_price: Joi.number().optional(),
        image_url: Joi.string().uri().optional(),
        dish_add_on_section_id: Joi.number().optional(),
    }),


    deleteDishAddon : Joi.object({
        dish_addon_id: Joi.number().required(),
    }),

    toggleDishAddonStatus : Joi.object({
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
        postal_code:Joi.string().regex(/^\d{5,6}$/).messages({
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

    listDriver: Joi.object({
        is_pagination: Joi.number().optional(),
        searchKey: Joi.string().allow(null, '').trim().optional(),
        page: Joi.number().optional(),        
        page_size: Joi.number().optional() 
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

    addHotspot: Joi.object({
        name: Joi.string().trim().required(),
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
            ).required(),
        
        restaurant_ids: Joi.array().items(Joi.object().keys({
            restaurant_id: Joi.number().required(),
            pickup_time: Joi.number().required(),
            available_for_shifts:Joi.array().required(),
        })).optional(),
        driver_ids: Joi.array(),
    }),

    editHotspot: Joi.object({
        hotspotLocationId:Joi.number().required(),
        name: Joi.string().trim().optional(),
        location: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).optional(),
        location_detail: Joi.string().optional(),
        city: Joi.string().max(45).optional(),
        state: Joi.string().max(45).optional(),
        postal_code: Joi.string().max(45).optional(),
        country: Joi.string().max(45).optional(),
        dropoffs: Joi.array().optional(),
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
            ).optional(),
        
        restaurant_ids: Joi.array().items(Joi.object().keys({
            restaurant_id: Joi.number().required(),
            pickup_time: Joi.number().required(),
            available_for_shifts:Joi.array().required(),
        })).optional(),
        driver_ids: Joi.array().optional(),
    }),

    listHotspot: Joi.object({
        is_pagination: Joi.number().optional(),
        page: Joi.number().optional(),        
        page_size: Joi.number().optional(),
    }),

    getHotspot: Joi.object({
        hotspotLocationId:Joi.number().required(),
    }),

    deleteHotspot: Joi.object({
        hotspotLocationId:Joi.number().required(),
    }),

    toggleHotspotAvailibility: Joi.object({
        hotspotLocationId:Joi.number().required(),
    }),

    addRestaurant: Joi.object({
        restaurant_name: Joi.string().trim().required(),
        restaurant_image_url: Joi.string().trim().allow(null, '').optional(),
        owner_name: Joi.string().trim().required(),
        role: Joi.string().trim().allow(null, '').optional(),
        owner_email: Joi.string().trim().email().required(),
        owner_phone: Joi.string().trim().required(),
        location: Joi.array().required(),
        address: Joi.string().required(),
        deliveries_per_shift: Joi.number().required(),
        cut_off_time: Joi.number().required(),
        working_hours_from: Joi.string().required(),
        working_hours_to: Joi.string().required(),
        order_type: Joi.number().required(),
        agreement_doc_url: Joi.string().allow(null, '').optional(),
        agreement_documents: Joi.array().allow(null).optional(),
        stripe_publishable_key:Joi.string().trim().allow(null, '').optional(),
        stripe_secret_key: Joi.string().trim().allow(null, '').optional(),
        online_payment: Joi.number().optional(),
        dish_preference: Joi.number().optional(),
        percentage_fee: Joi.number().optional(),
    }),

    editRestaurant: Joi.object({
        restaurantId:Joi.number().required(),
        restaurant_name: Joi.string().trim().optional(),
        restaurant_image_url: Joi.string().trim().allow(null, '').optional(),
        owner_name: Joi.string().trim().optional(),
        role: Joi.string().trim().allow(null, '').optional(),
        owner_email: Joi.string().trim().email().optional(),
        owner_phone: Joi.string().trim().optional(),
        location: Joi.array().optional(),
        address: Joi.string().optional(),
        deliveries_per_shift: Joi.number().optional(),
        cut_off_time: Joi.number().optional(),
        working_hours_from: Joi.string().optional(),
        working_hours_to: Joi.string().optional(),
        order_type: Joi.number().optional(),
        agreement_doc_url: Joi.string().allow(null, '').optional(),
        agreement_documents: Joi.array().allow(null).optional(),
        stripe_publishable_key:Joi.string().trim().allow(null, '').optional(),
        stripe_secret_key: Joi.string().trim().allow(null, '').optional(),
        online_payment: Joi.number().optional(),
        dish_preference: Joi.number().optional(),
        percentage_fee: Joi.number().optional(),
    }),

    listRestaurant: Joi.object({
        is_pagination: Joi.number().optional(),
        searchKey: Joi.string().allow(null, '').trim().optional(),
        page: Joi.number().optional(),     
        page_size: Joi.number().optional(), 
    }),

    getRestaurant: Joi.object({
        restaurantId: Joi.number().required(),
    }),

    toggleRestaurantStatus: Joi.object({
        restaurantId: Joi.number().required(),
    }),

    deleteRestaurant: Joi.object({
        restaurantId: Joi.number().required(),
    }),


    getDriverEarningDetails : Joi.object({
        driver_id: Joi.number().required(),
        page: Joi.number().required(),        
        page_size: Joi.number().required()      
    }),

    addNotification: Joi.object({
        title: Joi.string().required(), 
        description: Joi.string().required(),
        receiver_id: Joi.number().optional(),    
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
        id: Joi.string().optional(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        page_url: Joi.string().optional(),
        video_url: Joi.string().optional(),
        type: Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13).optional(),
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
    }),

    editBanner: Joi.object({
        name: Joi.string().optional(),
        image_url: Joi.string().optional(),
    }),

    getOrderDeliveryDetails: Joi.object({
        order_delivery_id: Joi.string().required(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrderDeliveries: Joi.object({
        current_date:Joi.string().required(),
        search_key: Joi.string().allow(null, '').trim().optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().empty().trim().valid("Daily", "Weekly", "Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getPickupOrders: Joi.object({
        current_date:Joi.string().required(),
        search_key: Joi.string().allow(null, '').optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().valid("Daily", "Weekly", "Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    generateRestaurantEarnings: Joi.object({
        datetime:Joi.string().required(),
    }),

    generateRestaurantOrderEmail: Joi.object({
        payment_id:Joi.string().required(),
    }),

    getRestaurantEarnings: Joi.object({
        current_date:Joi.string().required(),
        search_key: Joi.string().allow(null, '').optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().valid("Daily", "Weekly","Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrdersByRestaurantIdAndDateRange: Joi.object({
        restaurant_payment_id: Joi.string().required(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getDriverEarnings: Joi.object({
        current_date:Joi.string().required(),
        search_key: Joi.string().allow(null, '').optional(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        filter_key: Joi.string().valid("Monthly", "Yearly").allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrdersByDriverIdAndDateRange: Joi.object({
        driver_payment_id: Joi.string().required(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),


    getDriverListByHotspot: Joi.object({
        hotspot_location_id: Joi.number().required(),
    }),

    paymentDriver: Joi.object({
        payment_id: Joi.string().trim().required(),
        card_number: Joi.string().trim().min(12).max(19).regex(/^\d{12,19}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_no_msg.pattern,
        }),
        card_exp_month: Joi.string().trim().min(2).max(2).regex(/^\d{2}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_month_msg.pattern,
        }),
        card_exp_year: Joi.string().trim().min(4).max(4).regex(/^\d{4}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_year_msg.pattern,
        }),
        card_cvc: Joi.string().trim().min(3).max(4).regex(/^\d{3,4}$/).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_cvc_msg.pattern,
        }).required(),
        amount: Joi.number(),
    }),

    paymentRestaurant: Joi.object({
        payment_id: Joi.string().trim().required(),
        card_number: Joi.string().trim().min(12).max(19).regex(/^\d{12,19}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_no_msg.pattern,
        }),
        card_exp_month: Joi.string().trim().min(2).max(2).regex(/^\d{2}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_month_msg.pattern,
        }),
        card_exp_year: Joi.string().trim().min(4).max(4).regex(/^\d{4}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_year_msg.pattern,
        }),
        card_cvc: Joi.string().trim().min(3).max(4).regex(/^\d{3,4}$/).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_cvc_msg.pattern,
        }).required(),
        amount: Joi.number(),
    }),
   
    driverPaymentSuccess: Joi.object({
        payment_type:Joi.number().required(),
        payment_id: Joi.string().trim().required(),
        payment_intent:Joi.object().optional(),
    }),

    restaurantPaymentSuccess: Joi.object({
        payment_type:Joi.number().required(),
        payment_id: Joi.string().trim().required(),
        payment_intent:Joi.object().optional(),
    }),

    updateBannerOrder: Joi.object({
        banner_id: Joi.number().required(),
        current_order: Joi.number().required(),
        new_order:Joi.number().required(),
    }),

    getTipById: Joi.object({
        tip_id: Joi.number().required(),
    }),

    editTip: Joi.object({
        tip_id: Joi.number().optional(),
        tip_amount:Joi.number().required(),
    }),
    
    getDriverPaymentDetails: Joi.object({
        payment_id: Joi.string().required(),
    }),

    getRestaurantPaymentDetails: Joi.object({
        payment_id: Joi.string().required(),
    }),

    addRestaurantDishCategory: Joi.object({
        name: Joi.string().required(),
        restaurant_id: Joi.number().required(),
        is_beverages:Joi.number().required(),
    }),

    editRestaurantDishCategory: Joi.object({
        category_id: Joi.number().required(),
        restaurant_id: Joi.number().required(),
        name: Joi.string().required(),
        is_beverages:Joi.number().required(),
    }),

    listRestaurantDishCategories: Joi.object({        
        restaurant_id: Joi.number().required(),
        search_key: Joi.string().allow(null, '').optional(),
        is_pagination: Joi.number().optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getRestaurantDishCategory: Joi.object({
        category_id: Joi.number().required(),
    }),

    deleteRestaurantDishCategory: Joi.object({
        category_id: Joi.number().required(),
    }),

    toggleRestaurantDishCategoryStatus: Joi.object({
        category_id: Joi.number().required(),
    }),

    addDishAddOnSection: Joi.object({
        name: Joi.string().required(),
        restaurant_dish_id: Joi.number().required(),
        is_required: Joi.number().required(),  
        is_multiple_choice: Joi.number().required(),        
    }),

    editDishAddOnSection: Joi.object({
        section_id: Joi.number().required(),
        restaurant_dish_id: Joi.number().required(),
        name: Joi.string().required(),
        is_required: Joi.number().optional(),  
        is_multiple_choice: Joi.number().optional(), 
    }),

    listDishAddOnSections: Joi.object({        
        restaurant_dish_id: Joi.number().required(),
        search_key: Joi.string().allow(null, '').optional(),
        is_required: Joi.number().optional(),  
        is_multiple_choice: Joi.number().optional(),
        is_pagination: Joi.number().optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getDishAddOnSection: Joi.object({
        section_id: Joi.number().required(),
    }),

    deleteDishAddOnSection: Joi.object({
        section_id: Joi.number().required()
    }),

    toggleDishAddOnSectionStatus: Joi.object({
        section_id: Joi.number().required()
    }),

    getTaxById: Joi.object({
        tax_id: Joi.number().required(),
    }),

    editTax: Joi.object({
        tax_id: Joi.number().optional(),
        name:Joi.string().required(),
        variable_percentage:Joi.number().required(),
        fixed_amount:Joi.number().required(),
        description:Joi.string().optional(),
        type:Joi.number().valid(0,1,2).required(),
    }),

    getSiteStatistics:Joi.object({
        current_date: Joi.string().required(),
        hotspot_id:Joi.number().optional(),
    }),

    getOrderStatistics:Joi.object({
        current_date: Joi.string().required(),
        hotspot_id:Joi.number().optional(),
    }),

    getOrderStats:Joi.object({
        current_date: Joi.string().required(),
    }),

    getRevenueStats:Joi.object({
        current_date: Joi.string().required(),
    }),

    getActiveOrders:Joi.object({
        current_date: Joi.string().required(),
        searchKey: Joi.string().allow(null, '').optional(),
        status_filter: Joi.string().optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getScheduledOrders:Joi.object({
        current_date: Joi.string().required(),
        searchKey: Joi.string().allow(null, '').optional(),
        status_filter: Joi.string().optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getCompletedOrders:Joi.object({
        searchKey: Joi.string().allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrderDetails:Joi.object({
        orderId: Joi.string().required(),
    }),

    assignDriver:Joi.object({
        orderId: Joi.string().required(),
        driverId: Joi.number().required(),
    }),

    bulkAssignDriver:Joi.object({
        restaurant_payment_id: Joi.string().required(),
        driverId: Joi.number().required(),
    }),
    
    listOrderPayments:Joi.object({
        search_key: Joi.string().allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getOrderPaymentDetails:Joi.object({
        payment_id: Joi.string().required(),
    }),

    refund:Joi.object({
        type:Joi.number().required(),
        order_details:Joi.object().required(),
        transaction_reference_id:Joi.string().required(),
        refund_amount:Joi.number().required(),
        payment_id:Joi.string().required(),
        dispute_id:Joi.string().allow(null, '').optional(),
        driver_id:Joi.string().allow(null, '').optional(),
        datetime:Joi.string().required(),
        admin_comment:Joi.string().allow(null, '').optional(),
        refund_type:Joi.number().required(),
    }),

    listRefunds:Joi.object({
        search_key: Joi.string().allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getRefundDetails:Joi.object({
        refund_id: Joi.string().required(),
    }),

    listRefundHistory:Joi.object({
        search_key: Joi.string().allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getRefundHistoryDetails:Joi.object({
        customer_id: Joi.number().required(),
    }),

    listDisputes:Joi.object({
        search_key: Joi.string().allow(null, '').optional(),
        page: Joi.number().allow(null, '').optional(),
        page_size: Joi.number().allow(null, '').optional(),
    }),

    getDisputeDetails:Joi.object({
        dispute_id: Joi.string().required(),
    }),

    changeDisputeStatus:Joi.object({
        dispute_id: Joi.string().required(),
        status:Joi.number().valid(1,2,3).allow(null, '').optional(),
        result:Joi.number().valid(0,1,2,3).allow(null, '').optional(),
        admin_comment:Joi.string().allow(null,'').optional(),
    }),

    addPromotionalCredits:Joi.object({
        customer_ids: Joi.array().items(Joi.number().required()).required(),
        hotspot_credit: Joi.number().required(),
        datetime:Joi.string().required(),
    }),

    editPromotionalCredits:Joi.object({
        customer_id: Joi.number().required(),
        action:Joi.number().valid(1,2).required(),
        hotspot_credit: Joi.number().required(),
        datetime:Joi.string().required(),
    }),

    listActiveCustomers: Joi.object({
        hotspotLocationId:Joi.number().required(),
    }),
}



