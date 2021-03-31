module.exports = {
  MESSAGES: {
    login_success: 'Login Success',
    sub_admin_added: "Sub admin added successfully",
    new_admin_added: "Admin added successfully",
    phone_already_registered: "An account with given phone number already exists",
    email_already_registered: "An account with given email already exists",
    email_phone_already_registered: "An account with given email or phone already exists",
    invalid_password: "Incorrect Password",
    invalid_email: "Incorrect Email",
    invalid_email_password:"Invalid email or password",
    deactivate_account: 'Your account has been de-activated by Admin. Please contact to admin',
    delete_account: 'Your account has been deleted by Admin. Please contact to admin',
    current_password_not_match: "Current Password Not matches with the existing one",
    request_validation_message: 'Invalid fields',
    verify_success: 'User verified successfully',
    token_missing: 'Token missing from header',
    user_not_found: 'An account with given info does not exist',
    invalid_otp: "Invalid OTP",
    expire_otp: "OTP expired, please resend the OTP",
    resend_otp_success: "OTP resend successfully",
    otp_updated_success: "OTP send successfully",
    otp_verified_success: "OTP verified successfully",
    invalid_field: "pass the proper fields",
    update_user_details: "User Details Updated Successfully",
    reset_password_success: "password reset successfully",
    password_change_success: "Password changed successfully",
    model_name_required: "please pass model name also",
    invalid_credentials: "Please enter Valid Email ID",
    bad_request: "Getting error, due to bad request",
    phone_not_verified: "Your phone number is not verified yet",
    logout_success: "You have successfully logged out",
    unauthorized_role: "Your role is unauthorized to perform this action",
    fetch_success: "List has been fetched successfully",
    data_success: "Data has been fetched successfully",
    acc_already_exists: "An account already exists with these credentials",
    password_miss_match: "Password & confirm password are not the same",
    invalid_passkey: "Invalid access passkey",
    enter_email: "Please enter your emailId",
    file_upload_error: "Error in uploding file/files",
    file_upload_success: "File has been uploaded successfully",
    action_success: "Status is updated successfully",
    industry_list: "Employers industry type list fetched successfully",
    employers_list: 'Employers lists',
    forget_pass_otp: "Password reset link has been sent to your registered email id",
    reset_pass_success: "Password reset successfully",
    invalid_email_token: "",
    success: 'Success',
    no_customers: "No customers found",
    no_customer: "customers not found with provided id",
    no_restaurant: "Restaurant not found with provided id",
    no_dish: "No Dish found",
    no_driver: "No driver found",
    no_order: "No order found",
    no_fee: "No fee found",
    no_hotspot:"No hotspot found",
    invalid_status: "Plese send a valid status",
    picture_upload_success: "Picture uploaded successfully",
    picture_upload_error: "Picture uploaded successfully",
    update_success: "Updated successfully",
    delete_success:"Deleted successfully",
  },

  code: {
    error_code: 400
  },

defaultServerResponse : {
  status: 400,
  success: false,
  message: ''
},
otp_expiry_time : 30*60*1000,
OFFSET_LIMIT : 10,
CUSTOM_JOI_MESSAGE : {
    password_msg : {
      min: "Password must have minimum 8 characters",
      max: "Password can not have more than 15 characters",
      base: "Password must be string",
      required: "Password is required",
      pattern: "Password must have 8-15 characters comprising one caps, one small, one number and one special character"
    },
    name_msg : {
      pattern: "Please enter a valid customer name"
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
    }
  },

}

