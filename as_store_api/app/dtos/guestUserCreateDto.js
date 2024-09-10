const {body, header} = require('express-validator')

const guestUserValidationRules = () => {
    return [
        header('timestamp').notEmpty().withMessage('Required field missing in request header').escape(),
        header('secret').notEmpty().withMessage('Required field missing in request header').escape(),
        header('platform').notEmpty().withMessage('Required field missing in request header').escape()
            .isIn(['android', 'ios']),
        body('device_token').optional().trim().escape(),
        body('ad_id').optional().trim().escape(),
        body('msisdn', "Invalid Phone Number").optional()
            .trim().escape().isLength({min: 11, max: 11})
            .withMessage('MSISDN must be 11 characters!').matches(/^(?:\+?88)?01[13-9]\d{8}$/),
    ]
}

module.exports = guestUserValidationRules