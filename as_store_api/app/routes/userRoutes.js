const express = require("express");
const userController = require("../controllers/userController");
const { authJwt, validator } = require("../middlewares");
const {
  getCustomerBasicInfoValidationRules,
} = require("../dtos");

const router = express.Router();


router
  .route("/customer-basic-info")
  .get(
    getCustomerBasicInfoValidationRules(),
    validator,
    authJwt.verifyAccessToken,
    userController.customerBasicInfo
  );


router
  .route("/check-first-order-eligibility")
  .get(
    getCustomerBasicInfoValidationRules(),
    validator,
    authJwt.verifyAccessToken,
    userController.isEligibleForFirstOrder
  );


router
    .route("/delete-self")
    .delete(
        authJwt.verifyAccessToken,
        userController.deleteSelf
    );


module.exports = router;
