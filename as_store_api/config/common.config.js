require('dotenv').config();

module.exports = {
    orderDays: process.env.DAYS_TO_CONSIDER_FOR_ORDER_REPORTING,
};