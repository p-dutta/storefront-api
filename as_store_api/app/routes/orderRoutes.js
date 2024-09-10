const express = require("express");
const { orderValidationRules, assistedOrderValidationRules} = require("../dtos");
const {  validator, authJwt } = require("../middlewares");
const orderController = require("../controllers/orderController");

const router = express.Router();


router
    .route("/create")
    .post(
        orderValidationRules(),
        validator,
        authJwt.verifyAccessToken,
        orderController.createOrder,
    )
router
    .route("/get-all")
    .get(authJwt.verifyAccessToken,orderController.getAllOrder, validator)
router
    .route("/get-all/:id")
    .get(orderController.getOrder, validator)
router
    .route("/get-latest")
    .get(validator,  authJwt.verifyAccessToken, orderController.getLatestOrder)
router
    .route("/get-by-customer")
    .get(validator, authJwt.verifyAccessToken, orderController.getOrderByCustomer)

router
    .route("/check-duplicate-order")
    .post(
        orderValidationRules(),
        validator,
        authJwt.verifyAccessToken,
        orderController.checkDuplicateOrders,
    )


module.exports = router;
