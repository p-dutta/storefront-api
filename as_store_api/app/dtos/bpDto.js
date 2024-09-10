const { body, header } = require('express-validator');

const bpUserSearchValidationRules = () => {
    return [
        header('Authorization').notEmpty().withMessage('You are not authorized to make this request'),
        body('company_ids').isArray().withMessage('Company IDs must be an array')
            .notEmpty().withMessage('Company IDs are required')
            .bail() // Stop running validations if the previous one has failed
            .custom((companyIds) => {
                return companyIds.every(id => /^\d+$/.test(id)); // Check if every ID is a number
            }).withMessage('All Company IDs must be numeric strings'),
        body('search_string', "Invalid Search String").notEmpty().withMessage('A search string is required')
            .trim().escape(),
    ]
}



module.exports = {bpUserSearchValidationRules};