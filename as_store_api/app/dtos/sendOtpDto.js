const {body} = require('express-validator')
const {header} = require('express-validator')

const sendOtpValidationRules = () => {
    return [
        header('timestamp').notEmpty().withMessage('Required field missing in request header').escape(),
        header('secret').notEmpty().withMessage('Required field missing in request header').escape(),
        body('msisdn', "Invalid Phone Number").notEmpty().withMessage('MSISDN is required')
            .trim().escape().isLength({min: 11, max: 11}).withMessage('MSISDN must be 11 characters!')
            .matches(/^(?:\+?88)?01[13-9]\d{8}$/),

    ]
}

module.exports = sendOtpValidationRules