const {body} = require('express-validator')
const {header} = require('express-validator')

const verifyOtpValidationRules = () => {
    return [
        header('Authorization').notEmpty().withMessage('You are not authorized to make this request'),
        body('msisdn', "Invalid Phone Number").notEmpty().withMessage('MSISDN is required')
            .trim().escape().isLength({min: 11, max: 11}).withMessage('MSISDN must be 11 characters!')
            .matches(/^(?:\+?88)?01[13-9]\d{8}$/),
        body('otp').notEmpty().withMessage("Please enter the OTP you received"),
    ]
}

module.exports = verifyOtpValidationRules