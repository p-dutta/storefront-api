const {body} = require('express-validator')
const {header} = require('express-validator')

const getNewTokenValidationRules = () => {
    return [
        header('Authorization').optional().trim().escape()
    ]
}

module.exports = getNewTokenValidationRules