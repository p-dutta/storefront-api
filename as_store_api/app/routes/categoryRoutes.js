const express = require("express");
const {  validator } = require("../middlewares");
const {categoryValidationRules} = require("../dtos");
const categoryController = require("../controllers/categoryController");

const router = express.Router();


router
    .route("/create")
    .post(
        categoryValidationRules(),
        validator,
        categoryController.createCategory,
    )
router
    .route("/get-all")
    .get(categoryController.getAllCategory, validator)
router
    .route("/get-all/:id")
    .get(categoryController.getCategory, validator)
    
module.exports = router;