const { body, header } = require('express-validator');
const db = require("../../db");

const productValidationRules = () => {
    return [
        
        body('name', "Invalid Product").notEmpty().withMessage('Product name is required')
            .trim().escape().isLength({ min: 3, })
            .withMessage('product name can not be too short'),
        body('category_id').notEmpty().withMessage('Category id is required'),
        body('price').notEmpty().withMessage('Product price is required'),
        body('in_stock_amount').notEmpty().withMessage('Define the in_stock_amount of products in stock'),
        body('is_active').optional().trim().escape(),
        body('vat').optional().trim().escape(),
        body('mrp').optional().trim().escape(),
        body('unit').notEmpty().withMessage('Product unit is required').trim().escape(),
        body('unit_type').optional().trim().escape(),
        body('unit_amount').optional().trim().escape(),
        body('image_url').optional().trim().escape(),
        body('priority').optional().trim().escape(),
    ]
}

module.exports = productValidationRules