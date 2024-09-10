const express = require("express");
const userController = require("../controllers/userController");
const { authJwt, validator } = require("../middlewares");
const {
    bpUserSearchValidationRules, assistedOrderValidationRules, orderValidationRules,
} = require("../dtos");
const orderController = require("../controllers/orderController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const campaignTargetController = require("../controllers/campaignTargetController");

const router = express.Router();


router
  .route("/search-user")
  .post(
    bpUserSearchValidationRules(),
    validator,
    authJwt.bpEitherAccessMiddleware,
    userController.searchUser
  );


router
    .route("/search-user-dynamic")
    .post(
        bpUserSearchValidationRules(),
        validator,
        authJwt.bpEitherAccessMiddleware,
        userController.searchUserDynamic
    );

router
    .route("/assited-order/create")
    .post(
        assistedOrderValidationRules(),
        validator,
        authJwt.verifyBpOrderAccess,
        orderController.createAssistedOrder,
    )


router
    .route("/get-latest-order")
    .get(
        authJwt.verifyBpOrderAccess,
        orderController.getLatestOrderBP,
    )


/*router
    .route("/orders/get-by-company")
    .get(
        authJwt.bpEitherAccessMiddleware,
        orderController.getBpOrdersByCompany,
    )*/


router
    .route("/orders/get-by-company")
    .get(
        authJwt.bpEitherAccessMiddleware,
        orderController.getBpOrdersByCompany,
    )


router
    .route("/orders/get-by-company-campaign")
    .get(
        authJwt.bpEitherAccessMiddleware,
        orderController.getBpOrdersByCompanyCampaign,
    )


router
    .route("/orders/get-self-orders")
    .get(
        authJwt.verifyBpOrderAccess,
        orderController.getBpOrdersSelf,
    )


router
    .route("/orders/change-status")
    .post(
        authJwt.bpEitherAccessMiddleware,
        orderController.updateOrderStatus,
    )


router
    .route("/orders/check-duplicate-order")
    .post(
        assistedOrderValidationRules(),
        validator,
        authJwt.verifyBpOrderAccess,
        orderController.checkDuplicateOrdersPerDay,
    )


router
    .route("/orders/update")
    .post(
        authJwt.verifyBpDeliveryAccess,
        orderController.updateOrder,
    )


//Products

router
    .route("/products/get-all")
    .get(validator,authJwt.bpEitherAccessMiddleware,productController.getAllProduct)
router
    .route("/products/get/:category_id")
    .get(validator,authJwt.bpEitherAccessMiddleware,productController.getAllProductByCategory)


// Cart

router
    .route("/cart/create")
    .post(
        authJwt.verifyBpOrderAccess,
        cartController.createCart,
    )
router
    .route("/cart/get-all")
    .get(authJwt.verifyBpOrderAccess, cartController.getAllCart)
router
    .route("/cart/get-cart")
    .get(authJwt.verifyBpOrderAccess,cartController.getCart)


// Delivery Campaign Target

router
    .route("/campaign/target-metrics")
    .get(
        authJwt.verifyBpOrderAccess,
        campaignTargetController.getCampaignTargetMetrics,
    )


module.exports = router;