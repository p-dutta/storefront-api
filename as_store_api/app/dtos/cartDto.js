const { body, header } = require('express-validator');
const db = require("../../db");


const cartValidationRules = () => {
    return [
        body('is_active').optional().trim().escape(),
        body('name', "Invalid cart").notEmpty().withMessage('cart name is required')
            .trim().escape().isLength({ min: 3, })
            .withMessage('cart name can not be too short')
    ]
}

module.exports = cartValidationRules