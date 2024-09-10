const express = require("express");
const {  validator, authJwt } = require("../middlewares");
const {cartValidationRules} = require("../dtos");
const cartController = require("../controllers/cartController");

const router = express.Router();


router
    .route("/create")
    .post(
        // cartValidationRules(),
        // validator,
        authJwt.verifyAccessToken,
        cartController.createCart,
    )
router
    .route("/get-all")
    .get(authJwt.verifyAccessToken,cartController.getAllCart, )
router
    .route("/get-cart")
    .get(authJwt.verifyAccessToken,cartController.getCart)

module.exports = router;