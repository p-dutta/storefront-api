const {body} = require('express-validator')
const {header} = require('express-validator')

const loginWithPinValidationRules = () => {

    /*body('json_string', 'Invalid json_string')
        // No message specified for isJSON, so use the default "Invalid json_string"
        .isJSON()
        .isLength({ max: 100 })
        // Overrides the default message when `isLength` fails
        .withMessage('Max length is 100 bytes');*/

    return [
        header('timestamp').notEmpty().withMessage('Required field missing in request header').escape(),
        header('secret').notEmpty().withMessage('Required field missing in request header').escape(),
        body().custom((value, { req }) => {
            if (!('msisdn' in req.body) && !('shera_id' in req.body)) {
                //throw new Error('Either "msisdn" or "shera_id" must be present in the request body');
                return Promise.reject("Either 'msisdn' or 'shera_id' must be present in the request body");
            }
            if ('msisdn' in req.body && 'shera_id' in req.body) {
                return Promise.reject("Both 'msisdn' and 'shera_id' cannot exist together in the request body");
            }
            return Promise.resolve();
        }),
        body('msisdn', "Invalid Phone Number").optional().trim().escape()
            .isLength({min: 11, max: 11}).withMessage('MSISDN must be 11 characters!')
            .matches(/^(?:\+?88)?01[13-9]\d{8}$/),
        body('shera_id', "Invalid ID").optional().trim().escape()
            .isLength({min: 7, max: 7}).withMessage('Invalid ID')
            .matches(/^[a-z]\d{6}$/)
            //.withMessage('ID must start with a lowercase alphabet and end with 6 digits'),
            .withMessage('Invalid ID'),

        body('pin', "Invalid PIN").notEmpty().withMessage('Please enter your PIN')
            .trim().escape().isLength({min: 4, max: 4}).withMessage('Please enter a 4-digit PIN')
            .isNumeric().withMessage("PIN field only takes numeric values")
    ]
}

module.exports = loginWithPinValidationRules