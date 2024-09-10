const {body} = require('express-validator')
const {header} = require('express-validator')
const db = require("../models/sequelize");
const Company = db.company;

const setPinValidationRules = () => {

    /*body('json_string', 'Invalid json_string')
        // No message specified for isJSON, so use the default "Invalid json_string"
        .isJSON()
        .isLength({ max: 100 })
        // Overrides the default message when `isLength` fails
        .withMessage('Max length is 100 bytes');*/

    return [
        header('Authorization').notEmpty().withMessage('You are not authorized to make this request'),
        body('name').notEmpty().withMessage("Name is a required field").trim().escape(),
        body('emp_id').notEmpty().withMessage("Your ID No is required").trim().escape(),
        body('gender').notEmpty().withMessage("Gender is a required field"),
        body('pin', "Invalid PIN").notEmpty().withMessage('PIN is a required field')
            .trim().escape().isLength({min: 4, max: 4}).withMessage('Please enter a 4-digit PIN')
            .isNumeric().withMessage("PIN field only takes numeric values"),
        body('confirm_pin', "Invalid Input").notEmpty().withMessage('Confirm PIN field cannot be empty')
            .trim().escape().isLength({min: 4, max: 4}).withMessage('Please enter a 4-digit PIN')
            .isNumeric().withMessage("This field only takes numeric values")
            .custom((value, { req }) => {
                if (value !== req.body.pin) {
                    return Promise.reject("PINs don't match");
                } else {
                    return Promise.resolve();
                }
            }),
        body('company_id', "Invalid Company ID").optional()
            .trim().escape()
            .custom(async (companyId) => {
                /*const uuidv4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if(uuidv4Pattern.test(companyId)) {
                    const company = await Company.findByPk(companyId);
                    if (!company) {
                        return Promise.reject("Company does not exist");
                    } else {
                        return Promise.resolve();
                    }
                } else {
                    return Promise.reject("Invalid company");
                }*/

                const company = await Company.findByPk(companyId);
                if (!company) {
                    return Promise.reject("Company does not exist");
                } else {
                    return Promise.resolve();
                }


            })
    ]
}

module.exports = setPinValidationRules