const utilityFunctions = require("../utils/utilityFunctions");
const constants = require("../constants");

/* function for validating the schema */
const validateObjectSchema= (data, schema) => {
    const result = schema.validate(data);
    if (result.error) {
        const errorDetails = result.error.details.map(value => {
            return {
                message: value.message,
                path: value.path
            };
        });
        return errorDetails;
    }
    return null;
};
    
module.exports = {

    /* function for validating the request body */
    validateBody : (schema) => {
        return (req, res, next) => {
            const error = validateObjectSchema(req.body, schema);
            if (error) {
            return utilityFunctions.errorResponse(res, error, constants.code.error_code, error[0].message.split('"').join(""))
            }
            return next();
        }
    },

    /* function for validating the request params */
    validateQueryParams: (schema) => {
        return (req, res, next) => {
            const error = validateObjectSchema(req.query, schema);
            if (error) {
            return utilityFunctions.errorResponse(res, error, constants.code.error_code, error[0].message.split('"').join(""))
            }
            return next();
        }
    },

    /* function for validating the request params */
    validateParams : (schema) => {
        return (req, res, next) => {
            const error = validateObjectSchema(req.params, schema);
            if (error) {
            return utilityFunctions.errorResponse(res, error, constants.code.error_code, error[0].message.split('"').join(""))
            }
            return next();
        }
    }

}

