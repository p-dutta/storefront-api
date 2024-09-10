const express = require("express");
const miscController = require("../controllers/miscController");
const staticProductController = require("../controllers/staticProductController");
const carouselController = require("../controllers/carouselController");
const {authJwt} = require("../middlewares");

const router = express.Router();


router
  .route("/get-genders")
  .get(
      miscController.getGenders
  );

router
    .route("/get-static-products")
    .get(
        authJwt.verifyAccessToken,
        staticProductController.getAllStaticProducts
    );


router
    .route("/get-all-banners")
    .get(
        carouselController.getAllCarousels
    );



module.exports = router;
