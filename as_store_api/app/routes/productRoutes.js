const express = require("express");
const {  validator, authJwt } = require("../middlewares");
const {productValidationRules} = require("../dtos");
const productController = require("../controllers/productController");

const router = express.Router();


// router
//     .route("/create")
//     .post(
//         productValidationRules(),
//         validator,
//         authJwt.verifyAccessToken,
//         productController.createProduct,
//     )
router
    .route("/get-all")
    .get(validator,authJwt.verifyAccessToken,productController.getAllProduct)
router
    .route("/get/:category_id")
    .get(validator,authJwt.verifyAccessToken,productController.getAllProductByCategory)

module.exports = router;