const {header} = require('express-validator')

const logoutValidationRules = () => {
    return [
        header('Authorization').notEmpty().withMessage('You are not authorized to make this request'),
    ]
}

module.exports = logoutValidationRules