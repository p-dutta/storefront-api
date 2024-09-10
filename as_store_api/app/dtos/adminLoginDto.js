const { body, header } = require('express-validator');

const adminLoginValidationRules = () => {
    return [
        header('timestamp').notEmpty().withMessage('Required field missing in request header').escape(),
        header('secret').notEmpty().withMessage('Required field missing in request header').escape(),
        body('username', "Invalid Username").notEmpty().withMessage('Username is required')
            .trim().escape(),
        // Update the password validation as needed. Below is an example.
        body('password', "Invalid Password").notEmpty().withMessage('Please enter your password')
            .trim().escape().isLength({ min: 6 }).withMessage('Password must be at least 8 characters long')
    ]
}

module.exports = adminLoginValidationRules;