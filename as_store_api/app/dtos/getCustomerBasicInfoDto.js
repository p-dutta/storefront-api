const {header} = require('express-validator')

const getCustomerBasicInfoValidationRules = () => {
    return [
        header('Authorization').notEmpty().withMessage('You are not authorized to make this request'),
    ]
}

module.exports = getCustomerBasicInfoValidationRules