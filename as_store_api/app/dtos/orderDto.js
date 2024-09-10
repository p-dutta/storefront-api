const { body, header } = require('express-validator');
const db = require("../../db");

const orderValidationRules = () => {
    return [

        body('billing_address', "Invalid Address").notEmpty().withMessage('Billing Address is required')
            .trim().escape().isLength({ min: 3, })
            .withMessage('Billing Address can not be too short'),
        body('product_id').optional().trim().escape(),
        body('is_paid').optional().trim().escape(),
        body('is_delivered').optional().trim().escape(),
        body('delivered_by').optional().trim().escape(),
        body('vat').optional().trim().escape(),
        body('payment_method').optional().trim().escape(),
    ]
}


const assistedOrderValidationRules = () => {
    return [

        body('billing_address', "Invalid Address").notEmpty().withMessage('Billing Address is required')
            .trim().escape().isLength({ min: 3, })
            .withMessage('Billing Address can not be too short'),
        body('product_id').optional().trim().escape(),
        body('is_paid').optional().trim().escape(),
        body('is_delivered').optional().trim().escape(),
        body('delivered_by').optional().trim().escape(),
        body('vat').optional().trim().escape(),
        body('payment_method').optional().trim().escape(),
        /*body('uid').optional().trim().escape().if(body('uuid').exists())
            .isUUID(4).withMessage('Invalid Customer Information'),*/
        body('uid').notEmpty().withMessage('UID is required')
            .trim().escape().isUUID(4).withMessage('Invalid Customer Information'),
    ]
}

module.exports = {orderValidationRules, assistedOrderValidationRules}