module.exports = {
  MESSAGES: {
    log_in: "Logged in successfully",
    Cust_not_verified:"Customer's email id is not Verified.",
    login_success: 'Login Success',
    sub_admin_added: "Sub admin added successfully",
    new_admin_added: "Admin added successfully",
    phone_already_registered: "An account with given phone number already exists",
    email_already_registered: "An account with given email already exists",
    email_phone_already_registered: "An account with given email or phone already exists",
    invalid_password: "Incorrect Password",
    invalid_email: "Incorrect Email",
    invalid_email_password: "Invalid email or password",
    invalid_email_phone: "Invalid email or phone",
    invalid_phone: "Invalid phone",
    invalid_old_password:"Invalid old password",
    deactivate_account: 'Your account has been de-activated by Admin. Please contact to admin',
    delete_account: 'Your account has been deleted by Admin. Please contact to admin',
    current_password_not_match: "Current Password Not matches with the existing one",
    social_media_account: "You have registered with social media account,\nplease try login with social media buttons",
    social_media_account_already_registered:"Another social media account is already registered with same email,\nplease try login with other social media buttons",
    social_media_account_already_not_registered:"You have not registered with social media account,\nplease try login with email/phone and password",
    request_validation_message: 'Invalid fields',
    verify_success: 'User verified successfully',
    token_missing: 'Token missing from header',
    user_not_found: 'An account with given info does not exist',
    invalid_otp: "Invalid OTP",
    expire_otp: "OTP expired, please resend the OTP",
    error_occurred:"Some Error Occurred",
    resend_otp_success: "OTP resend successfully",
    otp_updated_success: "OTP send successfully",
    otp_verified_success: "OTP verified successfully",
    invalid_field: "Pass the proper fields",
    update_user_details: "User Details Updated Successfully",
    reset_password_success: "password reset successfully",
    password_change_success: "Password changed successfully",
    model_name_required: "please pass model name also",
    invalid_credentials: "Please enter Valid Email ID",
    bad_request: "Getting error, due to bad request",
    phone_not_verified: "Your phone number is not verified yet",
    phone_already_verified: "Phone number is already verified",
    email_not_verified: "Your email is not verified yet",
    verification_code_sent: "Verification code is sent",
    verification_code_sent_error:"Error in code is sending",
    logout_success: "You have successfully logged out",
    fetch_success: "List has been fetched successfully",
    data_success: "Data has been fetched successfully",
    driver_phone_already_exists: "Driver with the same phone already exists",
    driver_email_already_exists: "Driver with the same email already exists",
    password_miss_match: "Password & confirm password are not the same",
    invalid_passkey: "Invalid access passkey",
    enter_email: "Please enter your emailId",
    file_upload_error: "Error in uploding file/files",
    file_upload_success: "File has been uploaded successfully",
    action_success: "Status is updated successfully",
    forget_pass_otp: "Password reset otp has been sent to your registered email id",
    reset_pass_success: "Password reset successfully",
    invalid_email_token: "",
    success: 'Success',
    no_customers: "No customers found",
    no_customer: "customers not found with provided id",
    no_restaurant: "No restaurant found",
    no_dish: "No Dish found",
    no_current_pickup: "No pickup assigned today",
    no_current_delivery: "No delivery assigned today",
    no_driver: "No driver found",
    no_order: "No order found",
    no_fee: "No fee found",
    no_hotspot: "No hotspot found",
    no_dropoff: "No dropoff found",
    no_address: "No address found",
    no_item: "No item found",
    no_payment: "No payment details found",
    no_static_content: "No static content found",
    no_dish_addon: "No dish addon found",
    no_quick_filter: "No quick filter found",
    no_notification: "No notification found",
    confirm_payment: "Payment confirmed",
    no_payment_card: "No payment card found",
    no_record: "No record found",
    send_otp_error: "Error in sending OTP. Please verify contact number.",
    send_otp_success:"OTP resent successfully.",
    payment_card_already_exist: "Payment card wth same card number already exist",
    invalid_status: "Plese send a valid status",
    picture_upload_success: "Uploaded successfully",
    picture_upload_error: "Picture uploaded successfully",
    update_success: "Updated successfully",
    delete_success: "Deleted successfully",
    only_pickup_available: "Sorry! Only pickups available in your area.",
    invalid_id: 'Invalid id',
    no_faq: 'No FAQ found',
    no_faq_topic: 'No FAQ topic found',
    faq_topic_already_exist:'FAQ topic with the same name already exist',
    invalid_id_or_phone: 'Invalid id or phone',
    order_sequence_exist: 'A banner on same sequence already exist',
    invalid_email_or_phone: 'Invalid id or phone number.',
    not_approved: 'Your account is not approved by admin',
    rejected_account: 'Your account is rejected by admin.',
    driver_invalid_phone: 'Invalid phone number.',
    hotspot_can_not_delete: "This hotspot can not be deleted until atleast one restaurant is associated with this hotspot",
    driver_fee_error_1:`Only one 'Last Range' value can be empty at a time`,
    driver_fee_error_2: `If the existing or new 'End Range' value is empty then its 'Start Range' value must be the highest range value`,
    driver_fee_error_3: `'Start Range' value must be less than 'End Range' value`,
    driver_fee_error_4: `'The 'start range' value or 'end range' value must not belong to an existing range`,
    driver_fee_error_5: `Driver fee already exists`,
    driver_fee_error_6: `The first range must have 0 as the 'start range' value`,
    driver_fee_error_7: `There must be at least one range whose 'start range' value is 0`,
    payment_already_done: `This payment is already completed`,
    card_not_belongs_to_you: `This card is not belongs to you`,
    application_sent_success: `Email application sent successfully`,
    invalid_current_order: "Current order does not match banner current order",
    no_tip: "No tip found",
    feedback_success: "Feedback sent successfully.",
    no_driver_account: "No driver account found with this phone number",
    driver_profile_update_success: `Profile updated successfully`,
    pickup_already_done: 'This pickup already done.',
    delivery_already_done: 'This delivery already done.',
    no_pickup: 'No pickup found.',
    no_delivery: 'No delivery found.',
    
  },

  code: {
    error_code: 400,
    bad_request: 404
  },

defaultServerResponse : {
  status: 400,
  success: false,
  message: ''
},
otp_expiry_time : 60,
OFFSET_LIMIT : 10,
ORDER_STATUS: {
  not_paid: 0,
  pending: 1,
  food_being_prepared: 2,
  food_ready_or_on_the_way: 3,
  delivered: 4
},
ORDER_TYPE: {
 delivery: 1,
 pickup: 2,
 both: 3
},
CUSTOM_JOI_MESSAGE : {
    password_msg : {
      min: "Password must have minimum 8 characters",
      max: "Password can not have more than 15 characters",
      base: "Password must be string",
      required: "Password is required",
      pattern: "Password must have 8-15 characters comprising one caps, one small, one number and one special character",
      customer_pattern: "Password must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special (!@#$%^&*) character"
    },
    name_msg : {
      pattern: "Please enter a valid name"
    },
    country_code_msg : {
      pattern: "Please enter a valid country code"
    },
    phone_no_msg : {
      pattern: "Please enter a valid phone no"
    },
    dob_msg : {
      pattern: "Please enter a valid date of birth format: DD-MM-YYYY"
    },
    postal_code_msg : {
      pattern: "Please enter a valid postal code"
    },
    start_date_msg : {
        pattern: "Please enter a valid start date format: YYYY-MM-DD"
    },
    end_date_msg : {
        pattern: "Please enter a valid end date format: YYYY-MM-DD"
    },
    delivery_shifts_msg : {
      pattern: "Please enter a valid time for delivery shift eg: [HH:MM:SS,HH:MM:SS,HH:MM:SS]"
    },
    card_no_msg : {
      pattern: "Please enter a valid card number"
    },
    card_exp_month_msg : {
      pattern: "Please enter a valid card expiry month"
    },
    card_exp_year_msg : {
      pattern: "Please enter a valid card expiry year"
    },
    card_cvc_msg : {
      pattern: "Please enter a valid card cvc"
    }
    
  },

  NOTIFICATION_TYPE: {
    all_user: 1,
    driver_only: 2,
    customer_only: 3,
    restaurant_only: 4,
    order_confirmed: 5,
    order_driver_allocated_or_confirmed_by_restaurant: 6,
    order_on_the_way: 7,
    order_delivered:8,  
    
  },

  STATUS : {
    inactive: 0,
    active: 1,
    deleted: 2,
  },

  PAYMENT_STATUS : {
    not_paid: 0,
    paid: 1,
  },

  DRIVER_ORDER_STATUS : {
    pickedup: 1,
    delivered: 2,
  },

  NOTIFICATION_STATUS : {
    off: 0,
    on: 1,
  },


  
  DRIVER_APPROVAL_STATUS : {
    pending: 0,
    approved: 1,
    rejected:2,
  },

  FEE_TYPE : {
    driver: 1,
    restaurant: 2,
    hotspot:3,
  },
  

  STATIC_CONTENT_TYPE : {
    terms_and_conditions: 1,
    privacy_policy: 2,
    customer_how_it_works: 3,
    driver_how_it_works: 4,
    about_us: 5,
    faq: 6,
    became_a_hotspot: 7,
    accessibility_statement: 8,
    customer_community_guidelines:9,
    restricted_product_list:10,
    driver_guidelines:11,
    contact_us:12,
  },

  STRIPE_PAYMENT_TYPE : {
    customer: 1,
    admin_driver: 2,
    admin_restaurant:3,
  },

  DRIVER_SIGNUP_COMPLETE_STATUS : {
    no: 0,
    yes: 1
  },

  PICKUP_STATUS : {
    pending: 0,
    done: 1
  },

  DELIVERY_STATUS : {
    pending: 0,
    done: 1
  },

}

