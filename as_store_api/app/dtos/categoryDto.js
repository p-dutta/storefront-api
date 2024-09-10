const { body, header } = require('express-validator');
const db = require("../../db");


const categoryValidationRules = () => {
    return [
        body('is_active').optional().trim().escape(),
        body('name', "Invalid Category").notEmpty().withMessage('Category name is required')
            .trim().escape().isLength({ min: 3, })
            .withMessage('Category name can not be too short')
    ]
}

module.exports = categoryValidationRules